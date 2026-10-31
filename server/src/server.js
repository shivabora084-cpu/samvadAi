import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 SamvadAI Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  logger.info(`🔗 Health check available at http://localhost:${PORT}/api/health`);
});

// Process signal handlers
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing HTTP server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason: reason instanceof Error ? reason.message : reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', { message: error.message, stack: error.stack });
  process.exit(1);
});
