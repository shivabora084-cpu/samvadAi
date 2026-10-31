import { ApiError } from '../utils/ApiError.js';

/**
 * Zod validation middleware for request body, query, and params
 * @param {object} schemas - { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const formattedErrors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return next(ApiError.badRequest('Validation failed', formattedErrors));
    }
    next(error);
  }
};
