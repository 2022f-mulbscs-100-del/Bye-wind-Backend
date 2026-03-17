const widgetRepo = require('./booking-widget.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class BookingWidgetService {
  async create(restaurantId, data, auditContext) {
    const widget = await widgetRepo.create({ ...data, restaurantId });
    await createAuditLog({ entity: 'BookingWidget', entityId: widget.id, action: 'CREATE', newValue: widget, auditContext });
    return widget;
  }

  async getAll(restaurantId) {
    return widgetRepo.findByRestaurant(restaurantId);
  }

  async getById(id) {
    const widget = await widgetRepo.findById(id);
    if (!widget) throw ApiError.notFound('Booking widget not found');
    return widget;
  }

  async getByToken(embedToken) {
    const widget = await widgetRepo.findByToken(embedToken);
    if (!widget || !widget.isActive) throw ApiError.notFound('Widget not found or inactive');
    return widget;
  }

  async update(id, data, auditContext) {
    const existing = await widgetRepo.findById(id);
    if (!existing) throw ApiError.notFound('Booking widget not found');
    const updated = await widgetRepo.update(id, data);
    await createAuditLog({ entity: 'BookingWidget', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    return updated;
  }

  async delete(id, auditContext) {
    const existing = await widgetRepo.findById(id);
    if (!existing) throw ApiError.notFound('Booking widget not found');
    await widgetRepo.delete(id);
    await createAuditLog({ entity: 'BookingWidget', entityId: id, action: 'DELETE', auditContext });
  }
}

module.exports = new BookingWidgetService();
