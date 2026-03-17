const { Router } = require('express');
const controller = require('./pos-integration.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createPOSIntegrationSchema, updatePOSIntegrationSchema } = require('./pos-integration.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('pos:write'), validate(createPOSIntegrationSchema), controller.create);
router.get('/', authorize('pos:read'), controller.getAll);
router.put('/:id', authorize('pos:write'), validate(updatePOSIntegrationSchema), controller.update);
router.delete('/:id', authorize('pos:write'), controller.remove);

module.exports = router;
