import { ApiError } from '../utils/ApiError.js';

/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - e.g. 'admin', 'customer'
 */
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.isGuest || !allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Access forbidden: requires ${allowedRoles.join(' or ')} privilege`));
  }

  next();
};

export const requireAdmin = requireRole('admin');
