const policyService = require('./reservation-policy.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const createOrUpdate = asyncHandler(async (req, res) => {
  const policy = await policyService.createOrUpdate(req.body, req.auditContext);
  ApiResponse.created('Reservation policy saved', policy).send(res);
});

const getByBranch = asyncHandler(async (req, res) => {
  const policy = await policyService.getByBranch(req.query.branchId);
  ApiResponse.ok('Reservation policy fetched', policy).send(res);
});

const update = asyncHandler(async (req, res) => {
  const policy = await policyService.update(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Reservation policy updated', policy).send(res);
});

module.exports = { createOrUpdate, getByBranch, update };
