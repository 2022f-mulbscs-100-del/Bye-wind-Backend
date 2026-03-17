const { prisma } = require('../../../config');

class CommunicationRepository {
  async create(data) {
    return prisma.communicationChannelConfig.create({ data });
  }

  async findById(id) {
    return prisma.communicationChannelConfig.findUnique({ where: { id } });
  }

  async findByRestaurant(restaurantId) {
    return prisma.communicationChannelConfig.findMany({ where: { restaurantId } });
  }

  async findByChannel(restaurantId, channel) {
    return prisma.communicationChannelConfig.findUnique({
      where: { restaurantId_channel: { restaurantId, channel } },
    });
  }

  async update(id, data) {
    return prisma.communicationChannelConfig.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.communicationChannelConfig.delete({ where: { id } });
  }
}

module.exports = new CommunicationRepository();
