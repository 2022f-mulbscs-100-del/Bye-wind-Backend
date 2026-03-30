const bcrypt = require('bcryptjs');
const staffRepo = require('./staff.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { generateToken } = require('../../../middlewares/auth.middleware');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');
const { ROLES } = require('../../../config/constants');
const { prisma } = require('../../../config');

class StaffService {
  async register(data, auditContext) {
    const existing = await staffRepo.findByEmail(data.email);
    if (existing) throw ApiError.conflict('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const { password, branchId, ...rest } = data;

    // Generate staffUsername from firstName + lastName + unique ID suffix
    const baseUsername = `${rest.firstName.toLowerCase()}.${rest.lastName.toLowerCase()}`.replace(/\s+/g, '');
    
    // SUPER_ADMIN has no restaurantId — strip it explicitly
    if (rest.role === ROLES.SUPER_ADMIN) {
      delete rest.restaurantId;
    }

    // Create staff with temporary username, then update with final username containing ID
    const tempUsername = `${baseUsername}_temp_${Date.now()}`;
    const staff = await staffRepo.create({ ...rest, passwordHash, staffUsername: tempUsername });
    
    // Update with final username using first 8 chars of staff ID for uniqueness
    const finalUsername = `${baseUsername}_${staff.id.slice(0, 8)}`;
    const updatedStaff = await staffRepo.update(staff.id, { staffUsername: finalUsername });

    // Assign to branch if branchId is provided
    if (branchId) {
      await this.updateStaffBranch(staff.id, branchId, auditContext);
    }

    if (staff.restaurantId) {
      await prisma.goLiveChecklist.update({
        where: { restaurantId: staff.restaurantId },
        data: { staffSetupDone: true },
      });
    }

    await createAuditLog({
      entity: 'Staff',
      entityId: staff.id,
      action: 'CREATE',
      newValue: { ...updatedStaff, passwordHash: '[REDACTED]' },
      auditContext,
    });

    const token = generateToken(updatedStaff);

    // Re-fetch with branches included for complete response
    const staffWithBranches = await staffRepo.findById(staff.id);

    return {
      staff: { 
        id: staffWithBranches.id, 
        email: staffWithBranches.email, 
        staffUsername: staffWithBranches.staffUsername,
        firstName: staffWithBranches.firstName, 
        lastName: staffWithBranches.lastName, 
        role: staffWithBranches.role,
        branches: staffWithBranches.branches || []
      },
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
    
    const { branchId, ...updateData } = data;
    const updated = await staffRepo.update(id, updateData);
    
    console.log('Update called with branchId:', branchId);
    
    // Update branch assignment if branchId is provided
    if (branchId !== undefined && branchId !== null) {
      console.log('Calling updateStaffBranch for staffId:', id, 'branchId:', branchId);
      try {
        await this.updateStaffBranch(id, branchId, auditContext);
        console.log('updateStaffBranch completed successfully');
      } catch (error) {
        console.error('Error in updateStaffBranch:', error);
        throw error;
      }
    } else if (branchId === null) {
      // Remove all branch assignments if branchId is explicitly null
      console.log('Removing all branch assignments for staffId:', id);
      const staff = await staffRepo.findById(id);
      if (staff.branches && staff.branches.length > 0) {
        for (const branch of staff.branches) {
          await staffRepo.removeBranch(id, branch.branchId);
        }
        await createAuditLog({ 
          entity: 'StaffBranch', 
          entityId: `${id}-all`, 
          action: 'DELETE', 
          auditContext 
        });
      }
    }
    
    await createAuditLog({ entity: 'Staff', entityId: id, action: 'UPDATE', oldValue: existing, newValue: updated, auditContext });
    
    // Re-fetch the staff with branches to return complete data
    const updatedWithBranches = await staffRepo.findById(id);
    console.log('Re-fetched staff with branches:', updatedWithBranches.branches?.length || 0, 'branches');
    const { passwordHash, ...safe } = updatedWithBranches;
    return safe;
  }

  async updateStaffBranch(staffId, newBranchId, auditContext) {
    try {
      // Get current branch assignments
      const staff = await staffRepo.findById(staffId);
      if (!staff) throw ApiError.notFound('Staff not found');

      // Remove all existing branch assignments first
      if (staff.branches && staff.branches.length > 0) {
        for (const branch of staff.branches) {
          await staffRepo.removeBranch(staffId, branch.branchId);
        }
      }

      // Assign to new branch as primary
      const assignResult = await staffRepo.assignBranch(staffId, newBranchId, true);
      
      // Log the assignment
      await createAuditLog({ 
        entity: 'StaffBranch', 
        entityId: assignResult.id, 
        action: 'CREATE', 
        newValue: assignResult, 
        auditContext 
      });

      return assignResult;
    } catch (error) {
      console.error('Error in updateStaffBranch:', error);
      throw error;
    }
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
