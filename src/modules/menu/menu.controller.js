const menuService = require('./menu.service');
const { ApiResponse, asyncHandler } = require('../../shared/utils');
const { parsePagination } = require('../../shared/helpers/pagination');

const create = asyncHandler(async (req, res) => {
  const menuItem = await menuService.createMenuItem(req.params.branchId, req.body, req.auditContext);
  ApiResponse.created('Menu item created successfully', menuItem).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const menuItem = await menuService.getMenuItemById(req.params.id);
  ApiResponse.ok('Menu item fetched', menuItem).send(res);
});

const getByBranch = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const filters = {
    category: req.query.category,
    isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined,
  };
  const result = await menuService.getMenuItemsByBranch(req.params.branchId, pagination, filters);
  ApiResponse.ok('Menu items fetched', result).send(res);
});

const getAll = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const filters = {
    category: req.query.category,
    isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined,
  };
  const result = await menuService.getAllMenuItems(pagination, filters);
  ApiResponse.ok('All menu items fetched', result).send(res);
});

const update = asyncHandler(async (req, res) => {
  const menuItem = await menuService.updateMenuItem(req.params.id, req.body, req.auditContext);
  ApiResponse.ok('Menu item updated successfully', menuItem).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(req.params.id, req.auditContext, false);
  ApiResponse.ok('Menu item deleted successfully').send(res);
});

module.exports = { create, getById, getByBranch, getAll, update, remove };
