const { Router } = require('express');
const controller = require('./public.restaurants.controller');

const router = Router();

// Public endpoints - no authentication required
router.get('/', controller.getAllPublic);
router.get('/:id/detail', controller.getPublicDetailFull);
router.get('/:id', controller.getPublicById);

module.exports = router;
