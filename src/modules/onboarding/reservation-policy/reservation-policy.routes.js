const { Router } = require('express');
const controller = require('./reservation-policy.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createReservationPolicySchema, updateReservationPolicySchema } = require('./reservation-policy.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('policy:write'), validate(createReservationPolicySchema), controller.createOrUpdate);
router.get('/', authorize('policy:read'), controller.getByBranch);
router.put('/:id', authorize('policy:write'), validate(updateReservationPolicySchema), controller.update);

module.exports = router;
