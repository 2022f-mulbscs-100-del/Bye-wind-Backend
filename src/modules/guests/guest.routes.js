const { Router } = require('express');
const c = require('./guest.controller');

const router = Router();

// ── Guest Profile Routes ────────────────────────────────────────
// Get guest profile (public - use email query param)
router.get('/profile', c.getFullGuestProfile);

// Get guest profile by ID (public)
router.get('/:guestId', c.getGuestProfile);

// Update guest profile (public - can be authenticated in future)
router.put('/:guestId', c.updateGuestProfile);

// ── Reservation Routes ──────────────────────────────────────────
// Get upcoming reservations (public - use email query param)
router.get('/reservations/upcoming', c.getUpcomingReservations);

// Get past reservations (public - use email query param)
router.get('/reservations/past', c.getPastReservations);

// Get all reservations (public - use email query param)
router.get('/reservations/all', c.getAllReservations);

// ── Saved Restaurants / Favorites ────────────────────────────────
// Add saved restaurant
router.post('/:guestId/restaurants/save', c.addSavedRestaurant);

// Remove saved restaurant
router.delete('/:guestId/restaurants/:restaurantId/unsave', c.removeSavedRestaurant);

// Get saved restaurants
router.get('/:guestId/restaurants/saved', c.getSavedRestaurants);

// ── Preferences Routes ──────────────────────────────────────────
// Get preferences
router.get('/:guestId/preferences', c.getPreferences);

// Update preferences
router.put('/:guestId/preferences', c.updatePreferences);

// ── Visit History & Reviews ────────────────────────────────────
// Get visit history
router.get('/:guestId/visits', c.getVisitHistory);

// Add review
router.post('/:guestId/restaurants/:restaurantId/review', c.addReview);

// Get reviews
router.get('/:guestId/reviews', c.getReviews);

module.exports = router;
