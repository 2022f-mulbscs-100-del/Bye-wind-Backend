const { prisma } = require('../../../config');

class RestaurantRepository {
  async create(data) {
    return prisma.restaurant.create({ data });
  }

  async findById(id) {
    return prisma.restaurant.findUnique({ where: { id } });
  }

  async findByIdWithRelations(id) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        branches: { where: { isActive: true } },
        goLiveChecklist: true,
      },
    });
  }

  async update(id, data) {
    return prisma.restaurant.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.restaurant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateStatus(id, status) {
    return prisma.restaurant.update({
      where: { id },
      data: { status },
    });
  }

  async findAll({ page = 1, limit = 20, search, isActive } = {}) {
    const skip = (page - 1) * limit;

    const where = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search) {
      where.OR = [
        { brandName:         { contains: search, mode: 'insensitive' } },
        { legalBusinessName: { contains: search, mode: 'insensitive' } },
        { operatingCountry:  { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await prisma.$transaction([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          branches: { where: { isActive: true }, select: { id: true, name: true } },
          _count: { select: { branches: true, staff: true } },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new RestaurantRepository();
