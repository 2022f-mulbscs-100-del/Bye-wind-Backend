const businessHoursService = require('./business-hours.service');
const { ApiResponse, asyncHandler } = require('../../../shared/utils');

const getSchedule = asyncHandler(async (req, res) => {
  const schedule = await businessHoursService.getSchedule(req.query.branchId);
  ApiResponse.ok('Schedule fetched', schedule).send(res);
});

const bulkUpsertSchedule = asyncHandler(async (req, res) => {
  const { branchId, schedule } = req.body;
  const result = await businessHoursService.bulkUpsertSchedule(branchId, schedule, req.auditContext);
  ApiResponse.ok('Schedule saved', result).send(res);
});

const getHolidays = asyncHandler(async (req, res) => {
  const holidays = await businessHoursService.getHolidays(req.query.branchId);
  ApiResponse.ok('Holidays fetched', holidays).send(res);
});

const createHoliday = asyncHandler(async (req, res) => {
  const holiday = await businessHoursService.createHoliday(req.body, req.auditContext);
  ApiResponse.created('Holiday created', holiday).send(res);
});

const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await businessHoursService.updateHoliday(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Holiday updated', holiday).send(res);
});

const deleteHoliday = asyncHandler(async (req, res) => {
  await businessHoursService.deleteHoliday(req.params.id, req.auditContext);
  ApiResponse.ok('Holiday deleted').send(res);
});

module.exports = { getSchedule, bulkUpsertSchedule, getHolidays, createHoliday, updateHoliday, deleteHoliday };
