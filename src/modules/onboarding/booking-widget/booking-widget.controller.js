const widgetService = require('./booking-widget.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const create = asyncHandler(async (req, res) => {
  const widget = await widgetService.create(req.restaurantId, req.body, req.auditContext);
  ApiResponse.created('Booking widget created', widget).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const widgets = await widgetService.getAll(req.restaurantId);
  ApiResponse.ok('Booking widgets fetched', widgets).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const widget = await widgetService.getById(req.params.id);
  ApiResponse.ok('Booking widget fetched', widget).send(res);
});

const update = asyncHandler(async (req, res) => {
  const widget = await widgetService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Booking widget updated', widget).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await widgetService.delete(req.params.id, req.auditContext);
  ApiResponse.ok('Booking widget removed').send(res);
});

module.exports = { create, getAll, getById, update, remove };
