const { ROLES, PERMISSIONS } = require('../config/constants');
const ApiError = require('../shared/utils/ApiError');

/**
 * Role-based access control middleware factory.
 *
 * Access resolution order:
 *   1. SUPER_ADMIN → always allowed (full platform access)
 *   2. Role-level check → is the user's role in the permission's allowed list?
 *   3. Granular override → does the staff record carry an explicit permission override?
 *
 * Usage:
 *   router.post('/tables', authenticate, authorize('table-config:write'), controller.create);
 *
 * @param {string} permission - Permission key from constants.PERMISSIONS
 * @returns {Function} Express middleware
 */
const authorize = (permission) => (req, _res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  // ── 1. SUPER_ADMIN bypass ─────────────────────────────────────────
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  // ── 2. Lookup permission in the matrix ────────────────────────────
  const allowedRoles = PERMISSIONS[permission];

  if (!allowedRoles) {
    throw ApiError.internal(`Unknown permission: ${permission}`);
  }

  // ── 3. Role-level check ───────────────────────────────────────────
  if (allowedRoles.includes(req.user.role)) {
    return next();
  }

  // ── 4. Granular override check ────────────────────────────────────
  const overrides = req.user.permissions || {};
  if (overrides[permission] === true) {
    return next();
  }

  // ── Denied ────────────────────────────────────────────────────────
  throw ApiError.forbidden(
    `You do not have permission to perform this action [${permission}]`
  );
};

module.exports = { authorize };
