import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { query } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.js';

export const app = express();

// Required behind Render's reverse proxy for correct client IP detection & rate limiting
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration supporting comma-separated CLIENT_URL origins
const allowedOrigins = env.CLIENT_URL.split(',').map((url) => url.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiter to all /api routes
app.use('/api', generalLimiter);

// Health check endpoint (Phase 1 Requirement 6)
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    return res.status(200).json({
      status: 'ok',
      db: 'up',
      timestamp: new Date().toISOString(),
      provider: env.AI_PROVIDER
    });
  } catch (err) {
    logger.error('Health check failed: database unavailable', { message: err.message });
    return res.status(503).json({
      status: 'degraded',
      db: 'down',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Auth API routes
app.use('/api/auth', authRoutes);

// Centralized error handling
app.use(errorHandler);
