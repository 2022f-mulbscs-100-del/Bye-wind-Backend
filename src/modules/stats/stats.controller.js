const { prisma } = require('../../config');
const { ApiResponse, asyncHandler } = require('../../shared/utils');

/**
 * Get summary stats for a specific branch (or restaurant-wide if branchId is null)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const { branchId, restaurantId } = req.query;

  // 1. Staff count (scoped to branch if provided)
  const staffQuery = branchId 
    ? { branches: { some: { branchId } } }
    : { restaurantId };
  const staffCount = await prisma.staff.count({ where: staffQuery });

  // 2. Menu Item count (scoped to branch)
  const menuQuery = branchId ? { branchId } : { branch: { restaurantId } };
  const menuCount = await prisma.menuItem.count({ where: menuQuery });

  // 3. Reservation count (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const resQuery = {
    reservationDate: { gte: today, lt: tomorrow },
    ...(branchId ? { branchId } : { branch: { restaurantId } })
  };
  const reservationCount = await prisma.reservation.count({ where: resQuery });

  // 4. Total capacity (Floor plans)
  const floorQuery = branchId ? { branchId } : { restaurantId };
  const tables = await prisma.table.findMany({
    where: { floorPlan: floorQuery },
    select: { capacity: true }
  });
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);

  ApiResponse.ok('Dashboard stats fetched', {
    staffCount,
    menuCount,
    reservationCount,
    totalCapacity,
    timestamp: new Date()
  }).send(res);
});

module.exports = { getDashboardStats };
