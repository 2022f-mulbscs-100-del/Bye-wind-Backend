const { z } = require('zod');

const createTableConfigSchema = {
  body: z.object({
    tableId: z.string().uuid(),
    minPartySize: z.number().int().positive().optional().default(1),
    maxPartySize: z.number().int().positive(),
    isCombinable: z.boolean().optional().default(false),
    combinableWith: z.array(z.string().uuid()).optional().default([]),
    isAccessible: z.boolean().optional().default(false),
    isVIP: z.boolean().optional().default(false),
    isSmoking: z.boolean().optional().default(false),
    preferredTags: z.array(z.string()).optional().default([]),
    notes: z.string().optional().nullable(),
  }),
};

const updateTableConfigSchema = {
  body: z.object({
    minPartySize: z.number().int().positive().optional(),
    maxPartySize: z.number().int().positive().optional(),
    isCombinable: z.boolean().optional(),
    combinableWith: z.array(z.string().uuid()).optional(),
    isAccessible: z.boolean().optional(),
    isVIP: z.boolean().optional(),
    isSmoking: z.boolean().optional(),
    preferredTags: z.array(z.string()).optional(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createTableConfigSchema, updateTableConfigSchema };
