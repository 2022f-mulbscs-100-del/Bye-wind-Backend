/**
 * Standardized API response wrapper.
 * Every successful response goes through this for consistency.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable response message
   * @param {*}      data       - Response payload
   * @param {object} meta       - Optional metadata (pagination, counts, etc.)
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  // ── Convenience static factories ──────────────────────────────────

  static ok(message = 'Success', data = null, meta = null) {
    return new ApiResponse(200, message, data, meta);
  }

  static created(message = 'Created successfully', data = null) {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = 'Deleted successfully') {
    return new ApiResponse(204, message);
  }

  /**
   * Send the response via Express `res` object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    });
  }
}

module.exports = ApiResponse;
