const { prisma } = require('../../../config');

class BranchRepository {
  buildWhereClause(restaurantId, options = {}) {
    const { statuses, isActive } = options;
    const where = { restaurantId };

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      where.status = { in: statuses };
    }

    return where;
  }

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

  async findAllByRestaurant(restaurantId, { skip, take, statuses, isActive = true }) {
    const where = this.buildWhereClause(restaurantId, { statuses, isActive });
    const [data, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        include: { goLiveStatus: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count({ where }),
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
