const { Router } = require('express');
const controller = require('./branch.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createBranchSchema, updateBranchSchema, branchIdParam } = require('./branch.validator');

const router = Router();

// requireTenant ensures req.restaurantId is always set.
// OWNER/HOST/STAFF → automatically set from JWT.
// SUPER_ADMIN      → must send x-restaurant-id header.
router.use(requireTenant);

router.post('/', authorize('branch:write'), validate(createBranchSchema), controller.create);
router.get('/', authorize('branch:read'), controller.getAll);
router.get('/:id', authorize('branch:read'), validate(branchIdParam), controller.getById);
router.put('/:id', authorize('branch:write'), validate(updateBranchSchema), controller.update);
router.delete('/:id', authorize('branch:write'), validate(branchIdParam), controller.remove);

module.exports = router;
