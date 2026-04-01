const { prisma } = require('../../config');

class MenuRepository {
  async create(data) {
    return prisma.menuItem.create({ data });
  }

  async findById(id) {
    return prisma.menuItem.findUnique({ where: { id } });
  }

  async findByBranch(branchId, pagination = {}, filters = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause = {
      branchId,
      isActive: filters.isActive !== false,
    };

    if (filters.category) {
      whereClause.category = filters.category;
    }

    if (typeof filters.isAvailable === 'boolean') {
      whereClause.isAvailable = filters.isAvailable;
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          branch: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.menuItem.count({ where: whereClause }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findAllByTenant(pagination = {}, filters = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const whereClause = {
      isActive: filters.isActive !== false,
    };

    if (filters.category) {
      whereClause.category = filters.category;
    }

    if (typeof filters.isAvailable === 'boolean') {
      whereClause.isAvailable = filters.isAvailable;
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          branch: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.menuItem.count({ where: whereClause }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id, data) {
    return prisma.menuItem.update({ where: { id }, data });
  }

  async softDelete(id) {
    return prisma.menuItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id) {
    return prisma.menuItem.delete({ where: { id } });
  }
}

module.exports = new MenuRepository();
