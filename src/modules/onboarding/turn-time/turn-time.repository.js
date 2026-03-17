const { prisma } = require('../../../config');

class TurnTimeRepository {
  async create(data) {
    return prisma.turnTimeRule.create({ data });
  }

  async findById(id) {
    return prisma.turnTimeRule.findUnique({ where: { id } });
  }

  async findByBranch(branchId) {
    return prisma.turnTimeRule.findMany({
      where: { branchId },
      orderBy: { priority: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.turnTimeRule.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.turnTimeRule.delete({ where: { id } });
  }
}

module.exports = new TurnTimeRepository();
