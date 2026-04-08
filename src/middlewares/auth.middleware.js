const jwt = require('jsonwebtoken');
const { env, prisma, ROLES } = require('../config');
const ApiError = require('../shared/utils/ApiError');
const asyncHandler = require('../shared/utils/asyncHandler');

/**
 * JWT authentication middleware.
 * Supports both User and Staff authentication.
 *
 * User roles (from User model):
 *   GUEST → no restaurant access
 *   OWNER → locked to their owned restaurant (restaurantId from token)
 *   ADMIN → can access any restaurant via x-restaurant-id header
 *
 * Staff roles (from Staff model):
 *   SUPER_ADMIN → restaurantId from x-restaurant-id header
 *   OWNER/HOST/STAFF → locked to their assigned restaurant
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  // 1. Extract token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token is missing or malformed');
  }
  const token = authHeader.split(' ')[1];

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    throw ApiError.unauthorized('Invalid token');
  }

  // 3. Determine if this is a User or Staff token and load accordingly
  let authRecord;
  let isUserAuth = false;

  if (decoded.userId) {
    // USER authentication (new system)
    isUserAuth = true;
    authRecord = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!authRecord || !authRecord.isActive) {
      throw ApiError.unauthorized('Account is inactive or does not exist');
    }

    // For OWNER users, get their restaurant ID from the token
    req.restaurantId = decoded.restaurantId || null;
  } else if (decoded.staffId) {
    // STAFF authentication (legacy system)
    authRecord = await prisma.staff.findUnique({
      where: { id: decoded.staffId },
      select: {
        id: true,
        restaurantId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });

    if (!authRecord || !authRecord.isActive) {
      throw ApiError.unauthorized('Account is inactive or does not exist');
    }

    // Resolve tenant (restaurantId) for staff
    if (authRecord.role === ROLES.SUPER_ADMIN) {
      const headerRestaurantId = req.headers['x-restaurant-id'] || null;
      if (headerRestaurantId) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: headerRestaurantId },
          select: { id: true },
        });
        if (!restaurant) {
          throw ApiError.notFound(`Restaurant ${headerRestaurantId} not found`);
        }
      }
      req.restaurantId = headerRestaurantId;
    } else {
      req.restaurantId = authRecord.restaurantId;
    }
  } else {
    throw ApiError.unauthorized('Invalid token structure');
  }

  // 4. Attach authenticated user to request
  req.user = authRecord;
  req.isUserAuth = isUserAuth;

  next();
});

/**
 * Tenant isolation middleware.
 * Ensures a valid restaurantId is present on the request.
 * Use on routes that MUST operate within a restaurant context.
 *
 * For SUPER_ADMIN: requires the `x-restaurant-id` header.
 * For others: automatically present from auth.
 */
const requireTenant = (req, _res, next) => {
  if (!req.restaurantId) {
    throw ApiError.badRequest(
      'Restaurant context required. Super admins must provide the x-restaurant-id header.'
    );
  }
  next();
};

/**
 * Generate a JWT for a staff member.
 * @param {object} staff - Staff record
 * @returns {string} Signed JWT
 */
function generateToken(staff) {
  return jwt.sign(
    { staffId: staff.id, restaurantId: staff.restaurantId, role: staff.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = { authenticate, generateToken, requireTenant };
