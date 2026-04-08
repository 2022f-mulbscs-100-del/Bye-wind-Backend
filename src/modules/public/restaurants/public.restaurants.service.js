const publicRestaurantRepository = require('./public.restaurants.repository');
const { prisma } = require('../../../config');
const ApiError = require('../../../shared/utils/ApiError');

class PublicRestaurantService {
  /**
   * Get all LIVE (active) restaurants
   * - Filters by status = LIVE and isActive = true
   * - Includes branches for each restaurant
   */
  async getAllPublicRestaurants({ query = {} }) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const search = query.search || undefined;
    const cuisine = query.cuisine || undefined;
    const city = query.city || undefined;

    return publicRestaurantRepository.findAllPublic({
      page,
      limit,
      search,
      cuisine,
      city,
    });
  }

  /**
   * Get a specific restaurant by ID (public view)
   * - Only returns if restaurant is LIVE and isActive
   * - Includes all branches
   */
  async getPublicRestaurantById(id) {
    const restaurant = await publicRestaurantRepository.findPublicById(id);
    if (!restaurant) {
      throw ApiError.notFound('Restaurant not found');
    }
    return restaurant;
  }

  /**
   * Get full restaurant detail with ALL branches data for public viewing
   * - Returns restaurant info with complete data for every branch
   */
  async getRestaurantDetailFull(restaurantId) {
    // Get main restaurant with full branch list
    const restaurant = await publicRestaurantRepository.findPublicById(restaurantId);
    if (!restaurant) {
      throw ApiError.notFound('Restaurant not found');
    }

    const branches = restaurant.branches ?? [];
    
    // If no branches, return empty data
    if (branches.length === 0) {
      return {
        ...restaurant,
        branchesDetail: [],
        paymentMethods: [],
      };
    }

    // Fetch payment methods (restaurant-level)
    const paymentMethods = await prisma.paymentGateway
      .findMany({
        where: {
          restaurantId,
          isActive: true,
        },
        select: {
          id: true,
          provider: true,
          currency: true,
          isActive: true,
          isTestMode: true,
        },
      })
      .catch(() => []);

    // Fetch detailed data for EACH BRANCH in parallel
    const branchesDetail = await Promise.all(
      branches.map(async (branch) => {
        const branchId = branch.id;

        const [menuItems, businessHours, floorPlans] = await Promise.all([
          // Menu items for this specific branch
          prisma.menuItem
            .findMany({
              where: {
                branchId,
                isActive: true,
              },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                imageUrl: true,
                isAvailable: true,
              },
              take: 30,
            })
            .catch(() => []),

          // Business hours for this branch
          prisma.businessHours
            .findMany({
              where: { branchId },
              select: {
                dayOfWeek: true,
                openTime: true,
                closeTime: true,
                isOpen: true,
              },
            })
            .catch(() => []),

          // Floor plans for this branch
          prisma.floorPlan
            .findMany({
              where: { branchId },
              select: {
                id: true,
                name: true,
                canvasWidth: true,
                canvasHeight: true,
                tables: {
                  select: {
                    id: true,
                    tableNumber: true,
                    label: true,
                    width: true,
                    height: true,
                    positionX: true,
                    positionY: true,
                    rotation: true,
                    capacity: true,
                    shape: true,
                    zone: {
                      select: {
                        id: true,
                        name: true,
                        type: true,
                      },
                    },
                  },
                },
                zones: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
              take: 10,
            })
            .catch(() => []),
        ]);

        return {
          id: branchId,
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          email: branch.email,
          menuItems,
          businessHours,
          floorPlans,
        };
      })
    );

    return {
      ...restaurant,
      branchesDetail,
      paymentMethods,
    };
  }
}

module.exports = new PublicRestaurantService();
