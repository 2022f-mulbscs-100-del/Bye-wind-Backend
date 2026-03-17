const { Router } = require('express');
const controller = require('./go-live.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { goLiveActionSchema } = require('./go-live.validator');

const router = Router();

router.get('/:restaurantId', authorize('go-live:read'), validate(goLiveActionSchema), controller.getStatus);
router.post('/:restaurantId/activate', authorize('go-live:write'), validate(goLiveActionSchema), controller.activate);

module.exports = router;
