const posService = require('./pos-integration.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const create = asyncHandler(async (req, res) => {
  const integration = await posService.create(req.restaurantId, req.body, req.auditContext);
  ApiResponse.created('POS integration configured', integration).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const integrations = await posService.getAll(req.restaurantId);
  ApiResponse.ok('POS integrations fetched', integrations).send(res);
});

const update = asyncHandler(async (req, res) => {
  const integration = await posService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('POS integration updated', integration).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await posService.delete(req.params.id, req.auditContext);
  ApiResponse.ok('POS integration removed').send(res);
});

module.exports = { create, getAll, update, remove };
