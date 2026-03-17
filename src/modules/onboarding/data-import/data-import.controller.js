const importService = require('./data-import.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');
const { parsePagination, buildPaginationMeta } = require('../../../shared/helpers/pagination');

const create = asyncHandler(async (req, res) => {
  const importJob = await importService.create(req.restaurantId, req.user.id, req.body, req.auditContext);
  ApiResponse.created('Import job created', importJob).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, total } = await importService.getAll(req.restaurantId, pagination);
  const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
  ApiResponse.ok('Import jobs fetched', data, meta).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const importJob = await importService.getById(req.params.id);
  ApiResponse.ok('Import job fetched', importJob).send(res);
});

const confirm = asyncHandler(async (req, res) => {
  const importJob = await importService.confirmImport(req.params.id, req.auditContext);
  ApiResponse.ok('Import confirmed and processing started', importJob).send(res);
});

module.exports = { create, getAll, getById, confirm };
