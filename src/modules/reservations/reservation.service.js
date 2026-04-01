const reservationRepo = require('./reservation.repository');
const floorPlanRepo = require('../onboarding/floor-plan/floor-plan.repository');
const ApiError = require('../../shared/utils/ApiError');
const { createAuditLog } = require('../../middlewares/auditLogger.middleware');
const { prisma } = require('../../config');

class ReservationService {
  // Get applicable turn time duration for a reservation
  async getTurnTimeDuration(branchId, partySize, reservationDate, timeSlot, mealType = 'DINNER') {
    const dayOfWeek = this._getDayOfWeek(new Date(reservationDate));

    // Fetch turn time rules for this branch, ordered by priority (highest first)
    const rules = await prisma.turnTimeRule.findMany({
      where: { branchId },
      orderBy: { priority: 'desc' },
    });

    console.log(`🔍 Turn Time Lookup: branchId=${branchId}, partySize=${partySize}, date=${reservationDate}, timeSlot=${timeSlot}, mealType=${mealType}, dayOfWeek=${dayOfWeek}`);
    console.log(`📋 Rules found:`, rules.length, rules.map(r => ({ id: r.id, isDefault: r.isDefault, min: r.partySizeMin, max: r.partySizeMax, duration: r.durationMins })));

    // Find the first matching rule
    for (const rule of rules) {
      const matches = 
        (!rule.partySizeMin || partySize >= rule.partySizeMin) &&
        (!rule.partySizeMax || partySize <= rule.partySizeMax) &&
        (!rule.mealType || rule.mealType === mealType) &&
        (!rule.dayOfWeek || rule.dayOfWeek === dayOfWeek);

      if (matches) {
        console.log(`✅ Match found: ${rule.durationMins} mins from rule with isDefault=${rule.isDefault}`);
        return rule.durationMins;
      }
    }

    // Fallback: default 90 minutes if no rule matches
    console.log(`⚠️ No matching rule found, using fallback: 90 mins`);
    return 90;
  }

  // Helper: Get day of week from date
  _getDayOfWeek(date) {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }

  // Helper: Determine meal type from time slot
  _getMealTypeFromTime(timeSlot) {
    const time = this._parseTimeSlot(timeSlot);
    const hour = time.hours;

    if (hour >= 6 && hour < 11) return 'BREAKFAST';
    if (hour >= 11 && hour < 15) return 'LUNCH';
    if (hour >= 15 && hour < 17) return 'BRUNCH';
    return 'DINNER';
  }

  // Helper: Parse time slot
  _parseTimeSlot(timeSlot) {
    let hours = 0, minutes = 0;
    if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
      const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      }
    } else {
      const parts = timeSlot.split(':');
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1] || 0);
    }
    return { hours, minutes };
  }

  // Create a new reservation
  async createReservation(data, auditContext) {
    const { branchId, partySize, reservationDate, timeSlot, tableIds = [] } = data;

    if (!branchId || !partySize || !reservationDate || !timeSlot) {
      throw ApiError.badRequest('Missing required fields: branchId, partySize, reservationDate, timeSlot');
    }

    if (partySize < 1 || partySize > 20) {
      throw ApiError.badRequest('Party size must be between 1 and 20');
    }

    // Get turn time duration for this reservation
    const mealType = this._getMealTypeFromTime(timeSlot);
    const durationMins = await this.getTurnTimeDuration(branchId, partySize, reservationDate, timeSlot, mealType);

    // Validate tables are available
    let allocatedTables = [];
    if (tableIds && tableIds.length > 0) {
      allocatedTables = await Promise.all(
        tableIds.map(async (tableId) => {
          const isAvailable = await reservationRepo.isTableAvailable(tableId, reservationDate, timeSlot, durationMins);
          if (!isAvailable) {
            throw ApiError.conflict(`Table ${tableId} is not available at ${timeSlot} for ${durationMins} minutes`);
          }
          return tableId;
        })
      );
    }

    // Create reservation with details and turn time info
    const reservationDetails = allocatedTables.map(tableId => ({
      tableId,
      allocatedSeats: Math.ceil(partySize / allocatedTables.length) || partySize
    }));

    const reservation = await reservationRepo.createReservation(
      {
        branchId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        partySize,
        reservationDate: new Date(reservationDate),
        timeSlot,
        turnTimeMins: durationMins, // Store the turn time
        specialRequest: data.specialRequest,
        status: 'CONFIRMED'
      },
      reservationDetails
    );

    await createAuditLog({
      entity: 'Reservation',
      entityId: reservation.id,
      action: 'CREATE',
      newValue: reservation,
      auditContext
    });

    return reservation;
  }

  // Get reservation details
  async getReservation(id) {
    const reservation = await reservationRepo.findReservationById(id);
    if (!reservation) {
      throw ApiError.notFound('Reservation not found');
    }
    return reservation;
  }

  // Get available tables for a specific floor, date, and time
  async getAvailableTables(floorPlanId, reservationDate, timeSlot) {
    // Validate floor plan exists
    const floorPlan = await floorPlanRepo.findFloorPlanById(floorPlanId);
    if (!floorPlan) {
      throw ApiError.notFound('Floor plan not found');
    }

    const availableTables = await reservationRepo.findAvailableTablesByFloor(
      floorPlanId,
      reservationDate,
      timeSlot
    );

    return availableTables.map(table => ({
      id: table.id,
      tableNumber: table.tableNumber,
      label: table.label,
      capacity: table.capacity,
      zone: table.zone?.name,
      shape: table.shape
    }));
  }

  // Get all tables for a floor with availability status (considering turn time)
  async getTablesWithAvailability(floorPlanId, reservationDate, timeSlot, partySize = 2) {
    const floorPlan = await floorPlanRepo.findFloorPlanById(floorPlanId);
    if (!floorPlan) {
      throw ApiError.notFound('Floor plan not found');
    }

    // Get the turn time duration for this party size
    const mealType = this._getMealTypeFromTime(timeSlot);
    const durationMins = await this.getTurnTimeDuration(floorPlan.branchId, partySize, reservationDate, timeSlot, mealType);

    const allTables = floorPlan.tables || [];
    
    // Check availability for each table
    const availability = await Promise.all(
      allTables.map(async (table) => {
        const isAvailable = await reservationRepo.isTableAvailable(
          table.id,
          reservationDate,
          timeSlot,
          durationMins
        );
        return { tableId: table.id, isAvailable };
      })
    );

    const availabilityMap = new Map(availability.map(a => [a.tableId, a.isAvailable]));

    return allTables.map(table => ({
      id: table.id,
      tableNumber: table.tableNumber,
      label: table.label,
      capacity: table.capacity,
      zone: table.zone?.name,
      shape: table.shape,
      isAvailable: availabilityMap.get(table.id),
      isReserved: !availabilityMap.get(table.id),
      turnTimeMins: durationMins
    }));
  }

  // Get available time slots for a branch on a given date
  async getAvailableTimeSlots(branchId, reservationDate, partySize = 2) {
    // Fetch business hours for the branch
    const businessHours = await prisma.businessHours.findMany({
      where: { branchId },
    });

    if (!businessHours || businessHours.length === 0) {
      throw ApiError.badRequest('No business hours configured for this branch');
    }

    // Get the day of week for the reservation date
    const dayOfWeek = this._getDayOfWeek(new Date(reservationDate));
    const todayHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);

    if (!todayHours || !todayHours.isOpen) {
      return []; // Restaurant is closed on this day
    }

    // Parse opening and closing times
    const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);

    // Generate 30-minute time slots
    const slots = [];
    let currentHour = openHour;
    let currentMin = openMin;

    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeLabel = this._formatTimeSlot(currentHour, currentMin);
      slots.push(timeLabel);

      // Increment by 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    // For each slot, check availability
    const slotsWithStatus = await Promise.all(
      slots.map(async (slot) => {
        // Get turn time for this party size and slot
        const mealType = this._getMealTypeFromTime(slot);
        const durationMins = await this.getTurnTimeDuration(branchId, partySize, reservationDate, slot, mealType);

        // Get all tables for this branch's floors
        const floorPlans = await floorPlanRepo.findFloorPlansByBranch(branchId);
        
        if (!floorPlans || floorPlans.length === 0) {
          return { id: `slot-${slot}`, label: slot, status: 'Available', durationMins };
        }

        // Check availability across all floors
        let availableCount = 0;
        let totalCount = 0;

        for (const floorPlan of floorPlans) {
          const allTables = floorPlan.tables || [];
          totalCount += allTables.length;

          for (const table of allTables) {
            const isAvailable = await reservationRepo.isTableAvailable(
              table.id,
              reservationDate,
              slot,
              durationMins
            );
            if (isAvailable) {
              availableCount++;
            }
          }
        }

        // Determine status based on availability percentage
        let status = 'Full';
        if (availableCount === totalCount) {
          status = 'Available';
        } else if (availableCount > 0) {
          status = 'Limited';
        }

        return { id: `slot-${slot}`, label: slot, status, durationMins };
      })
    );

    return slotsWithStatus;
  }

  // Helper: Format time slot (HH:MM to 12-hour format)
  _formatTimeSlot(hours, minutes) {
    const hour12 = hours % 12 || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    const minStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minStr} ${period}`;
  }

  // Get reservations for a branch on a specific date
  async getReservationsByDate(branchId, date) {
    return reservationRepo.findReservationsByBranchAndDate(branchId, date);
  }

  // Get reservations by guest email
  async getReservationsByGuest(guestEmail) {
    return reservationRepo.findReservationsByGuest(guestEmail);
  }

  // Cancel a reservation
  async cancelReservation(id, auditContext) {
    const reservation = await reservationRepo.findReservationById(id);
    if (!reservation) {
      throw ApiError.notFound('Reservation not found');
    }

    if (reservation.status === 'CANCELLED') {
      throw ApiError.conflict('Reservation is already cancelled');
    }

    const updated = await reservationRepo.cancelReservation(id);

    await createAuditLog({
      entity: 'Reservation',
      entityId: id,
      action: 'UPDATE',
      oldValue: reservation,
      newValue: updated,
      auditContext
    });

    return updated;
  }

  // Update reservation status
  async updateReservationStatus(id, status, auditContext) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const existing = await reservationRepo.findReservationById(id);
    if (!existing) {
      throw ApiError.notFound('Reservation not found');
    }

    const updated = await reservationRepo.updateReservation(id, { status });

    await createAuditLog({
      entity: 'Reservation',
      entityId: id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      auditContext
    });

    return updated;
  }

  // Get table count for a floor
  async getTableCountForFloor(floorPlanId) {
    const floorPlan = await floorPlanRepo.findFloorPlanById(floorPlanId);
    if (!floorPlan) {
      throw ApiError.notFound('Floor plan not found');
    }
    return floorPlan.tables?.length || 0;
  }

  // Get total capacity for a floor
  async getTotalCapacityForFloor(floorPlanId) {
    const floorPlan = await floorPlanRepo.findFloorPlanById(floorPlanId);
    if (!floorPlan) {
      throw ApiError.notFound('Floor plan not found');
    }

    const totalCapacity = (floorPlan.tables || []).reduce((sum, table) => sum + (table.capacity || 0), 0);
    return totalCapacity;
  }
}

module.exports = new ReservationService();
