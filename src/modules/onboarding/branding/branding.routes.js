const { Router } = require('express');
const controller = require('./branding.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { upsertBrandingSchema } = require('./branding.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.get('/', authorize('branding:read'), controller.get);
router.put('/', authorize('branding:write'), validate(upsertBrandingSchema), controller.upsert);

module.exports = router;
