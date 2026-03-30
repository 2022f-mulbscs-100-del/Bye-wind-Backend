const { z } = require('zod');

const ZONE_TYPES = [
  'INDOOR', 'OUTDOOR', 'BAR', 'PRIVATE_DINING', 'TERRACE', 'ROOFTOP',
  'RESTAURANT_AREA', 'HOTEL_AREA', 'LOUNGE_AREA', 'SERVICE_AREA', 'ENTRANCE_ZONE'
];
const TABLE_SHAPES = ['ROUND', 'SQUARE', 'RECTANGLE', 'OVAL', 'CUSTOM'];

const createFloorPlanSchema = {
  body: z.object({
    branchId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    canvasWidth: z.number().positive().optional().default(800),
    canvasHeight: z.number().positive().optional().default(600),
  }),
};

const updateFloorPlanSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    canvasWidth: z.number().positive().optional(),
    canvasHeight: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

const createZoneSchema = {
  body: z.object({
    floorPlanId: z.string().uuid(),
    name: z.string().min(1),
    type: z.enum(ZONE_TYPES),
    color: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    positionX: z.number().optional().default(0),
    positionY: z.number().optional().default(0),
    width: z.number().positive().optional().default(320),
    height: z.number().positive().optional().default(180),
    zIndex: z.number().int().optional().default(1),
    cornerRadius: z.number().nonnegative().optional().default(24),
  }),
};

const createTableSchema = {
  body: z.object({
    floorPlanId: z.string().uuid(),
    zoneId: z.string().uuid().optional().nullable(),
    tableNumber: z.string().min(1),
    label: z.string().optional().nullable(),
    shape: z.enum(TABLE_SHAPES).optional().default('SQUARE'),
    width: z.number().positive().optional().default(60),
    height: z.number().positive().optional().default(60),
    positionX: z.number().optional().default(0),
    positionY: z.number().optional().default(0),
    rotation: z.number().min(0).max(359).optional().default(0),
    capacity: z.number().int().positive(),
    spacing: z.number().nonnegative().optional().default(12),
  }),
};

const updateTableSchema = {
  body: z.object({
    zoneId: z.string().uuid().optional().nullable(),
    tableNumber: z.string().min(1).optional(),
    label: z.string().optional().nullable(),
    shape: z.enum(TABLE_SHAPES).optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    rotation: z.number().min(0).max(359).optional(),
    capacity: z.number().int().positive().optional(),
    spacing: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

const bulkUpdateTablesSchema = {
  body: z.object({
    tables: z.array(
      z.object({
        id: z.string().uuid(),
        positionX: z.number().optional(),
        positionY: z.number().optional(),
        rotation: z.number().min(0).max(359).optional(),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        spacing: z.number().nonnegative().optional(),
        capacity: z.number().int().positive().optional(),
        shape: z.enum(TABLE_SHAPES).optional(),
        label: z.string().optional().nullable(),
      })
    ),
  }),
};

const updateZoneSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(ZONE_TYPES).optional(),
    color: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    zIndex: z.number().int().optional(),
    cornerRadius: z.number().nonnegative().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
};

module.exports = {
  createFloorPlanSchema,
  updateFloorPlanSchema,
  createZoneSchema,
  updateZoneSchema,
  createTableSchema,
  updateTableSchema,
  bulkUpdateTablesSchema,
};
