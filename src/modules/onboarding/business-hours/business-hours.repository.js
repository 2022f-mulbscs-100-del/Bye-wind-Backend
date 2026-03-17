const { prisma } = require('../../../config');

class BusinessHoursRepository {
  async findByBranch(branchId) {
    return prisma.businessHours.findMany({
      where: { branchId },
      include: { shifts: true },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async upsert(branchId, dayOfWeek, data) {
    return prisma.businessHours.upsert({
      where: { branchId_dayOfWeek: { branchId, dayOfWeek } },
      update: data,
      create: { branchId, dayOfWeek, ...data },
    });
  }

  async findHolidaysByBranch(branchId) {
    return prisma.holiday.findMany({
      where: { branchId },
      orderBy: { startDate: 'asc' },
    });
  }

  async createHoliday(data) {
    return prisma.holiday.create({ data });
  }

  async findHolidayById(id) {
    return prisma.holiday.findUnique({ where: { id } });
  }

  async updateHoliday(id, data) {
    return prisma.holiday.update({ where: { id }, data });
  }

  async deleteHoliday(id) {
    return prisma.holiday.delete({ where: { id } });
  }
}

module.exports = new BusinessHoursRepository();
