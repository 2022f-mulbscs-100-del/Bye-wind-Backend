const { z } = require('zod');

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  designation: z.string().optional(),
});

// Accepts a valid URL, an empty string (treated as null), or null/undefined
const urlField = z
  .string()
  .transform((v) => (v === '' ? null : v))
  .pipe(z.string().url().nullable())
  .optional()
  .nullable();

const createRestaurantSchema = {
  body: z.object({
    legalBusinessName: z.string().min(1, 'Legal business name is required'),
    brandName: z.string().min(1, 'Brand name is required'),
    registeredAddress: addressSchema,
    operatingCountry: z.string().min(1, 'Operating country is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),
    gstVatApplicable: z.boolean().optional().default(false),
    gstVatNumber: z.string().optional().nullable(),
    primaryContact: contactSchema,
    logoUrl: urlField,
  }),
};

const updateRestaurantSchema = {
  body: z.object({
    legalBusinessName: z.string().min(1).optional(),
    brandName: z.string().min(1).optional(),
    registeredAddress: addressSchema.optional(),
    operatingCountry: z.string().min(1).optional(),
    timezone: z.string().min(1).optional(),
    cuisineTypes: z.array(z.string()).min(1).optional(),
    gstVatApplicable: z.boolean().optional(),
    gstVatNumber: z.string().optional().nullable(),
    primaryContact: contactSchema.optional(),
    planTier: z.string().min(1).optional(),
    status: z
      .enum(["DRAFT", "PENDING_REVIEW", "LIVE", "SUSPENDED"])
      .optional(),
    logoUrl: urlField,
  }),
  params: z.object({
    id: z.string().uuid('Invalid restaurant ID'),
  }),
};

const restaurantIdParam = {
  params: z.object({
    id: z.string().uuid('Invalid restaurant ID'),
  }),
};

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdParam,
};
