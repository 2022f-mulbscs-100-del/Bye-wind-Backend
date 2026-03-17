const { prisma } = require('../../../config');

class ReservationPolicyRepository {
  async create(data) {
    return prisma.reservationPolicy.create({ data });
  }

  async findByBranch(branchId) {
    return prisma.reservationPolicy.findUnique({ where: { branchId } });
  }

  async findById(id) {
    return prisma.reservationPolicy.findUnique({ where: { id } });
  }

  async update(id, data) {
    return prisma.reservationPolicy.update({ where: { id }, data });
  }

  async upsertByBranch(branchId, data) {
    return prisma.reservationPolicy.upsert({
      where: { branchId },
      update: data,
      create: { branchId, ...data },
    });
  }
}

module.exports = new ReservationPolicyRepository();
