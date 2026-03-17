const { prisma } = require('../config');
const logger = require('../shared/utils/logger');

/**
 * Express middleware that captures request context for audit logging.
 * Attaches `req.auditContext` which services use when writing audit records.
 *
 * The actual audit log INSERT happens in service layer after successful mutations
 * by calling `createAuditLog()`.
 */
const captureAuditContext = (req, _res, next) => {
  req.auditContext = {
    staffId: req.user?.id || null,
    restaurantId: req.restaurantId || null,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent') || null,
  };
  next();
};

/**
 * Create an audit log entry. Called from service layer after mutations.
 *
 * @param {object} params
 * @param {string} params.entity       - Model name (e.g. "Restaurant", "Table")
 * @param {string} params.entityId     - ID of the changed record
 * @param {string} params.action       - AuditAction enum value
 * @param {object} [params.oldValue]   - Snapshot before change
 * @param {object} [params.newValue]   - Snapshot after change
 * @param {object} [params.metadata]   - Extra context
 * @param {object} params.auditContext - From req.auditContext
 */
async function createAuditLog({
  entity,
  entityId,
  action,
  oldValue = null,
  newValue = null,
  metadata = null,
  auditContext = {},
}) {
  try {
    await prisma.auditLog.create({
      data: {
        restaurantId: auditContext.restaurantId,
        staffId: auditContext.staffId,
        entity,
        entityId,
        action,
        oldValue,
        newValue,
        metadata,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      },
    });
  } catch (err) {
    // Audit log failures should never break the main flow
    logger.error('Failed to create audit log', { error: err.message, entity, entityId, action });
  }
}

module.exports = { captureAuditContext, createAuditLog };
