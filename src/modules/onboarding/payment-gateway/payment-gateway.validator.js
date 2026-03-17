const { z } = require('zod');

const createPaymentGatewaySchema = {
  body: z.object({
    provider: z.enum(['STRIPE', 'SQUARE']),
    apiKey: z.string().min(1),
    secretKey: z.string().min(1),
    webhookSecret: z.string().optional().nullable(),
    currency: z.string().length(3).optional().default('USD'),
    isTestMode: z.boolean().optional().default(true),
    taxRate: z.number().nonnegative().optional().nullable(),
    config: z.record(z.any()).optional().default({}),
  }),
};

const updatePaymentGatewaySchema = {
  body: createPaymentGatewaySchema.body.partial(),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createPaymentGatewaySchema, updatePaymentGatewaySchema };
