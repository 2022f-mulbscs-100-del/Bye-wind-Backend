const { prisma } = require('../../../config');

class TableConfigRepository {
  async create(data) {
    return prisma.tableConfig.create({ data });
  }

  async findByTableId(tableId) {
    return prisma.tableConfig.findUnique({ where: { tableId } });
  }

  async findById(id) {
    return prisma.tableConfig.findUnique({ where: { id } });
  }

  async update(id, data) {
    return prisma.tableConfig.update({ where: { id }, data });
  }

  async upsertByTableId(tableId, data) {
    return prisma.tableConfig.upsert({
      where: { tableId },
      update: data,
      create: { tableId, ...data },
    });
  }

  async delete(id) {
    return prisma.tableConfig.delete({ where: { id } });
  }
}

module.exports = new TableConfigRepository();
