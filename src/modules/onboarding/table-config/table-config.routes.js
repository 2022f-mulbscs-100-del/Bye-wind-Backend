const { Router } = require('express');
const controller = require('./table-config.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createTableConfigSchema, updateTableConfigSchema } = require('./table-config.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('table-config:write'), validate(createTableConfigSchema), controller.createOrUpdate);
router.get('/table/:tableId', authorize('table-config:read'), controller.getByTableId);
router.put('/:id', authorize('table-config:write'), validate(updateTableConfigSchema), controller.update);
router.delete('/:id', authorize('table-config:write'), controller.remove);

module.exports = router;
