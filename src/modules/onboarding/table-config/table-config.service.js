const tableConfigRepo = require('./table-config.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class TableConfigService {
  async createOrUpdate(data, auditContext) {
    const config = await tableConfigRepo.upsertByTableId(data.tableId, data);

    await createAuditLog({
      entity: 'TableConfig',
      entityId: config.id,
      action: 'CREATE',
      newValue: config,
      auditContext,
    });

    return config;
  }

  async getByTableId(tableId) {
    const config = await tableConfigRepo.findByTableId(tableId);
    if (!config) throw ApiError.notFound('Table config not found');
    return config;
  }

  async update(id, data, auditContext) {
    const existing = await tableConfigRepo.findById(id);
    if (!existing) throw ApiError.notFound('Table config not found');

    const updated = await tableConfigRepo.update(id, data);

    await createAuditLog({
      entity: 'TableConfig',
      entityId: id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      auditContext,
    });

    return updated;
  }

  async delete(id, auditContext) {
    const existing = await tableConfigRepo.findById(id);
    if (!existing) throw ApiError.notFound('Table config not found');

    await tableConfigRepo.delete(id);

    await createAuditLog({
      entity: 'TableConfig',
      entityId: id,
      action: 'DELETE',
      oldValue: existing,
      auditContext,
    });
  }
}

module.exports = new TableConfigService();
