const { z } = require('zod');

const queryAuditLogsSchema = {
  query: z.object({
    entity: z.string().optional(),
    entityId: z.string().optional(),
    staffId: z.string().uuid().optional(),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'STATUS_CHANGE']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};

module.exports = { queryAuditLogsSchema };
