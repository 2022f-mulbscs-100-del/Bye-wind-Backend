const { z } = require('zod');

const ROLES = ['SUPER_ADMIN', 'OWNER', 'HOST', 'STAFF'];

/**
 * Registration schema.
 * - SUPER_ADMIN: restaurantId is optional (platform-level user).
 * - All others: restaurantId is required.
 * Cross-field validation is handled via `.superRefine()`.
 */
const registerStaffSchema = {
  body: z
    .object({
      restaurantId: z.string().uuid().optional().nullable(),
      email: z.string().email(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional().nullable(),
      role: z.enum(ROLES),
      branchId: z.string().uuid().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      // Non-super-admin roles MUST have a restaurantId
      if (data.role !== 'SUPER_ADMIN' && !data.restaurantId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['restaurantId'],
          message: 'restaurantId is required for non-Super Admin roles',
        });
      }
    }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

const updateStaffSchema = {
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    role: z.enum(ROLES).optional(),
    permissions: z.record(z.boolean()).optional(),
    isActive: z.boolean().optional(),
    branchId: z.string().uuid().optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

const assignBranchSchema = {
  body: z.object({
    staffId: z.string().uuid(),
    branchId: z.string().uuid(),
    isPrimary: z.boolean().optional().default(false),
  }),
};

module.exports = { registerStaffSchema, loginSchema, updateStaffSchema, assignBranchSchema };
