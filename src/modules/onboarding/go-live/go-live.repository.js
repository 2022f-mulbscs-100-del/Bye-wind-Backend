const { prisma } = require('../../../config');

class GoLiveRepository {
  async findByRestaurant(restaurantId) {
    return prisma.goLiveChecklist.findUnique({ where: { restaurantId } });
  }

  async update(restaurantId, data) {
    return prisma.goLiveChecklist.update({ where: { restaurantId }, data });
  }

  async findBranchStatuses(restaurantId) {
    return prisma.branchGoLiveStatus.findMany({
      where: { branch: { restaurantId } },
      include: { branch: { select: { id: true, name: true } } },
    });
  }
}

module.exports = new GoLiveRepository();
