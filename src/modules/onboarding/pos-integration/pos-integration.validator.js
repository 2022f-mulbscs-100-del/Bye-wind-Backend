const { z } = require('zod');

const POS_PROVIDERS = ['TOAST', 'LIGHTSPEED', 'SQUARE_POS', 'CLOVER', 'REVEL', 'OTHER'];
const SYNC_DIRS = ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'];

const createPOSIntegrationSchema = {
  body: z.object({
    branchId: z.string().uuid().optional().nullable(),
    provider: z.enum(POS_PROVIDERS),
    apiKey: z.string().min(1),
    apiSecret: z.string().optional().nullable(),
    endpointUrl: z.string().url().optional().nullable(),
    syncFrequencyMins: z.number().int().positive().optional().default(15),
    syncDirection: z.enum(SYNC_DIRS).optional().default('BIDIRECTIONAL'),
    errorHandlingConfig: z.record(z.any()).optional().default({}),
    fieldMappings: z.record(z.any()).optional().default({}),
  }),
};

const updatePOSIntegrationSchema = {
  body: createPOSIntegrationSchema.body.partial(),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createPOSIntegrationSchema, updatePOSIntegrationSchema };
