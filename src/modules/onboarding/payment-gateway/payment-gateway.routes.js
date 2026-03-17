const { Router } = require('express');
const controller = require('./payment-gateway.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createPaymentGatewaySchema, updatePaymentGatewaySchema } = require('./payment-gateway.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('payment:write'), validate(createPaymentGatewaySchema), controller.create);
router.get('/', authorize('payment:read'), controller.getAll);
router.put('/:id', authorize('payment:write'), validate(updatePaymentGatewaySchema), controller.update);
router.delete('/:id', authorize('payment:write'), controller.remove);

module.exports = router;
