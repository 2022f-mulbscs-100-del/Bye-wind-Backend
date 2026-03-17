const ApiError = require('../shared/utils/ApiError');
const logger = require('../shared/utils/logger');
const { env } = require('../config');

/**
 * Global error handler — catches all thrown / forwarded errors.
 * Must be registered LAST with app.use().
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // If it's not our ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], false);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors.length && { errors: error.errors }),
    ...(env.isDev && { stack: err.stack }),
  };

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${error.statusCode}: ${error.message}`, {
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${error.statusCode}: ${error.message}`);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
