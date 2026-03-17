const brandingRepo = require('./branding.repository');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class BrandingService {
  async get(restaurantId) {
    return brandingRepo.findByRestaurant(restaurantId);
  }

  async upsert(restaurantId, data, auditContext) {
    const branding = await brandingRepo.upsert(restaurantId, data);
    await createAuditLog({ entity: 'Branding', entityId: branding.id, action: 'UPDATE', newValue: branding, auditContext });
    return branding;
  }
}

module.exports = new BrandingService();
