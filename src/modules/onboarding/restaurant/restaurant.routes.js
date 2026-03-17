const { Router } = require('express');
const controller = require('./restaurant.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdParam,
} = require('./restaurant.validator');

const router = Router();

router.post(
  '/',
  authorize('restaurant:write'),
  validate(createRestaurantSchema),
  controller.create
);

router.get(
  '/',
  authorize('restaurant:read'),
  controller.getAll
);

router.get(
  '/:id',
  authorize('restaurant:read'),
  validate(restaurantIdParam),
  controller.getById
);

router.put(
  '/:id',
  authorize('restaurant:write'),
  validate(updateRestaurantSchema),
  controller.update
);

router.delete(
  '/:id',
  authorize('restaurant:write'),
  validate(restaurantIdParam),
  controller.remove
);

module.exports = router;
