const staffService = require('./staff.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');
const { parsePagination, buildPaginationMeta } = require('../../../shared/helpers/pagination');

const register = asyncHandler(async (req, res) => {
  const result = await staffService.register(req.body, req.auditContext);
  ApiResponse.created('Staff registered successfully', result).send(res);
});

const login = asyncHandler(async (req, res) => {
  const result = await staffService.login(req.body.email, req.body.password);
  ApiResponse.ok('Login successful', result).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const staff = await staffService.getById(req.params.id);
  ApiResponse.ok('Staff fetched', staff).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  pagination.branchId = req.query.branchId;
  const { data, total } = await staffService.getAll(req.restaurantId, pagination);
  const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
  ApiResponse.ok('Staff fetched', data, meta).send(res);
});

const update = asyncHandler(async (req, res) => {
  const staff = await staffService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Staff updated', staff).send(res);
});

const assignBranch = asyncHandler(async (req, res) => {
  const result = await staffService.assignBranch(req.body.staffId, req.body.branchId, req.body.isPrimary, req.auditContext);
  ApiResponse.created('Branch assigned', result).send(res);
});

const removeBranch = asyncHandler(async (req, res) => {
  await staffService.removeBranch(req.params.staffId, req.params.branchId, req.auditContext);
  ApiResponse.ok('Branch assignment removed').send(res);
});

module.exports = { register, login, getById, getAll, update, assignBranch, removeBranch };
