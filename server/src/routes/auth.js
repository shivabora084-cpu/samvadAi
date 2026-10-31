import { Router } from 'express';
import { register, login, getMe, createGuestSession } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, guestSchema } from '../validators/auth.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.get('/me', authenticate, getMe);
router.post('/guest', authLimiter, validate({ body: guestSchema }), createGuestSession);

export default router;
