// Guest/User authentication routes
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { signupSchema, loginSchema, registerRestaurantSchema } = require('./auth.validator');

// Public routes - no authentication needed
router.post('/signup', validate({ body: signupSchema }), authController.signup);
router.post('/login', validate({ body: loginSchema }), authController.login);

// Protected routes - authentication required
router.post('/register-restaurant', authenticate, validate({ body: registerRestaurantSchema }), authController.registerRestaurant);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);

module.exports = router;
