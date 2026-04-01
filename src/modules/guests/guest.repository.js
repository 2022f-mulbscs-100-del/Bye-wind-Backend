const { prisma } = require('../../config');

class GuestRepository {
  // Get guest profile by email
  async findByEmail(email) {
    return prisma.guestProfile.findUnique({
      where: { email },
      include: {
        preferences: true,
        savedRestaurants: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  // Get guest profile by ID
  async findById(guestId) {
    return prisma.guestProfile.findUnique({
      where: { id: guestId },
      include: {
        preferences: true,
        savedRestaurants: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  // Create guest profile
  async create(data) {
    const { email, name, phone, location } = data;
    return prisma.guestProfile.create({
      data: {
        email,
        name,
        phone,
        location,
      },
      include: {
        preferences: true,
      },
    });
  }

  // Update guest profile
  async update(guestId, data) {
    const { name, phone, location, profileImageUrl, bio, receiveEmails, receiveSMS } = data;
    return prisma.guestProfile.update({
      where: { id: guestId },
      data: {
        name,
        phone,
        location,
        profileImageUrl,
        bio,
        receiveEmails,
        receiveSMS,
        updatedAt: new Date(),
      },
      include: {
        preferences: true,
        savedRestaurants: true,
      },
    });
  }

  // Get reservations by guest email
  async getReservationsByGuest(guestEmail) {
    return prisma.reservation.findMany({
      where: { guestEmail },
      include: {
        branch: {
          include: {
            restaurant: true,
          },
        },
        details: {
          include: {
            table: true,
          },
        },
      },
      orderBy: { reservationDate: 'desc' },
    });
  }

  // Get upcoming reservations
  async getUpcomingReservations(guestEmail) {
    return prisma.reservation.findMany({
      where: {
        guestEmail,
        reservationDate: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        branch: {
          include: {
            restaurant: true,
          },
        },
      },
      orderBy: { reservationDate: 'asc' },
    });
  }

  // Get past reservations
  async getPastReservations(guestEmail) {
    return prisma.reservation.findMany({
      where: {
        guestEmail,
        reservationDate: {
          lt: new Date(),
        },
      },
      include: {
        branch: {
          include: {
            restaurant: true,
          },
        },
      },
      orderBy: { reservationDate: 'desc' },
    });
  }

  // Add saved restaurant
  async addSavedRestaurant(guestId, restaurantData) {
    const { restaurantId, name, cuisine, rating, priceRange, location } = restaurantData;
    return prisma.savedRestaurant.upsert({
      where: {
        guestId_restaurantId: {
          guestId,
          restaurantId,
        },
      },
      update: {
        visitCount: {
          increment: 1,
        },
      },
      create: {
        guestId,
        restaurantId,
        name,
        cuisine,
        rating,
        priceRange,
        location,
      },
    });
  }

  // Remove saved restaurant
  async removeSavedRestaurant(guestId, restaurantId) {
    return prisma.savedRestaurant.delete({
      where: {
        guestId_restaurantId: {
          guestId,
          restaurantId,
        },
      },
    });
  }

  // Get saved restaurants
  async getSavedRestaurants(guestId) {
    return prisma.savedRestaurant.findMany({
      where: { guestId },
      orderBy: { savedAt: 'desc' },
    });
  }

  // Get guest preferences
  async getPreferences(guestId) {
    return prisma.guestPreference.findUnique({
      where: { guestId },
    });
  }

  // Update guest preferences
  async updatePreferences(guestId, data) {
    const { dietaryRestrictions, favoriteCuisines, notes, preferredPartySize } = data;
    return prisma.guestPreference.upsert({
      where: { guestId },
      update: {
        dietaryRestrictions: dietaryRestrictions || undefined,
        favoriteCuisines: favoriteCuisines || undefined,
        notes,
        preferredPartySize,
      },
      create: {
        guestId,
        dietaryRestrictions: dietaryRestrictions || [],
        favoriteCuisines: favoriteCuisines || [],
        notes,
        preferredPartySize,
      },
    });
  }

  // Get guest visit history
  async getVisitHistory(guestId, limit = 10) {
    return prisma.guestVisit.findMany({
      where: { guestId },
      include: {
        restaurant: true,
        branch: true,
      },
      orderBy: { visitDate: 'desc' },
      take: limit,
    });
  }

  // Add guest review
  async addReview(guestId, restaurantId, reviewData) {
    const { rating, title, comment, visitDate } = reviewData;
    return prisma.guestReview.upsert({
      where: {
        guestId_restaurantId_visitDate: {
          guestId,
          restaurantId,
          visitDate: new Date(visitDate),
        },
      },
      update: {
        rating,
        title,
        comment,
      },
      create: {
        guestId,
        restaurantId,
        rating,
        title,
        comment,
        visitDate: new Date(visitDate),
      },
    });
  }

  // Get guest reviews
  async getReviews(guestId) {
    return prisma.guestReview.findMany({
      where: { guestId },
      include: {
        restaurant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = GuestRepository;
