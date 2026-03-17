const { prisma } = require('../../../config');

class DataImportRepository {
  async create(data) { return prisma.dataImport.create({ data }); }
  async findById(id) { return prisma.dataImport.findUnique({ where: { id } }); }
  async findByRestaurant(restaurantId, { skip, take }) {
    const [data, total] = await Promise.all([
      prisma.dataImport.findMany({ where: { restaurantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.dataImport.count({ where: { restaurantId } }),
    ]);
    return { data, total };
  }
  async update(id, data) { return prisma.dataImport.update({ where: { id }, data }); }
}

module.exports = new DataImportRepository();
