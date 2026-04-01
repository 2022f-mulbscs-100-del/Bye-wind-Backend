const floorPlanService = require('./floor-plan.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

// ── Floor Plans ──────────────────────────────────────────────────────
const createFloorPlan = asyncHandler(async (req, res) => {
  const fp = await floorPlanService.createFloorPlan(req.body, req.auditContext);
  ApiResponse.created('Floor plan created', fp).send(res);
});

const getFloorPlan = asyncHandler(async (req, res) => {
  const fp = await floorPlanService.getFloorPlan(req.params.id);
  ApiResponse.ok('Floor plan fetched', fp).send(res);
});

const getFloorPlansByBranch = asyncHandler(async (req, res) => {
  const fps = await floorPlanService.getFloorPlansByBranch(req.query.branchId);
  ApiResponse.ok('Floor plans fetched', fps).send(res);
});

const updateFloorPlan = asyncHandler(async (req, res) => {
  const fp = await floorPlanService.updateFloorPlan(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Floor plan updated', fp).send(res);
});

const deleteFloorPlan = asyncHandler(async (req, res) => {
  await floorPlanService.deleteFloorPlan(req.params.id, req.auditContext);
  ApiResponse.ok('Floor plan deleted').send(res);
});

// ── Zones ────────────────────────────────────────────────────────────
const createZone = asyncHandler(async (req, res) => {
  const zone = await floorPlanService.createZone(req.body, req.auditContext);
  ApiResponse.created('Zone created', zone).send(res);
});

const updateZone = asyncHandler(async (req, res) => {
  const zone = await floorPlanService.updateZone(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Zone updated', zone).send(res);
});

const deleteZone = asyncHandler(async (req, res) => {
  await floorPlanService.deleteZone(req.params.id, req.auditContext);
  ApiResponse.ok('Zone deleted').send(res);
});

// ── Tables ───────────────────────────────────────────────────────────
const createTable = asyncHandler(async (req, res) => {
  const table = await floorPlanService.createTable(req.body, req.auditContext);
  ApiResponse.created('Table created', table).send(res);
});

const getTable = asyncHandler(async (req, res) => {
  const table = await floorPlanService.getTable(req.params.id);
  ApiResponse.ok('Table fetched', table).send(res);
});

const updateTable = asyncHandler(async (req, res) => {
  const table = await floorPlanService.updateTable(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Table updated', table).send(res);
});

const bulkUpdateTables = asyncHandler(async (req, res) => {
  const tables = await floorPlanService.bulkUpdateTables(req.body.tables, req.auditContext);
  ApiResponse.ok('Tables updated', tables).send(res);
});

const bulkCreateTables = asyncHandler(async (req, res) => {
  const tables = await floorPlanService.bulkCreateTables(req.body.tables, req.auditContext);
  ApiResponse.created('Tables created', tables).send(res);
});

const deleteTable = asyncHandler(async (req, res) => {
  await floorPlanService.deleteTable(req.params.id, req.auditContext);
  ApiResponse.ok('Table deleted').send(res);
});

module.exports = {
  createFloorPlan, getFloorPlan, getFloorPlansByBranch, updateFloorPlan, deleteFloorPlan,
  createZone, updateZone, deleteZone,
  createTable, getTable, updateTable, bulkUpdateTables, bulkCreateTables, deleteTable,
};
