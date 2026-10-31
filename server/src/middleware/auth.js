import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication middleware
 * Supports registered user JWTs and guest JWTs
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.isGuest) {
      req.user = {
        isGuest: true,
        guestId: decoded.guestId,
        role: 'guest',
        preferred_language: decoded.preferred_language || 'en'
      };
    } else {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        preferred_language: decoded.preferred_language || 'en',
        isGuest: false
      };
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired, please log in again'));
    }
    return next(ApiError.unauthorized('Invalid authentication token'));
  }
};

/**
 * Optional authentication: attaches user if valid token exists, proceeds regardless
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.isGuest) {
      req.user = {
        isGuest: true,
        guestId: decoded.guestId,
        role: 'guest',
        preferred_language: decoded.preferred_language || 'en'
      };
    } else {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        preferred_language: decoded.preferred_language || 'en',
        isGuest: false
      };
    }
  } catch {
    req.user = null;
  }
  next();
};
