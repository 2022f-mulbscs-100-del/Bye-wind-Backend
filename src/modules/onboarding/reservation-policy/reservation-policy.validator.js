const { z } = require('zod');

const createReservationPolicySchema = {
  body: z.object({
    branchId: z.string().uuid(),
    minPartySize: z.number().int().positive().optional().default(1),
    maxPartySize: z.number().int().positive().optional().default(20),
    advanceBookingDays: z.number().int().nonnegative().optional().default(30),
    sameDayCutoffMins: z.number().int().nonnegative().optional().default(60),
    minNoticeMins: z.number().int().nonnegative().optional().default(30),
    overbookingTolerancePct: z.number().nonnegative().optional().default(0),
    depositRequired: z.boolean().optional().default(false),
    depositType: z.enum(['FIXED', 'PER_HEAD', 'PERCENTAGE']).optional().nullable(),
    depositAmount: z.number().nonnegative().optional().nullable(),
    cancellationWindowHours: z.number().int().nonnegative().optional().default(24),
    noShowPenaltyEnabled: z.boolean().optional().default(false),
    noShowPenaltyAmount: z.number().nonnegative().optional().nullable(),
    modificationLimitHours: z.number().int().nonnegative().optional().default(24),
    autoConfirm: z.boolean().optional().default(true),
    maxBookingsPerSlot: z.number().int().positive().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
};

const updateReservationPolicySchema = {
  body: createReservationPolicySchema.body.partial().omit({ branchId: true }),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createReservationPolicySchema, updateReservationPolicySchema };
