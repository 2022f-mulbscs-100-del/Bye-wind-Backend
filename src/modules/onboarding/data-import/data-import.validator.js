const { z } = require('zod');

const createDataImportSchema = {
  body: z.object({
    branchId: z.string().uuid().optional().nullable(),
    importType: z.enum(['GUESTS', 'RESERVATIONS', 'TABLES']),
    fileName: z.string().min(1),
    fileUrl: z.string().url(),
    mappingConfig: z.record(z.any()).optional().default({}),
  }),
};

const confirmImportSchema = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createDataImportSchema, confirmImportSchema };
