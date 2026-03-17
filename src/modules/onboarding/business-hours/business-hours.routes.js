const { Router } = require('express');
const controller = require('./business-hours.controller');
const { validate } = require('../../../middlewares/validate.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { requireTenant } = require('../../../middlewares/auth.middleware');
const {
  bulkUpsertBusinessHoursSchema,
  branchIdQuery,
  createHolidaySchema,
  updateHolidaySchema,
} = require('./business-hours.validator');

const router = Router();

// SUPER_ADMIN must send x-restaurant-id header; other roles get it from JWT
router.use(requireTenant);

// ── Business Hours ───────────────────────────────────────────────────
router.get('/', authorize('hours:read'), validate(branchIdQuery), controller.getSchedule);
router.put('/bulk', authorize('hours:write'), validate(bulkUpsertBusinessHoursSchema), controller.bulkUpsertSchedule);

// ── Holidays ─────────────────────────────────────────────────────────
router.get('/holidays', authorize('hours:read'), validate(branchIdQuery), controller.getHolidays);
router.post('/holidays', authorize('hours:write'), validate(createHolidaySchema), controller.createHoliday);
router.put('/holidays/:id', authorize('hours:write'), validate(updateHolidaySchema), controller.updateHoliday);
router.delete('/holidays/:id', authorize('hours:write'), controller.deleteHoliday);

module.exports = router;
