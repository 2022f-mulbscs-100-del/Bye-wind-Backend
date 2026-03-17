const posRepo = require('./pos-integration.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { encrypt, decrypt } = require('../../../shared/utils/encryption');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class POSIntegrationService {
  async create(restaurantId, data, auditContext) {
    const encrypted = {
      ...data,
      restaurantId,
      apiKey: encrypt(data.apiKey),
      apiSecret: data.apiSecret ? encrypt(data.apiSecret) : null,
    };
    const integration = await posRepo.create(encrypted);
    await createAuditLog({ entity: 'POSIntegration', entityId: integration.id, action: 'CREATE', auditContext });
    return this._sanitize(integration);
  }

  async getAll(restaurantId) {
    const integrations = await posRepo.findByRestaurant(restaurantId);
    return integrations.map(this._sanitize);
  }

  async update(id, data, auditContext) {
    const existing = await posRepo.findById(id);
    if (!existing) throw ApiError.notFound('POS integration not found');
    const toUpdate = { ...data };
    if (data.apiKey) toUpdate.apiKey = encrypt(data.apiKey);
    if (data.apiSecret) toUpdate.apiSecret = encrypt(data.apiSecret);
    const updated = await posRepo.update(id, toUpdate);
    await createAuditLog({ entity: 'POSIntegration', entityId: id, action: 'UPDATE', auditContext });
    return this._sanitize(updated);
  }

  async delete(id, auditContext) {
    const existing = await posRepo.findById(id);
    if (!existing) throw ApiError.notFound('POS integration not found');
    await posRepo.delete(id);
    await createAuditLog({ entity: 'POSIntegration', entityId: id, action: 'DELETE', auditContext });
  }

  _sanitize(integration) {
    return {
      ...integration,
      apiKey: '••••' + decrypt(integration.apiKey).slice(-4),
      apiSecret: integration.apiSecret ? '••••••••' : null,
    };
  }
}

module.exports = new POSIntegrationService();
