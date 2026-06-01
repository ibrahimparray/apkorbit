const mysql = require('mysql2/promise');
require('dotenv').config();

const IS_PROD = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'apk_store',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  ...(process.env.DB_SSL === 'true' ? {
    ssl: {
      rejectUnauthorized: false
    }
  } : {})
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully.');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

module.exports = pool;
