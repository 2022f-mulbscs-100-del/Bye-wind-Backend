const menuRepository = require('./menu.repository');
const ApiError = require('../../shared/utils/ApiError');
const { createAuditLog } = require('../../middlewares/auditLogger.middleware');

class MenuService {
  async createMenuItem(branchId, data, auditContext) {
    const menuItem = await menuRepository.create({
      ...data,
      branchId,
    });

    await createAuditLog({
      entity: 'MenuItem',
      entityId: menuItem.id,
      action: 'CREATE',
      newValue: menuItem,
      auditContext,
    });

    return menuItem;
  }

  async getMenuItemById(id) {
    const menuItem = await menuRepository.findById(id);
    if (!menuItem) throw ApiError.notFound('Menu item not found');
    return menuItem;
  }

  async getMenuItemsByBranch(branchId, pagination, filters) {
    return menuRepository.findByBranch(branchId, pagination, filters);
  }

  async updateMenuItem(id, data, auditContext) {
    const existing = await menuRepository.findById(id);
    if (!existing) throw ApiError.notFound('Menu item not found');

    const updated = await menuRepository.update(id, data);

    await createAuditLog({
      entity: 'MenuItem',
      entityId: id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      auditContext,
    });

    return updated;
  }

  async deleteMenuItem(id, auditContext, hardDelete = false) {
    const existing = await menuRepository.findById(id);
    if (!existing) throw ApiError.notFound('Menu item not found');

    let deleted;
    if (hardDelete) {
      deleted = await menuRepository.delete(id);
    } else {
      deleted = await menuRepository.softDelete(id);
    }

    await createAuditLog({
      entity: 'MenuItem',
      entityId: id,
      action: 'DELETE',
      oldValue: existing,
      auditContext,
    });

    return deleted;
  }
}

module.exports = new MenuService();
