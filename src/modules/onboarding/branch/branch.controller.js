const branchService = require('./branch.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');
const { parsePagination, buildPaginationMeta } = require('../../../shared/helpers/pagination');

const create = asyncHandler(async (req, res) => {
  const branch = await branchService.createBranch(req.restaurantId, req.body, req.auditContext);
  ApiResponse.created('Branch created successfully', branch).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.id);
  ApiResponse.ok('Branch fetched successfully', branch).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { status } = req.query;
  const statuses = status
    ? String(status)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;
  const { data, total } = await branchService.getAllBranches(
    req.restaurantId,
    pagination,
    { statuses }
  );
  const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
  ApiResponse.ok('Branches fetched successfully', data, meta).send(res);
});

const getPending = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, total } = await branchService.getAllBranches(
    req.restaurantId,
    pagination,
    { statuses: ['PENDING'] }
  );
  const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
  ApiResponse.ok('Pending branches fetched successfully', data, meta).send(res);
});

const getLive = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, total } = await branchService.getAllBranches(
    req.restaurantId,
    pagination,
    { statuses: ['LIVE'] }
  );
  const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
  ApiResponse.ok('Live branches fetched successfully', data, meta).send(res);
});

const update = asyncHandler(async (req, res) => {
  const branch = await branchService.updateBranch(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Branch updated successfully', branch).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await branchService.deleteBranch(req.params.id, req.auditContext);
  ApiResponse.ok('Branch deleted successfully').send(res);
});

module.exports = { create, getById, getAll, getPending, getLive, update, remove };
