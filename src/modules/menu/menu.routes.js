const { Router } = require('express');
const controller = require('./menu.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { requireTenant } = require('../../middlewares/auth.middleware');
const {
  createMenuItemSchema,
  updateMenuItemSchema,
  listMenuItemsSchema,
  menuItemIdParam,
} = require('./menu.validator');

const router = Router({ mergeParams: true }); // mergeParams to access :branchId

// Require tenant context
router.use(requireTenant);

// Create menu item
router.post(
  '/',
  authorize('menu:write'),
  validate(createMenuItemSchema),
  controller.create
);

// Get menu items by branch
router.get(
  '/',
  authorize('menu:read'),
  validate(listMenuItemsSchema),
  controller.getByBranch
);

// Get single menu item
router.get(
  '/:id',
  authorize('menu:read'),
  validate(menuItemIdParam),
  controller.getById
);

// Update menu item
router.put(
  '/:id',
  authorize('menu:write'),
  validate(updateMenuItemSchema),
  controller.update
);

// Delete menu item
router.delete(
  '/:id',
  authorize('menu:write'),
  validate(menuItemIdParam),
  controller.remove
);

module.exports = router;
