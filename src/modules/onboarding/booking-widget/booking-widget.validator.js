const { z } = require('zod');

const createBookingWidgetSchema = {
  body: z.object({
    branchId: z.string().uuid().optional().nullable(),
    name: z.string().min(1),
    language: z.string().optional().default('en'),
    timezone: z.string().optional().nullable(),
    minPartySize: z.number().int().positive().optional().default(1),
    maxPartySize: z.number().int().positive().optional().default(20),
    availableZones: z.array(z.string().uuid()).optional().default([]),
    bookingRules: z.record(z.any()).optional().default({}),
    customStyles: z.record(z.any()).optional().default({}),
  }),
};

const updateBookingWidgetSchema = {
  body: createBookingWidgetSchema.body.partial(),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createBookingWidgetSchema, updateBookingWidgetSchema };
