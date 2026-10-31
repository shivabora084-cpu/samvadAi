import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { usersRepo } from '../repositories/users.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferredLanguage } = req.body;

  const existingUser = await usersRepo.findByEmail(email);
  if (existingUser) {
    throw ApiError.badRequest('An account with this email already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await usersRepo.create({
    name,
    email,
    passwordHash,
    role: 'customer',
    preferredLanguage
  });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    preferred_language: newUser.preferred_language,
    isGuest: false
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      preferred_language: newUser.preferred_language
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepo.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    preferred_language: user.preferred_language,
    isGuest: false
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferred_language: user.preferred_language
    }
  });
});

export const getMe = asyncHandler(async (req, res) => {
  if (req.user.isGuest) {
    return res.status(200).json({
      success: true,
      user: {
        isGuest: true,
        guestId: req.user.guestId,
        role: 'guest',
        preferred_language: req.user.preferred_language
      }
    });
  }

  const user = await usersRepo.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferred_language: user.preferred_language,
      isGuest: false
    }
  });
});

export const createGuestSession = asyncHandler(async (req, res) => {
  const preferredLanguage = req.body.preferredLanguage || 'en';
  const guestId = `guest_${crypto.randomUUID()}`;

  const token = generateToken(
    {
      isGuest: true,
      guestId,
      role: 'guest',
      preferred_language: preferredLanguage
    },
    '24h' // short-lived guest JWT
  );

  res.status(200).json({
    success: true,
    message: 'Guest session created',
    token,
    user: {
      isGuest: true,
      guestId,
      role: 'guest',
      preferred_language: preferredLanguage
    }
  });
});
