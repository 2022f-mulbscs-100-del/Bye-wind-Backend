const ApiError = require('../shared/utils/ApiError');

/**
 * Zod validation middleware factory.
 * Validates req.body, req.params, and/or req.query against Zod schemas.
 *
 * Usage:
 *   router.post('/restaurants', validate(createRestaurantSchema), controller.create);
 *
 * @param {object} schemas - { body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }
 * @returns {Function} Express middleware
 */
const validate = (schemas) => (req, _res, next) => {
  const errors = [];

  for (const [source, schema] of Object.entries(schemas)) {
    if (!schema) continue;

    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        source,
      }));
      errors.push(...fieldErrors);
    } else {
      // Replace with parsed (coerced & stripped) data
      req[source] = result.data;
    }
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  next();
};

module.exports = { validate };
