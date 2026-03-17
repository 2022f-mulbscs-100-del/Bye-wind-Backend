const paymentRepo = require('./payment-gateway.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { encrypt, decrypt } = require('../../../shared/utils/encryption');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class PaymentGatewayService {
  async create(restaurantId, data, auditContext) {
    // Check for duplicate provider
    const existing = await paymentRepo.findByProvider(restaurantId, data.provider);
    if (existing) throw ApiError.conflict(`${data.provider} is already configured`);

    // Encrypt sensitive fields
    const encrypted = {
      ...data,
      restaurantId,
      apiKey: encrypt(data.apiKey),
      secretKey: encrypt(data.secretKey),
      webhookSecret: data.webhookSecret ? encrypt(data.webhookSecret) : null,
    };

    const gateway = await paymentRepo.create(encrypted);
    await createAuditLog({ entity: 'PaymentGateway', entityId: gateway.id, action: 'CREATE', newValue: { ...gateway, apiKey: '[ENCRYPTED]', secretKey: '[ENCRYPTED]' }, auditContext });
    return this._sanitize(gateway);
  }

  async getAll(restaurantId) {
    const gateways = await paymentRepo.findByRestaurant(restaurantId);
    return gateways.map(this._sanitize);
  }

  async update(id, data, auditContext) {
    const existing = await paymentRepo.findById(id);
    if (!existing) throw ApiError.notFound('Payment gateway not found');

    // Re-encrypt if keys are being updated
    const toUpdate = { ...data };
    if (data.apiKey) toUpdate.apiKey = encrypt(data.apiKey);
    if (data.secretKey) toUpdate.secretKey = encrypt(data.secretKey);
    if (data.webhookSecret) toUpdate.webhookSecret = encrypt(data.webhookSecret);

    const updated = await paymentRepo.update(id, toUpdate);
    await createAuditLog({ entity: 'PaymentGateway', entityId: id, action: 'UPDATE', auditContext });
    return this._sanitize(updated);
  }

  async delete(id, auditContext) {
    const existing = await paymentRepo.findById(id);
    if (!existing) throw ApiError.notFound('Payment gateway not found');
    await paymentRepo.delete(id);
    await createAuditLog({ entity: 'PaymentGateway', entityId: id, action: 'DELETE', auditContext });
  }

  _sanitize(gateway) {
    return {
      ...gateway,
      apiKey: '••••' + decrypt(gateway.apiKey).slice(-4),
      secretKey: '••••••••',
      webhookSecret: gateway.webhookSecret ? '••••••••' : null,
    };
  }
}

module.exports = new PaymentGatewayService();
