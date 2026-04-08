const goLiveService = require('./go-live.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const getStatus = asyncHandler(async (req, res) => {
  const status = await goLiveService.getStatus(req.params.restaurantId);
  ApiResponse.ok('Go-live status fetched', status).send(res);
});

const activate = asyncHandler(async (req, res) => {
  const result = await goLiveService.activate(req.params.restaurantId, req.query.branchId, req.auditContext);
  ApiResponse.ok(result.message, result).send(res);
});

module.exports = { getStatus, activate };
