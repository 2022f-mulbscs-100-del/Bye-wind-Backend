const goLiveRepo = require('./go-live.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class GoLiveService {
  /**
   * Recalculate and return the current go-live status for a restaurant.
   */
  async getStatus(restaurantId) {
    const checklist = await goLiveRepo.findByRestaurant(restaurantId);
    if (!checklist) throw ApiError.notFound('Go-live checklist not found');

    const branchStatuses = await goLiveRepo.findBranchStatuses(restaurantId);

    // Recalculate completion percentage
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
      branchStatuses,
    };
  }

  /**
   * Attempt to go live — validates ALL mandatory steps are complete.
   */
  async activate(restaurantId, auditContext) {
    const status = await this.getStatus(restaurantId);

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
        data: { isLive: true, wentLiveAt: new Date() },
      }),
      prisma.restaurant.update({
        where: { id: restaurantId },
        data: { status: 'LIVE' },
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
