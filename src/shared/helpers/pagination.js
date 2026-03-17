const { PAGINATION } = require('../../config/constants');

/**
 * Parse pagination query params and return Prisma-compatible skip/take values.
 *
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number, take: number }}
 */
function parsePagination(query = {}) {
  let page = parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Build pagination meta object for API responses.
 *
 * @param {number} total - Total record count
 * @param {number} page  - Current page
 * @param {number} limit - Items per page
 * @returns {{ total, page, limit, totalPages, hasNextPage, hasPrevPage }}
 */
function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationMeta };
