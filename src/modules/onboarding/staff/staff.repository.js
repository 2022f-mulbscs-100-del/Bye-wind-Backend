const { prisma } = require('../../../config');

class StaffRepository {
  async create(data) {
    return prisma.staff.create({ data });
  }

  async findByEmail(email) {
    return prisma.staff.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.staff.findUnique({
      where: { id },
      include: { branches: { include: { branch: true } } },
    });
  }

  async findAllByRestaurant(restaurantId, { skip, take, branchId }) {
    const where = { restaurantId };
    if (branchId) {
      where.branches = { some: { branchId } };
    }

    const [data, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return prisma.staff.update({ where: { id }, data });
  }

  async assignBranch(staffId, branchId, isPrimary) {
    return prisma.staffBranch.upsert({
      where: { staffId_branchId: { staffId, branchId } },
      update: { isPrimary },
      create: { staffId, branchId, isPrimary },
    });
  }

  async removeBranch(staffId, branchId) {
    return prisma.staffBranch.delete({
      where: { staffId_branchId: { staffId, branchId } },
    });
  }
}

module.exports = new StaffRepository();
