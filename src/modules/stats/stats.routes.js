const { Router } = require('express');
const controller = require('./stats.controller');
const { authorize } = require('../../middlewares/rbac.middleware');
const { requireTenant } = require('../../middlewares/auth.middleware');

const router = Router();

// Stats require tenant context
router.use(requireTenant);

router.get('/dashboard', authorize('stats:read'), controller.getDashboardStats);

module.exports = router;
