const { authenticate, generateToken, requireTenant } = require('./auth.middleware');
const { authorize } = require('./rbac.middleware');
const errorHandler = require('./errorHandler.middleware');
const { captureAuditContext, createAuditLog } = require('./auditLogger.middleware');
const { validate } = require('./validate.middleware');

module.exports = {
  authenticate,
  generateToken,
  requireTenant,
  authorize,
  errorHandler,
  captureAuditContext,
  createAuditLog,
  validate,
};
