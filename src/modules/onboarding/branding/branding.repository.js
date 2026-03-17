const { prisma } = require('../../../config');

class BrandingRepository {
  async findByRestaurant(restaurantId) {
    return prisma.branding.findUnique({ where: { restaurantId } });
  }

  async upsert(restaurantId, data) {
    return prisma.branding.upsert({
      where: { restaurantId },
      update: data,
      create: { restaurantId, ...data },
    });
  }
}

module.exports = new BrandingRepository();
