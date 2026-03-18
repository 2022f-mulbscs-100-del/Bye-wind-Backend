const { Router } = require('express');
const controller = require('./communication.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const { createCommunicationSchema, updateCommunicationSchema } = require('./communication.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

router.post('/', authorize('communication:write'), validate(createCommunicationSchema), controller.create);
router.post('/bulk', authorize('communication:write'), controller.bulkUpsert);
router.get('/', authorize('communication:read'), controller.getAll);
router.put('/:id', authorize('communication:write'), validate(updateCommunicationSchema), controller.update);
router.delete('/:id', authorize('communication:write'), controller.remove);

module.exports = router;
