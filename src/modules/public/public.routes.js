const { Router } = require('express');
const publicRestaurantRoutes = require('./restaurants/public.restaurants.routes');

const router = Router();

// Public API routes (no authentication required)
router.use('/restaurants', publicRestaurantRoutes);

module.exports = router;
