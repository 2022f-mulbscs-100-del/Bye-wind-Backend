const { z } = require('zod');

const createMenuItemSchema = {
  body: z.object({
    name: z.string().min(1, 'Menu item name is required'),
    description: z.string().optional().nullable(),
    price: z.number().positive('Price must be a positive number'),
    imageUrl: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    isAvailable: z.boolean().optional().default(true),
  }),
};

const updateMenuItemSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    price: z.number().positive().optional(),
    imageUrl: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid menu item ID'),
  }),
};

const listMenuItemsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    category: z.string().optional(),
    isAvailable: z.coerce.boolean().optional(),
  }),
};

const menuItemIdParam = {
  params: z.object({
    id: z.string().uuid('Invalid menu item ID'),
  }),
};

module.exports = {
  createMenuItemSchema,
  updateMenuItemSchema,
  listMenuItemsSchema,
  menuItemIdParam,
};
