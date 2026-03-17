const paymentService = require('./payment-gateway.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const create = asyncHandler(async (req, res) => {
  const gw = await paymentService.create(req.restaurantId, req.body, req.auditContext);
  ApiResponse.created('Payment gateway configured', gw).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const gws = await paymentService.getAll(req.restaurantId);
  ApiResponse.ok('Payment gateways fetched', gws).send(res);
});

const update = asyncHandler(async (req, res) => {
  const gw = await paymentService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Payment gateway updated', gw).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await paymentService.delete(req.params.id, req.auditContext);
  ApiResponse.ok('Payment gateway removed').send(res);
});

module.exports = { create, getAll, update, remove };
