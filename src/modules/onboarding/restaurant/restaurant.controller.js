const restaurantService = require('./restaurant.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

/**
 * @desc    Get all restaurants (SUPER_ADMIN) or own restaurant (OWNER/HOST/STAFF)
 * @route   GET /api/v1/restaurants
 */
const getAll = asyncHandler(async (req, res) => {
  const result = await restaurantService.getAllRestaurants({
    user: req.user,
    query: req.query,
  });
  ApiResponse.ok('Restaurants fetched successfully', result.data, result.meta).send(res);
});

/**
 * @desc    Register a new restaurant
 * @route   POST /api/v1/restaurants
 */
const create = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.createRestaurant(req.body, req.auditContext);
  ApiResponse.created('Restaurant registered successfully', restaurant).send(res);
});

/**
 * @desc    Get restaurant by ID
 * @route   GET /api/v1/restaurants/:id
 */
const getById = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(req.params.id);
  ApiResponse.ok('Restaurant fetched successfully', restaurant).send(res);
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/v1/restaurants/:id
 */
const update = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurant(
    req.params.id,
    req.body,
    req.auditContext
  );
  ApiResponse.ok('Restaurant updated successfully', restaurant).send(res);
});

/**
 * @desc    Soft-delete restaurant
 * @route   DELETE /api/v1/restaurants/:id
 */
const remove = asyncHandler(async (req, res) => {
  await restaurantService.deleteRestaurant(req.params.id, req.auditContext);
  ApiResponse.ok('Restaurant deleted successfully').send(res);
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
