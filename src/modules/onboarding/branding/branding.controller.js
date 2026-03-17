const brandingService = require('./branding.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const get = asyncHandler(async (req, res) => {
  const branding = await brandingService.get(req.restaurantId);
  ApiResponse.ok('Branding fetched', branding).send(res);
});

const upsert = asyncHandler(async (req, res) => {
  const branding = await brandingService.upsert(req.restaurantId, req.body, req.auditContext);
  ApiResponse.ok('Branding saved', branding).send(res);
});

module.exports = { get, upsert };
