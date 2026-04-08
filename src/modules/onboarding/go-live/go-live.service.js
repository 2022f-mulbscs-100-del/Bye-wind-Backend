const goLiveRepo = require('./go-live.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class GoLiveService {
  /**
   * Recalculate and return the current go-live status for a restaurant.
   */
  async getStatus(restaurantId) {
    let checklist = await goLiveRepo.findByRestaurant(restaurantId);
    if (!checklist) {
      checklist = await prisma.goLiveChecklist.create({
        data: { restaurantId, restaurantProfileDone: true }
      });
    }

    const branchStatuses = await goLiveRepo.findBranchStatuses(restaurantId);
    
    // Self-healing: ensure flags are correct based on actual data
    const [staffCount, gatewayCount] = await Promise.all([
      prisma.staff.count({ where: { restaurantId } }),
      prisma.paymentGateway.count({ where: { restaurantId } })
    ]);

    const globalUpdates = {};
    if (staffCount > 0 && !checklist.staffSetupDone) globalUpdates.staffSetupDone = true;
    if (gatewayCount > 0 && !checklist.paymentConfiguredDone) globalUpdates.paymentConfiguredDone = true;

    if (Object.keys(globalUpdates).length > 0) {
      checklist = await goLiveRepo.update(restaurantId, globalUpdates);
    }

    const updatedBranchStatuses = [];

    // Self-heal each branch
    for (const bs of branchStatuses) {
      const branchId = bs.branchId;
      const [floorPlanCount, tableCount, hoursCount, policyCount, turnTimeCount, staffBranchCount] = await Promise.all([
        prisma.floorPlan.count({ where: { branchId, isActive: true } }),
        prisma.table.count({ where: { isActive: true, floorPlan: { branchId, isActive: true } } }),
        prisma.businessHours.count({ where: { branchId } }),
        prisma.reservationPolicy.count({ where: { branchId } }),
        prisma.turnTimeRule.count({ where: { branchId } }),
        prisma.staffBranch.count({ where: { branchId } })
      ]);

      // Self-heal: Create default policy/rules if missing
      if (policyCount === 0) {
        await prisma.reservationPolicy.create({
          data: { branchId, minPartySize: 1, maxPartySize: 20, advanceBookingDays: 30, sameDayCutoffMins: 60, autoConfirm: true }
        });
      }
      if (turnTimeCount === 0) {
        await prisma.turnTimeRule.create({
          data: { branchId, name: "Default", partySizeMin: 1, partySizeMax: 100, durationMins: 90, isDefault: true }
        });
      }

      const branchUpdates = {
        floorPlanDone: floorPlanCount > 0,
        tablesConfiguredDone: tableCount > 0,
        businessHoursDone: hoursCount > 0,
        reservationPolicyDone: true, // Now guaranteed
        turnTimesDone: true, // Now guaranteed
        staffSetupDone: staffBranchCount > 0
      };

      // Calculate branch percentage
      const branchFields = ['businessHoursDone', 'floorPlanDone', 'tablesConfiguredDone', 'reservationPolicyDone', 'turnTimesDone', 'staffSetupDone'];
      const branchCompleted = branchFields.filter(f => branchUpdates[f]).length;
      const branchPercentage = Math.round((branchCompleted / branchFields.length) * 100);
      branchUpdates.completionPercentage = branchPercentage;

      const updatedBs = await prisma.branchGoLiveStatus.update({
        where: { id: bs.id },
        data: {
          ...branchUpdates,
          staffSetupDone: undefined // We don't save it to DB yet as field might not exist, but we return it
        },
        include: { branch: { select: { id: true, name: true } } }
      });
      // Add the on-the-fly calculated staffSetupDone for the frontend
      updatedBranchStatuses.push({ ...updatedBs, staffSetupDone: branchUpdates.staffSetupDone });
    }

    // Recalculate restaurant completion percentage
    const fields = [
      'restaurantProfileDone', 'branchSetupDone', 'businessHoursDone',
      'floorPlanDone', 'tablesConfiguredDone', 'turnTimesDone',
      'reservationPolicyDone', 'staffSetupDone', 'paymentConfiguredDone',
      'communicationDone', 'brandingDone',
    ];
    
    const completed = fields.filter((f) => checklist[f]).length;
    const completionPercentage = Math.round((completed / fields.length) * 100);

    // Update the percentage
    await goLiveRepo.update(restaurantId, {
      completionPercentage,
      lastCheckedAt: new Date(),
    });

    return {
      ...checklist,
      completionPercentage,
      branchStatuses: updatedBranchStatuses,
    };
  }

  /**
   * Attempt to go live — validates ALL mandatory steps are complete.
   */
  async activate(restaurantId, branchId, auditContext) {
    const status = await this.getStatus(restaurantId);

    // If branchId is provided, check if that specific branch is ready
    if (branchId) {
      const branchStatus = status.branchStatuses?.find(s => s.branchId === branchId);
      if (!branchStatus) throw ApiError.notFound('Branch status not found');

      // Check restaurant-level globals (Payment, branding, comms)
      const globalMissing = [];
      if (!status.paymentConfiguredDone) globalMissing.push('Payment Gateway');
      if (!status.communicationDone) globalMissing.push('Communication Channels');
      if (!status.brandingDone) globalMissing.push('Branding');

      if (globalMissing.length > 0) {
        throw ApiError.badRequest(
          `Cannot activate branch. Restaurant-wide steps missing: ${globalMissing.join(', ')}`,
          globalMissing.map(m => ({ field: m, message: 'Required for all branches' }))
        );
      }

      // Check branch-specific steps
      if (branchStatus.completionPercentage < 100) {
        throw ApiError.badRequest('Cannot activate branch. Local setup (Hours, Floor, Rules) is incomplete.');
      }

      // Activate ONLY this branch
      await prisma.$transaction([
        prisma.branch.update({
          where: { id: branchId },
          data: { status: 'LIVE', isLive: true, isActive: true },
        }),
        prisma.branchGoLiveStatus.update({
          where: { branchId },
          data: { isReady: true },
        }),
        // Also ensure restaurant is marked as LIVE if this is the first branch
        prisma.restaurant.update({
          where: { id: restaurantId },
          data: { status: 'LIVE' },
        }),
        prisma.goLiveChecklist.update({
          where: { restaurantId },
          data: { isLive: true, wentLiveAt: status.wentLiveAt || new Date() },
        })
      ]);

      await createAuditLog({
        entity: 'Branch',
        entityId: branchId,
        action: 'STATUS_CHANGE',
        oldValue: { status: 'DRAFT' },
        newValue: { status: 'LIVE' },
        auditContext,
      });

      return { message: 'Branch is now LIVE! 🚀', branchId };
    }

    // Original logic for whole restaurant (if no branchId provided)
    if (status.completionPercentage < 100) {
      const missing = [];
      if (!status.restaurantProfileDone) missing.push('Restaurant Profile');
      if (!status.branchSetupDone) missing.push('Branch Setup');
      if (!status.businessHoursDone) missing.push('Business Hours');
      if (!status.floorPlanDone) missing.push('Floor Plan');
      if (!status.tablesConfiguredDone) missing.push('Table Configuration');
      if (!status.turnTimesDone) missing.push('Turn Time Rules');
      if (!status.reservationPolicyDone) missing.push('Reservation Policy');
      if (!status.staffSetupDone) missing.push('Staff Setup');
      if (!status.paymentConfiguredDone) missing.push('Payment Gateway');
      if (!status.communicationDone) missing.push('Communication Channels');
      if (!status.brandingDone) missing.push('Branding');

      throw ApiError.badRequest(
        `Cannot go live. Missing steps: ${missing.join(', ')}`,
        missing.map((m) => ({ field: m, message: 'Not completed' }))
      );
    }

    // All checks passed — go live!
    await prisma.$transaction([
      prisma.goLiveChecklist.update({
        where: { restaurantId },
        data: { isLive: true, wentLiveAt: status.wentLiveAt || new Date() },
      }),
      prisma.restaurant.update({
        where: { id: restaurantId },
        data: { status: 'LIVE' },
      }),
      prisma.branch.updateMany({
        where: { restaurantId },
        data: { status: 'LIVE', isLive: true, isActive: true },
      }),
    ]);

    await createAuditLog({
      entity: 'Restaurant',
      entityId: restaurantId,
      action: 'STATUS_CHANGE',
      oldValue: { status: 'DRAFT' },
      newValue: { status: 'LIVE' },
      auditContext,
    });

    return { message: 'Restaurant is now LIVE! 🎉', restaurantId };
  }
}

module.exports = new GoLiveService();
