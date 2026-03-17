const { prisma } = require('../../../config');

class AuditLogRepository {
  async findAll(restaurantId, filters, { skip, take }) {
    const where = { restaurantId };
    if (filters.entity) where.entity = filters.entity;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.staffId) where.staffId = filters.staffId;
    if (filters.action) where.action = filters.action;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { staff: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: { staff: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }
}

module.exports = new AuditLogRepository();
