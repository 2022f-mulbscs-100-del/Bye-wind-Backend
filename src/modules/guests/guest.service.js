const GuestRepository = require('./guest.repository');
const ApiError = require('../../shared/utils/ApiError');

class GuestService {
  constructor() {
    this.guestRepo = new GuestRepository();
  }

  // Get or create guest profile
  async getOrCreateGuestProfile(email, name, phone, location) {
    let guest = await this.guestRepo.findByEmail(email);
    if (!guest) {
      guest = await this.guestRepo.create({ email, name, phone, location });
      // Create default preferences
      await this.guestRepo.updatePreferences(guest.id, {
        dietaryRestrictions: [],
        favoriteCuisines: [],
      });
    }
    return guest;
  }

  // Get guest profile
  async getGuestProfile(guestId) {
    const guest = await this.guestRepo.findById(guestId);
    if (!guest) {
      throw ApiError.notFound('Guest profile not found');
    }
    return this._formatGuestProfile(guest);
  }

  // Update guest profile
  async updateGuestProfile(guestId, data) {
    const guest = await this.guestRepo.update(guestId, data);
    if (!guest) {
      throw ApiError.notFound('Guest profile not found');
    }
    return this._formatGuestProfile(guest);
  }

  // Get guest full profile data (for profile page)
  async getFullGuestProfile(guestEmail) {
    const guest = await this.guestRepo.findByEmail(guestEmail);
    if (!guest) {
      throw ApiError.notFound('Guest profile not found');
    }

    const [upcomingReservations, pastReservations, savedRestaurants, preferences, reviews] = await Promise.all([
      this.guestRepo.getUpcomingReservations(guestEmail),
      this.guestRepo.getPastReservations(guestEmail),
      this.guestRepo.getSavedRestaurants(guest.id),
      this.guestRepo.getPreferences(guest.id),
      this.guestRepo.getReviews(guest.id),
    ]);

    return {
      profile: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        location: guest.location,
        profileImageUrl: guest.profileImageUrl,
        bio: guest.bio,
        memberSince: guest.memberSince,
        totalBookings: guest.totalBookings,
        totalSpent: guest.totalSpent,
      },
      upcomingBookings: this._formatReservations(upcomingReservations),
      pastBookings: this._formatReservations(pastReservations),
      savedRestaurants: savedRestaurants.map(r => ({
        id: r.id,
        restaurantId: r.restaurantId,
        name: r.name,
        cuisine: r.cuisine,
        rating: r.rating,
        priceRange: r.priceRange,
        location: r.location,
        visitCount: r.visitCount,
      })),
      recentReviews: reviews.slice(0, 5).map(r => ({
        id: r.id,
        restaurantName: r.restaurant.brandName,
        rating: r.rating,
        comment: r.comment,
        title: r.title,
        visitDate: r.visitDate,
      })),
      preferences: {
        dietaryRestrictions: preferences?.dietaryRestrictions || [],
        favoriteCuisines: preferences?.favoriteCuisines || [],
        preferredPartySize: preferences?.preferredPartySize,
        notes: preferences?.notes,
      },
    };
  }

  // Get upcoming reservations
  async getUpcomingReservations(guestEmail) {
    const reservations = await this.guestRepo.getUpcomingReservations(guestEmail);
    return this._formatReservations(reservations);
  }

  // Get past reservations
  async getPastReservations(guestEmail) {
    const reservations = await this.guestRepo.getPastReservations(guestEmail);
    return this._formatReservations(reservations);
  }

  // Get all reservations
  async getAllReservations(guestEmail) {
    const reservations = await this.guestRepo.getReservationsByGuest(guestEmail);
    return this._formatReservations(reservations);
  }

  // Add saved restaurant
  async addSavedRestaurant(guestId, restaurantData) {
    try {
      const saved = await this.guestRepo.addSavedRestaurant(guestId, restaurantData);
      return saved;
    } catch (error) {
      throw ApiError.badRequest('Failed to save restaurant');
    }
  }

  // Remove saved restaurant
  async removeSavedRestaurant(guestId, restaurantId) {
    try {
      await this.guestRepo.removeSavedRestaurant(guestId, restaurantId);
      return { success: true, message: 'Restaurant removed from favorites' };
    } catch (error) {
      throw ApiError.notFound('Saved restaurant not found');
    }
  }

  // Get saved restaurants
  async getSavedRestaurants(guestId) {
    return this.guestRepo.getSavedRestaurants(guestId);
  }

  // Get preferences
  async getPreferences(guestId) {
    return this.guestRepo.getPreferences(guestId);
  }

  // Update preferences
  async updatePreferences(guestId, data) {
    return this.guestRepo.updatePreferences(guestId, data);
  }

  // Get visit history
  async getVisitHistory(guestId, limit = 10) {
    return this.guestRepo.getVisitHistory(guestId, limit);
  }

  // Add review
  async addReview(guestId, restaurantId, reviewData) {
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }
    return this.guestRepo.addReview(guestId, restaurantId, reviewData);
  }

  // Get reviews
  async getReviews(guestId) {
    return this.guestRepo.getReviews(guestId);
  }

  // Helper methods
  _formatGuestProfile(guest) {
    return {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      location: guest.location,
      profileImageUrl: guest.profileImageUrl,
      bio: guest.bio,
      memberSince: guest.memberSince,
      totalBookings: guest.totalBookings,
      totalSpent: guest.totalSpent,
      lastVisitDate: guest.lastVisitDate,
      receiveEmails: guest.receiveEmails,
      receiveSMS: guest.receiveSMS,
    };
  }

  _formatReservations(reservations) {
    return reservations.map(r => ({
      id: r.id,
      restaurantName: r.branch.restaurant.brandName,
      restaurantId: r.branch.restaurantId,
      branchName: r.branch.name,
      date: r.reservationDate,
      time: r.timeSlot,
      guests: r.partySize,
      status: r.status.toLowerCase(),
      phone: r.guestPhone,
      specialRequest: r.specialRequest,
      durationMins: r.turnTimeMins,
      table: r.details?.[0]?.table?.label || 'TBD',
      paymentStatus: r.paymentStatus?.toLowerCase() || 'pending',
      paymentMethod: r.paymentMethod || 'N/A',
      amount: r.totalAmount || 0,
      reference: `RES-${r.id.substring(0, 8).toUpperCase()}`,
      tables: r.details.map(d => ({
        id: d.table.id,
        label: d.table.label,
        capacity: d.table.capacity,
      })),
    }));
  }
}

module.exports = GuestService;
