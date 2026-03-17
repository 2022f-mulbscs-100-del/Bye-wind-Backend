const { z } = require('zod');

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEALS = ['BREAKFAST', 'BRUNCH', 'LUNCH', 'DINNER'];

const createTurnTimeSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    name: z.string().optional().nullable(),
    partySizeMin: z.number().int().positive().optional().nullable(),
    partySizeMax: z.number().int().positive().optional().nullable(),
    mealType: z.enum(MEALS).optional().nullable(),
    dayOfWeek: z.enum(DAYS).optional().nullable(),
    timeSlotFrom: z.string().optional().nullable(),
    timeSlotTo: z.string().optional().nullable(),
    durationMins: z.number().int().positive(),
    isDefault: z.boolean().optional().default(false),
    priority: z.number().int().optional().default(0),
  }),
};

const updateTurnTimeSchema = {
  body: createTurnTimeSchema.body.partial().omit({ branchId: true }),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createTurnTimeSchema, updateTurnTimeSchema };
