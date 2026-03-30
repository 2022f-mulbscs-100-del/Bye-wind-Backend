const businessHoursRepo = require('./business-hours.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class BusinessHoursService {
  async getSchedule(branchId) {
    return businessHoursRepo.findByBranch(branchId);
  }

  async bulkUpsertSchedule(branchId, schedule, auditContext) {
    const results = [];

    await prisma.$transaction(async (tx) => {
      for (const day of schedule) {
        const { shifts, ...hoursData } = day;

        // Upsert business hours
        const bh = await tx.businessHours.upsert({
          where: { branchId_dayOfWeek: { branchId, dayOfWeek: day.dayOfWeek } },
          update: hoursData,
          create: { branchId, ...hoursData },
        });

        // Replace shifts — delete existing, create new
        await tx.shift.deleteMany({ where: { businessHoursId: bh.id } });
        if (shifts && shifts.length > 0) {
          await tx.shift.createMany({
            data: shifts.map((s) => ({ ...s, businessHoursId: bh.id })),
          });
        }

        results.push(bh);
      }

      // Update go-live status
      await tx.branchGoLiveStatus.updateMany({
        where: { branchId },
        data: { businessHoursDone: true },
      });

      // Also update the restaurant-level checklist
      const branch = await tx.branch.findUnique({ where: { id: branchId }, select: { restaurantId: true } });
      if (branch) {
        await tx.goLiveChecklist.update({
          where: { restaurantId: branch.restaurantId },
          data: { businessHoursDone: true },
        });
      }
    });

    await createAuditLog({
      entity: 'BusinessHours',
      entityId: branchId,
      action: 'UPDATE',
      newValue: schedule,
      auditContext,
    });

    return results;
  }

  // ── Holidays ────────────────────────────────────────────────────

  async getHolidays(branchId) {
    return businessHoursRepo.findHolidaysByBranch(branchId);
  }

  async createHoliday(data, auditContext) {
    const holiday = await businessHoursRepo.createHoliday(data);

    await createAuditLog({
      entity: 'Holiday',
      entityId: holiday.id,
      action: 'CREATE',
      newValue: holiday,
      auditContext,
    });

    return holiday;
  }

  async updateHoliday(id, data, auditContext) {
    const existing = await businessHoursRepo.findHolidayById(id);
    if (!existing) throw ApiError.notFound('Holiday not found');

    const updated = await businessHoursRepo.updateHoliday(id, data);

    await createAuditLog({
      entity: 'Holiday',
      entityId: id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      auditContext,
    });

    return updated;
  }

  async deleteHoliday(id, auditContext) {
    const existing = await businessHoursRepo.findHolidayById(id);
    if (!existing) throw ApiError.notFound('Holiday not found');

    await businessHoursRepo.deleteHoliday(id);

    await createAuditLog({
      entity: 'Holiday',
      entityId: id,
      action: 'DELETE',
      oldValue: existing,
      auditContext,
    });
  }
}

module.exports = new BusinessHoursService();
