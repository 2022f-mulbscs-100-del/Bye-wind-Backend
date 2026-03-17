const commRepo = require('./communication.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { encrypt, decrypt } = require('../../../shared/utils/encryption');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class CommunicationService {
  async create(restaurantId, data, auditContext) {
    const existing = await commRepo.findByChannel(restaurantId, data.channel);
    if (existing) throw ApiError.conflict(`${data.channel} channel is already configured`);

    const encrypted = {
      ...data,
      restaurantId,
      apiKey: encrypt(data.apiKey),
      apiSecret: data.apiSecret ? encrypt(data.apiSecret) : null,
    };

    const config = await commRepo.create(encrypted);
    await createAuditLog({ entity: 'CommunicationChannelConfig', entityId: config.id, action: 'CREATE', auditContext });
    return this._sanitize(config);
  }

  async getAll(restaurantId) {
    const configs = await commRepo.findByRestaurant(restaurantId);
    return configs.map(this._sanitize);
  }

  async update(id, data, auditContext) {
    const existing = await commRepo.findById(id);
    if (!existing) throw ApiError.notFound('Communication channel config not found');

    const toUpdate = { ...data };
    if (data.apiKey) toUpdate.apiKey = encrypt(data.apiKey);
    if (data.apiSecret) toUpdate.apiSecret = encrypt(data.apiSecret);

    const updated = await commRepo.update(id, toUpdate);
    await createAuditLog({ entity: 'CommunicationChannelConfig', entityId: id, action: 'UPDATE', auditContext });
    return this._sanitize(updated);
  }

  async delete(id, auditContext) {
    const existing = await commRepo.findById(id);
    if (!existing) throw ApiError.notFound('Communication channel config not found');
    await commRepo.delete(id);
    await createAuditLog({ entity: 'CommunicationChannelConfig', entityId: id, action: 'DELETE', auditContext });
  }

  _sanitize(config) {
    return {
      ...config,
      apiKey: '••••' + decrypt(config.apiKey).slice(-4),
      apiSecret: config.apiSecret ? '••••••••' : null,
    };
  }
}

module.exports = new CommunicationService();
