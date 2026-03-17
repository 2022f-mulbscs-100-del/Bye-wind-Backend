const { z } = require('zod');

const createCommunicationSchema = {
  body: z.object({
    channel: z.enum(['SMS', 'WHATSAPP', 'EMAIL']),
    provider: z.string().min(1),
    apiKey: z.string().min(1),
    apiSecret: z.string().optional().nullable(),
    senderId: z.string().min(1),
    fromName: z.string().optional().nullable(),
    config: z.record(z.any()).optional().default({}),
  }),
};

const updateCommunicationSchema = {
  body: createCommunicationSchema.body.partial(),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createCommunicationSchema, updateCommunicationSchema };
