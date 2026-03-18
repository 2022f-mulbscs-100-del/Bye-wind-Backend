const { z } = require('zod');

const branchStatusEnum = z
  .enum(['draft', 'pending', 'live', 'DRAFT', 'PENDING', 'LIVE'])
  .transform((value) => value.toUpperCase());

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const createBranchSchema = {
  body: z.object({
    name: z.string().min(1, 'Branch name is required'),
    address: addressSchema,
    timezone: z.string().min(1, 'Timezone is required'),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
  }),
};

const updateBranchSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    address: addressSchema.optional(),
    timezone: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    isActive: z.boolean().optional(),
    status: branchStatusEnum.optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid branch ID'),
  }),
};

const listBranchesSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    status: z.string().optional(),
  }),
};

const branchIdParam = {
  params: z.object({
    id: z.string().uuid('Invalid branch ID'),
  }),
};

module.exports = {
  createBranchSchema,
  updateBranchSchema,
  branchIdParam,
  listBranchesSchema,
};
