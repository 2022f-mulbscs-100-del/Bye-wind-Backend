const { Router } = require('express');
const controller = require('./audit-logs.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { queryAuditLogsSchema } = require('./audit-logs.validator');

const router = Router();

router.get('/', authorize('audit:read'), validate(queryAuditLogsSchema), controller.getAll);
router.get('/:id', authorize('audit:read'), controller.getById);

module.exports = router;
