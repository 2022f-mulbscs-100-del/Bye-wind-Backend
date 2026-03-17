/**
 * Custom API Error class — carries HTTP status code and operational flag.
 * Thrown anywhere in the codebase, caught by the global error handler middleware.
 */
class ApiError extends Error {
  /**
   * @param {number}  statusCode - HTTP status code (4xx / 5xx)
   * @param {string}  message    - Human-readable error message
   * @param {Array}   errors     - Optional array of field-level errors (validation)
   * @param {boolean} isOperational - True = expected error, False = programming bug
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

  // ── Convenience static factories ──────────────────────────────────

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}

module.exports = ApiError;
