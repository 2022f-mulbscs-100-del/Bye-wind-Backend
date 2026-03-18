const branchRepository = require('./branch.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

const normalizeStatus = (status) =>
  typeof status === 'string' ? status.toUpperCase() : undefined;

class BranchService {
  async createBranch(restaurantId, data, auditContext) {
    const branch = await prisma.$transaction(async (tx) => {
      const created = await tx.branch.create({
        data: { ...data, restaurantId, status: 'PENDING' },
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

  async getAllBranches(restaurantId, pagination, filters = {}) {
    const statuses = filters.statuses?.map(normalizeStatus).filter(Boolean);
    return branchRepository.findAllByRestaurant(restaurantId, {
      ...pagination,
      statuses,
      isActive:
        typeof filters.isActive === 'boolean' ? filters.isActive : true,
    });
  }

  async updateBranch(id, data, auditContext) {
    const existing = await branchRepository.findById(id);
    if (!existing) throw ApiError.notFound('Branch not found');

    const payload = { ...data };
    if (payload.status) {
      payload.status = normalizeStatus(payload.status);
    }
    const updated = await branchRepository.update(id, payload);

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
