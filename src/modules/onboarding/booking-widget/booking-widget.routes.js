const { Router } = require('express');
const controller = require('./booking-widget.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createBookingWidgetSchema, updateBookingWidgetSchema } = require('./booking-widget.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('widget:write'), validate(createBookingWidgetSchema), controller.create);
router.get('/', authorize('widget:read'), controller.getAll);
router.get('/:id', authorize('widget:read'), controller.getById);
router.put('/:id', authorize('widget:write'), validate(updateBookingWidgetSchema), controller.update);
router.delete('/:id', authorize('widget:write'), controller.remove);

module.exports = router;
