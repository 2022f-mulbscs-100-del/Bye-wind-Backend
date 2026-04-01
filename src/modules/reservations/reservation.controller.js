const reservationService = require('./reservation.service');
const { ApiResponse, asyncHandler } = require('../../shared/utils');

const createReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.createReservation(req.body, req.auditContext);
  ApiResponse.created('Reservation created', reservation).send(res);
});

const getReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservation(req.params.id);
  ApiResponse.ok('Reservation fetched', reservation).send(res);
});

const getAvailableTables = asyncHandler(async (req, res) => {
  const { floorPlanId, reservationDate, timeSlot, partySize = 2 } = req.query;
  const tables = await reservationService.getTablesWithAvailability(
    floorPlanId,
    reservationDate,
    timeSlot,
    parseInt(partySize)
  );
  // Filter only available tables
  const available = tables.filter(t => t.isAvailable);
  ApiResponse.ok('Available tables fetched', available).send(res);
});

const getTablesWithAvailability = asyncHandler(async (req, res) => {
  const { floorPlanId, reservationDate, timeSlot, partySize = 2 } = req.query;
  const tables = await reservationService.getTablesWithAvailability(
    floorPlanId,
    reservationDate,
    timeSlot,
    parseInt(partySize)
  );
  ApiResponse.ok('Tables with availability fetched', tables).send(res);
});

const getReservationsByDate = asyncHandler(async (req, res) => {
  const { branchId, date } = req.query;
  const reservations = await reservationService.getReservationsByDate(branchId, date);
  ApiResponse.ok('Reservations fetched', reservations).send(res);
});

const getReservationsByGuest = asyncHandler(async (req, res) => {
  const { guestEmail } = req.query;
  const reservations = await reservationService.getReservationsByGuest(guestEmail);
  ApiResponse.ok('Guest reservations fetched', reservations).send(res);
});

const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.cancelReservation(req.params.id, req.auditContext);
  ApiResponse.ok('Reservation cancelled', reservation).send(res);
});

const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const reservation = await reservationService.updateReservationStatus(req.params.id, status, req.auditContext);
  ApiResponse.ok('Reservation status updated', reservation).send(res);
});

const getTableCountForFloor = asyncHandler(async (req, res) => {
  const { floorPlanId } = req.query;
  const count = await reservationService.getTableCountForFloor(floorPlanId);
  ApiResponse.ok('Table count fetched', { tableCount: count }).send(res);
});

const getTotalCapacityForFloor = asyncHandler(async (req, res) => {
  const { floorPlanId } = req.query;
  const capacity = await reservationService.getTotalCapacityForFloor(floorPlanId);
  ApiResponse.ok('Total capacity fetched', { totalCapacity: capacity }).send(res);
});

const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  const { branchId, reservationDate, partySize = 2 } = req.query;
  const slots = await reservationService.getAvailableTimeSlots(
    branchId,
    reservationDate,
    parseInt(partySize)
  );
  ApiResponse.ok('Available time slots fetched', slots).send(res);
});

module.exports = {
  createReservation,
  getReservation,
  getAvailableTables,
  getTablesWithAvailability,
  getReservationsByDate,
  getReservationsByGuest,
  cancelReservation,
  updateReservationStatus,
  getTableCountForFloor,
  getTotalCapacityForFloor,
  getAvailableTimeSlots
};
