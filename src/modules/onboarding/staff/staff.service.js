const bcrypt = require('bcryptjs');
const staffRepo = require('./staff.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { generateToken } = require('../../../middlewares/auth.middleware');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../../config/constants');

class StaffService {
  async register(data, auditContext) {
    const existing = await staffRepo.findByEmail(data.email);
    if (existing) throw ApiError.conflict('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const { password, ...rest } = data;

    // SUPER_ADMIN has no restaurantId — strip it explicitly
    if (rest.role === ROLES.SUPER_ADMIN) {
      delete rest.restaurantId;
    }

    const staff = await staffRepo.create({ ...rest, passwordHash });

    await createAuditLog({
      entity: 'Staff',
      entityId: staff.id,
      action: 'CREATE',
      newValue: { ...staff, passwordHash: '[REDACTED]' },
      auditContext,
    });

    const token = generateToken(staff);

    return {
      staff: { id: staff.id, email: staff.email, firstName: staff.firstName, lastName: staff.lastName, role: staff.role },
      token,
    };
  }

  async login(email, password) {
    const staff = await staffRepo.findByEmail(email);
    if (!staff) throw ApiError.unauthorized('Invalid email or password');
    if (!staff.isActive) throw ApiError.unauthorized('Account is deactivated');

    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    // Update last login
    await staffRepo.update(staff.id, { lastLoginAt: new Date() });

    const token = generateToken(staff);

    return {
      staff: { id: staff.id, email: staff.email, firstName: staff.firstName, lastName: staff.lastName, role: staff.role, restaurantId: staff.restaurantId },
      token,
    };
  }

  async getById(id) {
    const staff = await staffRepo.findById(id);
    if (!staff) throw ApiError.notFound('Staff not found');
    const { passwordHash, ...safe } = staff;
    return safe;
  }

  async getAll(restaurantId, pagination) {
    return staffRepo.findAllByRestaurant(restaurantId, pagination);
  }

  async update(id, data, auditContext) {
    const existing = await staffRepo.findById(id);
    if (!existing) throw ApiError.notFound('Staff not found');
    const updated = await staffRepo.update(id, data);
    await createAuditLog({ entity: 'Staff', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    const { passwordHash, ...safe } = updated;
    return safe;
  }

  async assignBranch(staffId, branchId, isPrimary, auditContext) {
    const result = await staffRepo.assignBranch(staffId, branchId, isPrimary);
    await createAuditLog({ entity: 'StaffBranch', entityId: result.id, action: 'CREATE', newValue: result, auditContext });
    return result;
  }

  async removeBranch(staffId, branchId, auditContext) {
    await staffRepo.removeBranch(staffId, branchId);
    await createAuditLog({ entity: 'StaffBranch', entityId: `${staffId}-${branchId}`, action: 'DELETE', auditContext });
  }
}

module.exports = new StaffService();
