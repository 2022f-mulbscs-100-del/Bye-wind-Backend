const { Router } = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

// ── Sub-module route imports ────────────────────────────────────────
const restaurantRoutes = require('../modules/onboarding/restaurant/restaurant.routes');
const branchRoutes = require('../modules/onboarding/branch/branch.routes');
const businessHoursRoutes = require('../modules/onboarding/business-hours/business-hours.routes');
const floorPlanRoutes = require('../modules/onboarding/floor-plan/floor-plan.routes');
const tableConfigRoutes = require('../modules/onboarding/table-config/table-config.routes');
const turnTimeRoutes = require('../modules/onboarding/turn-time/turn-time.routes');
const reservationPolicyRoutes = require('../modules/onboarding/reservation-policy/reservation-policy.routes');
const staffRoutes = require('../modules/onboarding/staff/staff.routes');
const paymentGatewayRoutes = require('../modules/onboarding/payment-gateway/payment-gateway.routes');
const communicationRoutes = require('../modules/onboarding/communication/communication.routes');
const posIntegrationRoutes = require('../modules/onboarding/pos-integration/pos-integration.routes');
const dataImportRoutes = require('../modules/onboarding/data-import/data-import.routes');
const brandingRoutes = require('../modules/onboarding/branding/branding.routes');
const bookingWidgetRoutes = require('../modules/onboarding/booking-widget/booking-widget.routes');
const auditLogRoutes = require('../modules/onboarding/audit-logs/audit-logs.routes');
const goLiveRoutes = require('../modules/onboarding/go-live/go-live.routes');
const menuRoutes = require('../modules/menu/menu.routes');
const menuController = require('../modules/menu/menu.controller');
const reservationRoutes = require('../modules/reservations/reservation.routes');
const guestRoutes = require('../modules/guests/guest.routes');
const publicRoutes = require('../modules/public/public.routes');

const router = Router();

// ── Public routes (no auth) ─────────────────────────────────────────
// Public API endpoints (no authentication required)
router.use('/public', publicRoutes);

// Guest profile routes (public - email-based profiles)
router.use('/guests', guestRoutes);

// Staff login / registration are handled inside staff routes
router.use('/staff', staffRoutes);

// ── Protected routes (require authentication) ───────────────────────
router.use(authenticate);

router.use('/restaurants', restaurantRoutes);
router.use('/branches', branchRoutes);
// Master level menu items endpoint (all branches)
router.get('/menu-items', requireTenant, authorize('menu:read'), menuController.getAll);
router.use('/branches/:branchId/menu-items', menuRoutes);
router.use('/business-hours', businessHoursRoutes);
router.use('/floor-plans', floorPlanRoutes);
router.use('/table-configs', tableConfigRoutes);
router.use('/turn-times', turnTimeRoutes);
router.use('/reservation-policies', reservationPolicyRoutes);
router.use('/payment-gateways', paymentGatewayRoutes);
router.use('/communication-channels', communicationRoutes);
router.use('/pos-integrations', posIntegrationRoutes);
router.use('/data-imports', dataImportRoutes);
router.use('/branding', brandingRoutes);
router.use('/booking-widgets', bookingWidgetRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/go-live', goLiveRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
