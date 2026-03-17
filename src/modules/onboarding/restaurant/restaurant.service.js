const restaurantRepository = require('./restaurant.repository');
const { prisma, ROLES } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class RestaurantService {
  /**
   * Create a new restaurant and initialize its go-live checklist.
   */
  async createRestaurant(data, auditContext) {
    const restaurant = await prisma.$transaction(async (tx) => {
      // Create restaurant
      const created = await tx.restaurant.create({ data });

      // Initialize go-live checklist
      await tx.goLiveChecklist.create({
        data: {
          restaurantId: created.id,
          restaurantProfileDone: true, // Just completed registration
        },
      });

      return created;
    });

    await createAuditLog({
      entity: 'Restaurant',
      entityId: restaurant.id,
      action: 'CREATE',
      newValue: restaurant,
      auditContext,
    });

    return restaurant;
  }

  /**
   * Get all restaurants.
   * - SUPER_ADMIN: returns every restaurant (with pagination + optional search).
   * - OWNER / others: returns only their own restaurant.
   */
  async getAllRestaurants({ user, query = {} }) {
    const page  = Math.max(1, parseInt(query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const search   = query.search   || undefined;
    const isActive = query.isActive !== undefined
      ? query.isActive === 'true'
      : undefined;

    // Non-SUPER_ADMIN: only their own restaurant
    if (user.role !== ROLES.SUPER_ADMIN) {
      if (!user.restaurantId) {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      }
      const restaurant = await restaurantRepository.findByIdWithRelations(user.restaurantId);
      return {
        data: restaurant ? [restaurant] : [],
        meta: { total: restaurant ? 1 : 0, page: 1, limit, totalPages: 1 },
      };
    }

    // SUPER_ADMIN: all restaurants
    return restaurantRepository.findAll({ page, limit, search, isActive });
  }

  /**
   * Get restaurant by ID. Throws if not found.
   */
  async getRestaurantById(id) {
    const restaurant = await restaurantRepository.findByIdWithRelations(id);
    if (!restaurant) {
      throw ApiError.notFound('Restaurant not found');
    }
    return restaurant;
  }

  /**
   * Update restaurant details.
   */
  async updateRestaurant(id, data, auditContext) {
    const existing = await restaurantRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Restaurant not found');
    }

    const updated = await restaurantRepository.update(id, data);

    await createAuditLog({
      entity: 'Restaurant',
      entityId: id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      auditContext,
    });

    return updated;
  }

  /**
   * Soft-delete restaurant (set isActive = false).
   */
  async deleteRestaurant(id, auditContext) {
    const existing = await restaurantRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Restaurant not found');
    }

    await restaurantRepository.delete(id);

    await createAuditLog({
      entity: 'Restaurant',
      entityId: id,
      action: 'DELETE',
      oldValue: existing,
      auditContext,
    });
  }
}

module.exports = new RestaurantService();
