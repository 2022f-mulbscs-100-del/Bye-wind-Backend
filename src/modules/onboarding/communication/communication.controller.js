const commService = require('./communication.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const create = asyncHandler(async (req, res) => {
  const config = await commService.create(req.restaurantId, req.body, req.auditContext);
  ApiResponse.created('Communication channel configured', config).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const configs = await commService.getAll(req.restaurantId);
  ApiResponse.ok('Communication channels fetched', configs).send(res);
});

const update = asyncHandler(async (req, res) => {
  const config = await commService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Communication channel updated', config).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await commService.delete(req.params.id, req.auditContext);
  ApiResponse.ok('Communication channel removed').send(res);
});

const bulkUpsert = asyncHandler(async (req, res) => {
  const configs = await commService.bulkUpsert(req.restaurantId, req.body.channels, req.auditContext);
  ApiResponse.ok('Communication channels updated', configs).send(res);
});

module.exports = { create, getAll, update, remove, bulkUpsert };
