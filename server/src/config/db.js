import pkg from 'pg';
const { Pool } = pkg;
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const isProduction = env.NODE_ENV === 'production';
// If DATABASE_URL includes sslmode or is a cloud-hosted URL like Supabase, use SSL
const useSSL = isProduction || env.DATABASE_URL.includes('supabase.com') || env.DATABASE_URL.includes('sslmode=require');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  logger.error('Unexpected idle PostgreSQL client error', { message: err.message });
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL statement with $1, $2 placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Database query error', { text: text.slice(0, 100), message: err.message });
    throw err;
  }
};

/**
 * Execute operations inside a database transaction
 * @param {Function} callback - Function receiving (client) => Promise<any>
 * @returns {Promise<any>}
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back due to error', { message: err.message });
    throw err;
  } finally {
    client.release();
  }
};
