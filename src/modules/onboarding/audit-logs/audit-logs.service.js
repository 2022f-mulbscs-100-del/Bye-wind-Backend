const auditRepo = require('./audit-logs.repository');
const ApiError = require('../../../shared/utils/ApiError');

class AuditLogService {
  async getAll(restaurantId, filters, pagination) {
    return auditRepo.findAll(restaurantId, filters, pagination);
  }

  async getById(id) {
    const log = await auditRepo.findById(id);
    if (!log) throw ApiError.notFound('Audit log not found');
    return log;
  }
}

module.exports = new AuditLogService();
