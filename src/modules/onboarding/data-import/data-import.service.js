const importRepo = require('./data-import.repository');
const ApiError = require('../../../shared/utils/ApiError');
const { createAuditLog } = require('../../../middlewares/auditLogger.middleware');

class DataImportService {
  async create(restaurantId, staffId, data, auditContext) {
    const importJob = await importRepo.create({
      ...data,
      restaurantId,
      createdBy: staffId,
      status: 'PENDING',
    });

    await createAuditLog({ entity: 'DataImport', entityId: importJob.id, action: 'CREATE', newValue: importJob, auditContext });
    return importJob;
  }

  async getAll(restaurantId, pagination) {
    return importRepo.findByRestaurant(restaurantId, pagination);
  }

  async getById(id) {
    const importJob = await importRepo.findById(id);
    if (!importJob) throw ApiError.notFound('Import job not found');
    return importJob;
  }

  async confirmImport(id, auditContext) {
    const importJob = await importRepo.findById(id);
    if (!importJob) throw ApiError.notFound('Import job not found');
    if (importJob.status !== 'PENDING') throw ApiError.badRequest('Import has already been processed');

    // Move to VALIDATING — in production, this would trigger a background job
    const updated = await importRepo.update(id, { status: 'VALIDATING' });

    await createAuditLog({ entity: 'DataImport', entityId: id, action: 'STATUS_CHANGE', oldValue: { status: 'PENDING' }, newValue: { status: 'VALIDATING' }, auditContext });
    return updated;
  }
}

module.exports = new DataImportService();
