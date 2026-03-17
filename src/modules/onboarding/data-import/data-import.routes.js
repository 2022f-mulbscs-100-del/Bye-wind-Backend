const { Router } = require('express');
const controller = require('./data-import.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createDataImportSchema, confirmImportSchema } = require('./data-import.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('import:write'), validate(createDataImportSchema), controller.create);
router.get('/', authorize('import:read'), controller.getAll);
router.get('/:id', authorize('import:read'), controller.getById);
router.post('/:id/confirm', authorize('import:write'), validate(confirmImportSchema), controller.confirm);

module.exports = router;
