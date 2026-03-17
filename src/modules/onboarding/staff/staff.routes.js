const { Router } = require('express');
const controller = require('./staff.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { registerStaffSchema, loginSchema, updateStaffSchema, assignBranchSchema } = require('./staff.validator');

const router = Router();

// ── Public (no auth) ─────────────────────────────────────────────────
router.post('/register', validate(registerStaffSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

// ── Protected ────────────────────────────────────────────────────────
router.use(authenticate);

router.get('/', authorize('staff:read'), controller.getAll);
router.get('/:id', authorize('staff:read'), controller.getById);
router.put('/:id', authorize('staff:write'), validate(updateStaffSchema), controller.update);

// Branch assignment
router.post('/branches', authorize('staff:write'), validate(assignBranchSchema), controller.assignBranch);
router.delete('/:staffId/branches/:branchId', authorize('staff:write'), controller.removeBranch);

module.exports = router;
