const policyRepo = require('./reservation-policy.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class ReservationPolicyService {
  async createOrUpdate(data, auditContext) {
    const { branchId, ...policyData } = data;

    const policy = await policyRepo.upsertByBranch(branchId, policyData);

    await prisma.branchGoLiveStatus.updateMany({
      where: { branchId },
      data: { reservationPolicyDone: true },
    });

    const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { restaurantId: true } });
    if (branch) {
      await prisma.goLiveChecklist.update({
        where: { restaurantId: branch.restaurantId },
        data: { reservationPolicyDone: true },
      });
    }

    await createAuditLog({ entity: 'ReservationPolicy', entityId: policy.id, action: 'CREATE', newValue: policy, auditContext });
    return policy;
  }

  async getByBranch(branchId) {
    const policy = await policyRepo.findByBranch(branchId);
    if (!policy) throw ApiError.notFound('Reservation policy not found for this branch');
    return policy;
  }

  async update(id, data, auditContext) {
    const existing = await policyRepo.findById(id);
    if (!existing) throw ApiError.notFound('Reservation policy not found');
    const updated = await policyRepo.update(id, data);

    const branch = await prisma.branch.findUnique({ where: { id: updated.branchId }, select: { restaurantId: true } });
    if (branch) {
      await prisma.goLiveChecklist.update({
        where: { restaurantId: branch.restaurantId },
        data: { reservationPolicyDone: true },
      });
    }

    await createAuditLog({ entity: 'ReservationPolicy', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    return updated;
  }
}

module.exports = new ReservationPolicyService();
