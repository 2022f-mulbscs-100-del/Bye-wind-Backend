const { Router } = require('express');
const c = require('./reservation.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { requireTenant } = require('../../middlewares/auth.middleware');

const router = Router();

// All routes require tenant context
router.use(requireTenant);

// Create a new reservation (public - no auth required for guest booking)
router.post('/', validate(null), c.createReservation);

// Get all reservations for a specific date
router.get('/by-date', authorize('reservation:read'), c.getReservationsByDate);

// Get guest's reservations by email (public)
router.get('/by-guest', c.getReservationsByGuest);

// Get available time slots for a branch and date
router.get('/available-slots', c.getAvailableTimeSlots);

// Get available tables for a floor/date/time
router.get('/available-tables', c.getAvailableTables);

// Get all tables with availability status
router.get('/tables-availability', c.getTablesWithAvailability);

// Get table count for a floor
router.get('/table-count', c.getTableCountForFloor);

// Get total capacity for a floor
router.get('/total-capacity', c.getTotalCapacityForFloor);

// Get single reservation
router.get('/:id', authorize('reservation:read'), c.getReservation);

// Update reservation status
router.put('/:id/status', authorize('reservation:write'), c.updateReservationStatus);

// Cancel reservation
router.delete('/:id', authorize('reservation:write'), c.cancelReservation);

module.exports = router;
