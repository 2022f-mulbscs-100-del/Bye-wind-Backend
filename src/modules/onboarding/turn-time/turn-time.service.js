const turnTimeRepo = require('./turn-time.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class TurnTimeService {
  async create(data, auditContext) {
    const rule = await turnTimeRepo.create(data);

    await prisma.branchGoLiveStatus.updateMany({
      where: { branchId: data.branchId },
      data: { turnTimesDone: true },
    });

    const branch = await prisma.branch.findUnique({ where: { id: data.branchId }, select: { restaurantId: true } });
    if (branch) {
      await prisma.goLiveChecklist.update({
        where: { restaurantId: branch.restaurantId },
        data: { turnTimesDone: true },
      });
    }

    await createAuditLog({ entity: 'TurnTimeRule', entityId: rule.id, action: 'CREATE', newValue: rule, auditContext });
    return rule;
  }

  async getByBranch(branchId) {
    return turnTimeRepo.findByBranch(branchId);
  }

  async update(id, data, auditContext) {
    const existing = await turnTimeRepo.findById(id);
    if (!existing) throw ApiError.notFound('Turn time rule not found');
    const updated = await turnTimeRepo.update(id, data);

    const branch = await prisma.branch.findUnique({ where: { id: updated.branchId }, select: { restaurantId: true } });
    if (branch) {
      await prisma.goLiveChecklist.update({
        where: { restaurantId: branch.restaurantId },
        data: { turnTimesDone: true },
      });
    }

    await createAuditLog({ entity: 'TurnTimeRule', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    return updated;
  }

  async delete(id, auditContext) {
    const existing = await turnTimeRepo.findById(id);
    if (!existing) throw ApiError.notFound('Turn time rule not found');
    await turnTimeRepo.delete(id);
    await createAuditLog({ entity: 'TurnTimeRule', entityId: id, action: 'DELETE', oldValue: existing, auditContext });
  }
}

module.exports = new TurnTimeService();
