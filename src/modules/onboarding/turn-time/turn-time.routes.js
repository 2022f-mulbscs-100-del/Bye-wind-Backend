const { Router } = require('express');
const controller = require('./turn-time.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createTurnTimeSchema, updateTurnTimeSchema } = require('./turn-time.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('turn-time:write'), validate(createTurnTimeSchema), controller.create);
router.get('/', authorize('turn-time:read'), controller.getByBranch);
router.put('/:id', authorize('turn-time:write'), validate(updateTurnTimeSchema), controller.update);
router.delete('/:id', authorize('turn-time:write'), controller.remove);

module.exports = router;
