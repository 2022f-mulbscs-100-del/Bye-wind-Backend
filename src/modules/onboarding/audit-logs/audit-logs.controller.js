const auditService = require('./audit-logs.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');
const { parsePagination, buildPaginationMeta } = require('../../../shared/helpers/pagination');

const getAll = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { entity, entityId, staffId, action, startDate, endDate } = req.query;
  const filters = { entity, entityId, staffId, action, startDate, endDate };

  const { data, total } = await auditService.getAll(req.restaurantId, filters, pagination);
  const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
  ApiResponse.ok('Audit logs fetched', data, meta).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const log = await auditService.getById(req.params.id);
  ApiResponse.ok('Audit log fetched', log).send(res);
});

module.exports = { getAll, getById };
