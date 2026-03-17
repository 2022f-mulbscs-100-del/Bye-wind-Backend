const turnTimeService = require('./turn-time.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const create = asyncHandler(async (req, res) => {
  const rule = await turnTimeService.create(req.body, req.auditContext);
  ApiResponse.created('Turn time rule created', rule).send(res);
});

const getByBranch = asyncHandler(async (req, res) => {
  const rules = await turnTimeService.getByBranch(req.query.branchId);
  ApiResponse.ok('Turn time rules fetched', rules).send(res);
});

const update = asyncHandler(async (req, res) => {
  const rule = await turnTimeService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Turn time rule updated', rule).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await turnTimeService.delete(req.params.id, req.auditContext);
  ApiResponse.ok('Turn time rule deleted').send(res);
});

module.exports = { create, getByBranch, update, remove };
