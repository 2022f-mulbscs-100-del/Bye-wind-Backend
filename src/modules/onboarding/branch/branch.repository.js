const { prisma } = require('../../../config');

class BranchRepository {
  async create(data) {
    return prisma.branch.create({ data });
  }

  async findById(id) {
    return prisma.branch.findUnique({ where: { id } });
  }

  async findByIdWithRelations(id) {
    return prisma.branch.findUnique({
      where: { id },
      include: {
        businessHours: { include: { shifts: true } },
        holidays: true,
        floorPlans: true,
        reservationPolicy: true,
        goLiveStatus: true,
      },
    });
  }

  async findAllByRestaurant(restaurantId, { skip, take }) {
    const [data, total] = await Promise.all([
      prisma.branch.findMany({
        where: { restaurantId, isActive: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count({ where: { restaurantId, isActive: true } }),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return prisma.branch.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.branch.update({ where: { id }, data: { isActive: false } });
  }
}

module.exports = new BranchRepository();
