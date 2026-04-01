const { prisma } = require('../../../config');

class PublicRestaurantRepository {
  /**
   * Find all LIVE (public) restaurants with pagination and filters
   */
  async findAllPublic({ page = 1, limit = 20, search, cuisine, city }) {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {
      isActive: true,
      status: 'LIVE',
    };

    if (search) {
      where.OR = [
        { brandName: { contains: search, mode: 'insensitive' } },
        { legalBusinessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (cuisine) {
      where.cuisineTypes = { has: cuisine };
    }

    if (city) {
      where.registeredAddress = {
        path: ['city'],
        string_contains: city,
      };
    }

    // Fetch restaurants with relations
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        select: {
          id: true,
          brandName: true,
          legalBusinessName: true,
          cuisineTypes: true,
          registeredAddress: true,
          logoUrl: true,
          status: true,
          isActive: true,
          branches: {
            where: { isActive: true, isLive: true },
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
            },
            take: 5, // Limit branches returned
          },
          _count: {
            select: {
              branches: true,
              staff: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.restaurant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: restaurants,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Find a specific public restaurant by ID
   */
  async findPublicById(id) {
    return prisma.restaurant.findFirst({
      where: {
        id,
        isActive: true,
        status: 'LIVE',
      },
      select: {
        id: true,
        brandName: true,
        legalBusinessName: true,
        cuisineTypes: true,
        registeredAddress: true,
        logoUrl: true,
        status: true,
        isActive: true,
        operatingCountry: true,
        timezone: true,
        primaryContact: true,
        branches: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            timezone: true,
            isLive: true,
          },
        },
        _count: {
          select: {
            branches: true,
            staff: true,
          },
        },
      },
    });
  }
}

module.exports = new PublicRestaurantRepository();
