const { prisma } = require('../../../config');

class PaymentGatewayRepository {
  async create(data) {
    return prisma.paymentGateway.create({ data });
  }

  async findById(id) {
    return prisma.paymentGateway.findUnique({ where: { id } });
  }

  async findByRestaurant(restaurantId) {
    return prisma.paymentGateway.findMany({ where: { restaurantId } });
  }

  async findByProvider(restaurantId, provider) {
    return prisma.paymentGateway.findUnique({
      where: { restaurantId_provider: { restaurantId, provider } },
    });
  }

  async update(id, data) {
    return prisma.paymentGateway.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.paymentGateway.delete({ where: { id } });
  }
}

module.exports = new PaymentGatewayRepository();
