const { Router } = require('express');
const c = require('./floor-plan.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const v = require('./floor-plan.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

// ── Floor Plans ──────────────────────────────────────────────────────
router.post('/', authorize('floor-plan:write'), validate(v.createFloorPlanSchema), c.createFloorPlan);
router.get('/', authorize('floor-plan:read'), c.getFloorPlansByBranch);
router.get('/:id', authorize('floor-plan:read'), c.getFloorPlan);
router.put('/:id', authorize('floor-plan:write'), validate(v.updateFloorPlanSchema), c.updateFloorPlan);
router.delete('/:id', authorize('floor-plan:write'), c.deleteFloorPlan);

// ── Zones ────────────────────────────────────────────────────────────
router.post('/zones', authorize('floor-plan:write'), validate(v.createZoneSchema), c.createZone);
router.put('/zones/:id', authorize('floor-plan:write'), validate(v.updateZoneSchema), c.updateZone);
router.delete('/zones/:id', authorize('floor-plan:write'), c.deleteZone);

// ── Tables ───────────────────────────────────────────────────────────
router.post('/tables', authorize('floor-plan:write'), validate(v.createTableSchema), c.createTable);
router.get('/tables/:id', authorize('floor-plan:read'), c.getTable);
router.put('/tables/:id', authorize('floor-plan:write'), validate(v.updateTableSchema), c.updateTable);
router.put('/tables/bulk/positions', authorize('floor-plan:write'), validate(v.bulkUpdateTablesSchema), c.bulkUpdateTables);
router.post('/tables/bulk/create', authorize('floor-plan:write'), c.bulkCreateTables);
router.delete('/tables/:id', authorize('floor-plan:write'), c.deleteTable);

module.exports = router;
