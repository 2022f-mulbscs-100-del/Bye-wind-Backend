const { prisma } = require('../../../config');

class StaffRepository {
  async create(data) {
    return prisma.staff.create({ data });
  }

  async findByEmail(email) {
    return prisma.staff.findUnique({ where: { email } });
  }

  async findByUsername(staffUsername) {
    return prisma.staff.findUnique({ where: { staffUsername } });
  }

  async findById(id) {
    return prisma.staff.findUnique({
      where: { id },
      include: { branches: { include: { branch: true } } },
    });
  }

  async findAllByRestaurant(restaurantId, { skip, take, branchId }) {
    const where = { 
      restaurantId
    };
    if (branchId) {
      where.branches = { some: { branchId } };
    }

    const [data, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        select: { 
          id: true, 
          email: true, 
          staffUsername: true,
          firstName: true, 
          lastName: true, 
          role: true, 
          isActive: true, 
          phone: true,
          staffCredentialCreatedAt: true,
          branches: {
            select: {
              branchId: true,
              isPrimary: true,
              branch: {
                select: { id: true, name: true }
              }
            }
          },
          createdAt: true 
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.staff.count({ where }),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return prisma.staff.update({ where: { id }, data, include: { branches: { include: { branch: true } } } });
  }

  async assignBranch(staffId, branchId, isPrimary) {
    console.log('assignBranch called with staffId:', staffId, 'branchId:', branchId, 'isPrimary:', isPrimary);
    try {
      const result = await prisma.staffBranch.upsert({
        where: { staffId_branchId: { staffId, branchId } },
        update: { isPrimary },
        create: { staffId, branchId, isPrimary },
      });
      console.log('assignBranch result:', result);
      return result;
    } catch (error) {
      console.error('assignBranch error:', error);
      throw error;
    }
  }

  async removeBranch(staffId, branchId) {
    return prisma.staffBranch.delete({
      where: { staffId_branchId: { staffId, branchId } },
    });
  }
}

module.exports = new StaffRepository();
