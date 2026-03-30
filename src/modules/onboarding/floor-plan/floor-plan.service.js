const floorPlanRepo = require('./floor-plan.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');
const { prisma } = require('../../../config');

class FloorPlanService {
  // ── Floor Plans ────────────────────────────────────────────────────
  async createFloorPlan(data, auditContext) {
    const floorPlan = await floorPlanRepo.createFloorPlan(data);

    await prisma.branchGoLiveStatus.updateMany({
      where: { branchId: data.branchId },
      data: { floorPlanDone: true },
    });

    const branch = await prisma.branch.findUnique({ where: { id: data.branchId }, select: { restaurantId: true } });
    if (branch) {
      await prisma.goLiveChecklist.update({
        where: { restaurantId: branch.restaurantId },
        data: { floorPlanDone: true },
      });
    }

    await createAuditLog({ entity: 'FloorPlan', entityId: floorPlan.id, action: 'CREATE', newValue: floorPlan, auditContext });
    return floorPlan;
  }

  async getFloorPlan(id) {
    const fp = await floorPlanRepo.findFloorPlanById(id);
    if (!fp) throw ApiError.notFound('Floor plan not found');
    return fp;
  }

  async getFloorPlansByBranch(branchId) {
    return floorPlanRepo.findFloorPlansByBranch(branchId);
  }

  async updateFloorPlan(id, data, auditContext) {
    const existing = await floorPlanRepo.findFloorPlanById(id);
    if (!existing) throw ApiError.notFound('Floor plan not found');
    const updated = await floorPlanRepo.updateFloorPlan(id, data);
    await createAuditLog({ entity: 'FloorPlan', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    return updated;
  }

  async deleteFloorPlan(id, auditContext) {
    const existing = await floorPlanRepo.findFloorPlanById(id);
    if (!existing) throw ApiError.notFound('Floor plan not found');
    await floorPlanRepo.deleteFloorPlan(id);
    await createAuditLog({ entity: 'FloorPlan', entityId: id, action: 'DELETE', oldValue: existing, auditContext });
  }

  // ── Zones ──────────────────────────────────────────────────────────
  async createZone(data, auditContext) {
    const zone = await floorPlanRepo.createZone(data);
    await createAuditLog({ entity: 'Zone', entityId: zone.id, action: 'CREATE', newValue: zone, auditContext });
    return zone;
  }

  async updateZone(id, data, auditContext) {
    const updated = await floorPlanRepo.updateZone(id, data);
    await createAuditLog({ entity: 'Zone', entityId: id, action: 'UPDATE', newValue: updated, auditContext });
    return updated;
  }

  async deleteZone(id, auditContext) {
    await floorPlanRepo.deleteZone(id);
    await createAuditLog({ entity: 'Zone', entityId: id, action: 'DELETE', auditContext });
  }

  // ── Tables ─────────────────────────────────────────────────────────
  async createTable(data, auditContext) {
    const table = await floorPlanRepo.createTable(data);
    await createAuditLog({ entity: 'Table', entityId: table.id, action: 'CREATE', newValue: table, auditContext });
    return table;
  }

  async getTable(id) {
    const table = await floorPlanRepo.findTableById(id);
    if (!table) throw ApiError.notFound('Table not found');
    return table;
  }

  async updateTable(id, data, auditContext) {
    const existing = await floorPlanRepo.findTableById(id);
    if (!existing) throw ApiError.notFound('Table not found');
    const updated = await floorPlanRepo.updateTable(id, data);
    await createAuditLog({ entity: 'Table', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    return updated;
  }

  async bulkUpdateTables(tables, auditContext) {
    const results = [];
    for (const t of tables) {
      const { id, ...data } = t;
      const updated = await floorPlanRepo.updateTable(id, data);
      results.push(updated);
    }

    if (results.length > 0) {
      const branchId = results[0].floorPlan.branchId;
      await prisma.branchGoLiveStatus.updateMany({
        where: { branchId },
        data: { tablesConfiguredDone: true },
      });

      const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { restaurantId: true } });
      if (branch) {
        await prisma.goLiveChecklist.update({
          where: { restaurantId: branch.restaurantId },
          data: { tablesConfiguredDone: true },
        });
      }
    }

    await createAuditLog({ entity: 'Table', entityId: 'bulk', action: 'UPDATE', newValue: tables, auditContext });
    return results;
  }

  async deleteTable(id, auditContext) {
    const existing = await floorPlanRepo.findTableById(id);
    if (!existing) throw ApiError.notFound('Table not found');
    await floorPlanRepo.deleteTable(id);
    await createAuditLog({ entity: 'Table', entityId: id, action: 'DELETE', oldValue: existing, auditContext });
  }
}

module.exports = new FloorPlanService();
