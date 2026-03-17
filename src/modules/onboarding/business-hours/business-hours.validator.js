const { z } = require('zod');

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SHIFT_TYPES = ['BREAKFAST', 'BRUNCH', 'LUNCH', 'DINNER', 'ALL_DAY'];
const HOLIDAY_TYPES = ['PUBLIC_HOLIDAY', 'SEASONAL_CLOSURE', 'ADHOC_BLACKOUT'];

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const shiftSchema = z.object({
  name: z.string().min(1),
  shiftType: z.enum(SHIFT_TYPES),
  startTime: z.string().regex(timeRegex, 'Use HH:mm format'),
  endTime: z.string().regex(timeRegex, 'Use HH:mm format'),
  isActive: z.boolean().optional().default(true),
});

const createBusinessHoursSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    dayOfWeek: z.enum(DAYS),
    isOpen: z.boolean().default(true),
    openTime: z.string().regex(timeRegex).optional().nullable(),
    closeTime: z.string().regex(timeRegex).optional().nullable(),
    shifts: z.array(shiftSchema).optional().default([]),
  }),
};

const bulkUpsertBusinessHoursSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    schedule: z.array(
      z.object({
        dayOfWeek: z.enum(DAYS),
        isOpen: z.boolean().default(true),
        openTime: z.string().regex(timeRegex).optional().nullable(),
        closeTime: z.string().regex(timeRegex).optional().nullable(),
        shifts: z.array(shiftSchema).optional().default([]),
      })
    ),
  }),
};

const createHolidaySchema = {
  body: z.object({
    branchId: z.string().uuid(),
    name: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional().nullable(),
    type: z.enum(HOLIDAY_TYPES),
    description: z.string().optional().nullable(),
    isRecurring: z.boolean().optional().default(false),
  }),
};

const updateHolidaySchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional().nullable(),
    type: z.enum(HOLIDAY_TYPES).optional(),
    description: z.string().optional().nullable(),
    isRecurring: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

const branchIdQuery = {
  query: z.object({
    branchId: z.string().uuid(),
  }),
};

module.exports = {
  createBusinessHoursSchema,
  bulkUpsertBusinessHoursSchema,
  createHolidaySchema,
  updateHolidaySchema,
  branchIdQuery,
};
