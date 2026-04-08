const { z } = require('zod');

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerRestaurantSchema = z.object({
  brandName: z.string().min(1, 'Restaurant brand name is required'),
  legalBusinessName: z.string().min(1, 'Legal business name is required'),
  cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  timezone: z.string().default('UTC'),
  phone: z.string().optional().nullable(),
});

module.exports = {
  signupSchema,
  loginSchema,
  registerRestaurantSchema,
};
