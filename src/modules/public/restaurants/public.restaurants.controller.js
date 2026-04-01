const publicRestaurantService = require('./public.restaurants.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

/**
 * @desc    Get all active restaurants (public endpoint, no auth required)
 * @route   GET /api/v1/public/restaurants
 */
const getAllPublic = asyncHandler(async (req, res) => {
  const result = await publicRestaurantService.getAllPublicRestaurants({
    query: req.query,
  });
  ApiResponse.ok('Restaurants fetched successfully', result.data, result.meta).send(res);
});

/**
 * @desc    Get restaurant details by ID (public endpoint, no auth required)
 * @route   GET /api/v1/public/restaurants/:id
 */
const getPublicById = asyncHandler(async (req, res) => {
  const restaurant = await publicRestaurantService.getPublicRestaurantById(req.params.id);
  ApiResponse.ok('Restaurant fetched successfully', restaurant).send(res);
});

/**
 * @desc    Get restaurant detail WITH all related data for public viewing
 * @route   GET /api/v1/public/restaurants/:id/detail
 */
const getPublicDetailFull = asyncHandler(async (req, res) => {
  const detail = await publicRestaurantService.getRestaurantDetailFull(req.params.id);
  ApiResponse.ok('Restaurant detail fetched successfully', detail).send(res);
});

module.exports = {
  getAllPublic,
  getPublicById,
  getPublicDetailFull,
};
