const tableConfigService = require('./table-config.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const createOrUpdate = asyncHandler(async (req, res) => {
  const config = await tableConfigService.createOrUpdate(req.body, req.auditContext);
  ApiResponse.created('Table config saved', config).send(res);
});

const getByTableId = asyncHandler(async (req, res) => {
  const config = await tableConfigService.getByTableId(req.params.tableId);
  ApiResponse.ok('Table config fetched', config).send(res);
});

const update = asyncHandler(async (req, res) => {
  const config = await tableConfigService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Table config updated', config).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await tableConfigService.delete(req.params.id, req.auditContext);
  ApiResponse.ok('Table config deleted').send(res);
});

module.exports = { createOrUpdate, getByTableId, update, remove };
