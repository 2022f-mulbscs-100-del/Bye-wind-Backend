const GuestService = require('./guest.service');
const { ApiResponse, asyncHandler } = require('../../shared/utils');

const guestService = new GuestService();

// Get guest profile by ID
const getGuestProfile = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const profile = await guestService.getGuestProfile(guestId);
  ApiResponse.ok('Guest profile fetched', profile).send(res);
});

// Get guest full profile (for profile page) - by email
const getFullGuestProfile = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const profile = await guestService.getFullGuestProfile(email);
  ApiResponse.ok('Full guest profile fetched', profile).send(res);
});

// Update guest profile
const updateGuestProfile = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const updatedProfile = await guestService.updateGuestProfile(guestId, req.body);
  ApiResponse.ok('Guest profile updated', updatedProfile).send(res);
});

// Get upcoming reservations
const getUpcomingReservations = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const reservations = await guestService.getUpcomingReservations(email);
  ApiResponse.ok('Upcoming reservations fetched', reservations).send(res);
});

// Get past reservations
const getPastReservations = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const reservations = await guestService.getPastReservations(email);
  ApiResponse.ok('Past reservations fetched', reservations).send(res);
});

// Get all reservations
const getAllReservations = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const reservations = await guestService.getAllReservations(email);
  ApiResponse.ok('All reservations fetched', reservations).send(res);
});

// Add saved restaurant
const addSavedRestaurant = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const saved = await guestService.addSavedRestaurant(guestId, req.body);
  ApiResponse.created('Restaurant saved', saved).send(res);
});

// Remove saved restaurant
const removeSavedRestaurant = asyncHandler(async (req, res) => {
  const { guestId, restaurantId } = req.params;
  const result = await guestService.removeSavedRestaurant(guestId, restaurantId);
  ApiResponse.ok(result.message, result).send(res);
});

// Get saved restaurants
const getSavedRestaurants = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const saved = await guestService.getSavedRestaurants(guestId);
  ApiResponse.ok('Saved restaurants fetched', saved).send(res);
});

// Get preferences
const getPreferences = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const preferences = await guestService.getPreferences(guestId);
  ApiResponse.ok('Preferences fetched', preferences).send(res);
});

// Update preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const preferences = await guestService.updatePreferences(guestId, req.body);
  ApiResponse.ok('Preferences updated', preferences).send(res);
});

// Get visit history
const getVisitHistory = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const { limit = 10 } = req.query;
  const history = await guestService.getVisitHistory(guestId, parseInt(limit));
  ApiResponse.ok('Visit history fetched', history).send(res);
});

// Add review
const addReview = asyncHandler(async (req, res) => {
  const { guestId, restaurantId } = req.params;
  const review = await guestService.addReview(guestId, restaurantId, req.body);
  ApiResponse.created('Review added', review).send(res);
});

// Get reviews
const getReviews = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const reviews = await guestService.getReviews(guestId);
  ApiResponse.ok('Reviews fetched', reviews).send(res);
});

module.exports = {
  getGuestProfile,
  getFullGuestProfile,
  updateGuestProfile,
  getUpcomingReservations,
  getPastReservations,
  getAllReservations,
  addSavedRestaurant,
  removeSavedRestaurant,
  getSavedRestaurants,
  getPreferences,
  updatePreferences,
  getVisitHistory,
  addReview,
  getReviews,
};
