const { prisma } = require('../../../config');

class FloorPlanRepository {
  async createFloorPlan(data) {
    return prisma.floorPlan.create({ data });
  }

  async findFloorPlanById(id) {
    return prisma.floorPlan.findUnique({
      where: { id },
      include: { zones: true, tables: { include: { tableConfig: true, zone: true } } },
    });
  }

  async findFloorPlansByBranch(branchId) {
    return prisma.floorPlan.findMany({
      where: { branchId, isActive: true },
      include: { zones: true, tables: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFloorPlan(id, data) {
    return prisma.floorPlan.update({ where: { id }, data });
  }

  async deleteFloorPlan(id) {
    return prisma.floorPlan.update({ where: { id }, data: { isActive: false } });
  }

  // Zones
  async createZone(data) {
    return prisma.zone.create({ data });
  }

  async updateZone(id, data) {
    return prisma.zone.update({ where: { id }, data });
  }

  async deleteZone(id) {
    return prisma.zone.delete({ where: { id } });
  }

  // Tables
  async createTable(data) {
    return prisma.table.create({ data });
  }

  async findTableById(id) {
    return prisma.table.findUnique({ where: { id }, include: { tableConfig: true, zone: true } });
  }

  async updateTable(id, data) {
    return prisma.table.update({ where: { id }, data });
  }

  async deleteTable(id) {
    return prisma.table.update({ where: { id }, data: { isActive: false } });
  }
}

module.exports = new FloorPlanRepository();
