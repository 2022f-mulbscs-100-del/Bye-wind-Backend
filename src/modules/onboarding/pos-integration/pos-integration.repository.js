const { prisma } = require('../../../config');

class POSIntegrationRepository {
  async create(data) { return prisma.pOSIntegration.create({ data }); }
  async findById(id) { return prisma.pOSIntegration.findUnique({ where: { id } }); }
  async findByRestaurant(restaurantId) { return prisma.pOSIntegration.findMany({ where: { restaurantId }, include: { branch: true } }); }
  async update(id, data) { return prisma.pOSIntegration.update({ where: { id }, data }); }
  async delete(id) { return prisma.pOSIntegration.delete({ where: { id } }); }
}

module.exports = new POSIntegrationRepository();
