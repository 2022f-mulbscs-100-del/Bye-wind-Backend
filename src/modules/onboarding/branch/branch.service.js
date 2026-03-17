const branchRepository = require('./branch.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class BranchService {
  async createBranch(restaurantId, data, auditContext) {
    const branch = await prisma.$transaction(async (tx) => {
      const created = await tx.branch.create({
        data: { ...data, restaurantId },
      });

      // Initialize branch go-live status
      await tx.branchGoLiveStatus.create({
        data: { branchId: created.id },
      });

      // Update restaurant go-live checklist
      await tx.goLiveChecklist.updateMany({
        where: { restaurantId },
        data: { branchSetupDone: true },
      });

      return created;
    });

    await createAuditLog({
      entity: 'Branch',
      entityId: branch.id,
      action: 'CREATE',
      newValue: branch,
      auditContext,
    });

    return branch;
  }

  async getBranchById(id) {
    const branch = await branchRepository.findByIdWithRelations(id);
    if (!branch) throw ApiError.notFound('Branch not found');
    return branch;
  }

  async getAllBranches(restaurantId, pagination) {
    return branchRepository.findAllByRestaurant(restaurantId, pagination);
  }

  async updateBranch(id, data, auditContext) {
    const existing = await branchRepository.findById(id);
    if (!existing) throw ApiError.notFound('Branch not found');

    const updated = await branchRepository.update(id, data);

    await createAuditLog({
      entity: 'Branch',
      entityId: id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      auditContext,
    });

    return updated;
  }

  async deleteBranch(id, auditContext) {
    const existing = await branchRepository.findById(id);
    if (!existing) throw ApiError.notFound('Branch not found');

    await branchRepository.softDelete(id);

    await createAuditLog({
      entity: 'Branch',
      entityId: id,
      action: 'DELETE',
      oldValue: existing,
      auditContext,
    });
  }
}

module.exports = new BranchService();
