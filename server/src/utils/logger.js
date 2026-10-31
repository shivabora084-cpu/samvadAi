/**
 * Structured logger utility
 * Masks sensitive values and formats output consistently
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  // Sanitize meta to prevent leaking secrets/tokens
  const sanitizedMeta = { ...meta };
  if (sanitizedMeta.password) sanitizedMeta.password = '[REDACTED]';
  if (sanitizedMeta.token) sanitizedMeta.token = '[REDACTED]';
  if (sanitizedMeta.authorization) sanitizedMeta.authorization = '[REDACTED]';
  if (sanitizedMeta.apiKey) sanitizedMeta.apiKey = '[REDACTED]';

  const metaStr = Object.keys(sanitizedMeta).length ? ` ${JSON.stringify(sanitizedMeta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

export const logger = {
  info: (message, meta) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage('error', message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, meta));
    }
  }
};
