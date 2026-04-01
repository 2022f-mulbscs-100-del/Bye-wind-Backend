const { prisma } = require('../../config');

class ReservationRepository {
  // Create a new reservation with details
  async createReservation(data, details) {
    const reservation = await prisma.reservation.create({
      data: {
        ...data,
        details: {
          create: details || []
        }
      },
      include: { details: true }
    });
    return reservation;
  }

  // Get reservation by ID
  async findReservationById(id) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            table: {
              include: {
                floorPlan: true,
                zone: true
              }
            }
          }
        }
      }
    });
  }

  // Get all reservations for a branch on a specific date
  async findReservationsByBranchAndDate(branchId, date) {
    return prisma.reservation.findMany({
      where: {
        branchId,
        reservationDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED', 'PENDING']
        }
      },
      include: {
        details: {
          include: { table: true }
        }
      },
      orderBy: { timeSlot: 'asc' }
    });
  }

  // Get available tables for a branch/floor on a specific date/time
  async findAvailableTablesByFloor(floorPlanId, reservationDate, timeSlot) {
    // Get all tables for this floor
    const allTables = await prisma.table.findMany({
      where: {
        floorPlanId,
        isActive: true
      },
      include: {
        reservationDetails: {
          include: {
            reservation: {
              where: {
                reservationDate: {
                  gte: new Date(reservationDate),
                  lt: new Date(new Date(reservationDate).getTime() + 24 * 60 * 60 * 1000)
                },
                timeSlot,
                status: { in: ['CONFIRMED', 'COMPLETED'] }
              }
            }
          }
        }
      }
    });

    // Filter: tables with no reservations at this time
    const available = allTables.filter(table => 
      table.reservationDetails.length === 0 || 
      table.reservationDetails.every(rd => rd.reservation.length === 0)
    );

    return available;
  }

  // Update reservation
  async updateReservation(id, data) {
    return prisma.reservation.update({
      where: { id },
      data,
      include: { details: true }
    });
  }

  // Delete reservation (soft delete via status)
  async cancelReservation(id) {
    return prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { details: true }
    });
  }

  // Create reservation detail
  async createReservationDetail(data) {
    return prisma.reservationDetail.create({
      data,
      include: {
        table: {
          include: { zone: true }
        }
      }
    });
  }

  // Get reservation details by reservation ID
  async findReservationDetails(reservationId) {
    return prisma.reservationDetail.findMany({
      where: { reservationId },
      include: {
        table: {
          include: { zone: true }
        }
      }
    });
  }

  // Delete reservation detail
  async deleteReservationDetail(id) {
    return prisma.reservationDetail.delete({
      where: { id }
    });
  }

  // Get all reservations for a guest
  async findReservationsByGuest(guestEmail) {
    return prisma.reservation.findMany({
      where: { guestEmail },
      include: {
        details: {
          include: { table: true }
        }
      },
      orderBy: { reservationDate: 'desc' }
    });
  }

  // Check if a table is available for a specific time slot (considering turn time)
  async isTableAvailable(tableId, reservationDate, timeSlot, durationMins = 90) {
    // Parse the time slot (e.g., "19:00" or "7:00 PM")
    const slotTime = this._parseTimeSlot(timeSlot);
    const slotStartTime = new Date(reservationDate);
    slotStartTime.setHours(slotTime.hours, slotTime.minutes, 0, 0);
    
    // Calculate end time (start + duration)
    const slotEndTime = new Date(slotStartTime.getTime() + durationMins * 60 * 1000);

    // Find conflicting reservations for this table on this date
    const allReservations = await prisma.reservationDetail.findMany({
      where: {
        tableId,
        reservation: {
          reservationDate: {
            gte: new Date(reservationDate),
            lt: new Date(new Date(reservationDate).getTime() + 24 * 60 * 60 * 1000)
          },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      include: {
        reservation: {
          select: {
            timeSlot: true,
            details: {
              select: {
                reservation: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    // Check if any reservation overlaps with the requested time slot
    for (const detail of allReservations) {
      const existingTime = this._parseTimeSlot(detail.reservation.timeSlot);
      const existingStartTime = new Date(reservationDate);
      existingStartTime.setHours(existingTime.hours, existingTime.minutes, 0, 0);
      
      // For existing reservations, assume same duration for now
      const existingEndTime = new Date(existingStartTime.getTime() + durationMins * 60 * 1000);

      // Check for overlap
      if (slotStartTime < existingEndTime && slotEndTime > existingStartTime) {
        return false; // Time slot conflicts with existing reservation
      }
    }

    return true; // Table is available
  }

  // Helper: Parse time slot string
  _parseTimeSlot(timeSlot) {
    // Handle formats like "19:00", "7:00 PM", "19:00:00"
    let hours = 0, minutes = 0;

    if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
      // Format: "7:00 PM"
      const match = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      }
    } else {
      // Format: "19:00" or "19:00:00"
      const parts = timeSlot.split(':');
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1] || 0);
    }

    return { hours, minutes };
  }

  // Get table reservation count for today
  async getReservationCountForDate(branchId, date) {
    return prisma.reservation.count({
      where: {
        branchId,
        reservationDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { in: ['CONFIRMED', 'COMPLETED', 'PENDING'] }
      }
    });
  }
}

module.exports = new ReservationRepository();
