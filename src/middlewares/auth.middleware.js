const jwt = require('jsonwebtoken');
const { env, prisma, ROLES } = require('../config');
const ApiError = require('../shared/utils/ApiError');
const asyncHandler = require('../shared/utils/asyncHandler');

/**
 * JWT authentication middleware.
 *
 * Behaviour by role:
 *   SUPER_ADMIN → restaurantId is resolved from the `x-restaurant-id` header.
 *                 If the header is missing, req.restaurantId stays null
 *                 (acceptable for platform-wide endpoints).
 *   OWNER/HOST/STAFF → restaurantId comes from the staff record.
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

  // 3. Load staff from DB
  const staff = await prisma.staff.findUnique({
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

  if (!staff || !staff.isActive) {
    throw ApiError.unauthorized('Account is inactive or does not exist');
  }

  // 4. Attach user to request
  req.user = staff;

  // 5. Resolve tenant (restaurantId)
  if (staff.role === ROLES.SUPER_ADMIN) {
    // Super admins specify the target restaurant via header (optional).
    // Routes that require a restaurantId will validate its presence.
    const headerRestaurantId = req.headers['x-restaurant-id'] || null;

    // Validate the restaurant exists if header is provided
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
    // Regular roles — locked to their own restaurant
    req.restaurantId = staff.restaurantId;
  }

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
