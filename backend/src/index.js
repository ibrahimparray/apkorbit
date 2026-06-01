require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express(); // ✅ IMPORTANT (fix for your crash)

const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

/* =========================
   TRUST PROXY (Render)
========================= */
app.set('trust proxy', IS_PROD ? 1 : 0);

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: IS_PROD ? false : undefined,
}));

/* =========================
   CORS
========================= */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* =========================
   RATE LIMIT
========================= */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, try again later.' }
}));

/* =========================
   LOGGING
========================= */
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* =========================
   SIMPLE AUTH ROUTE
========================= */
app.use('/api/auth', require('./routes/auth'));

/* =========================
   HEALTH CHECK
========================= */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* =========================
   STATIC FILES (optional)
========================= */
const publicDir = path.join(__dirname, '../public');

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${IS_PROD ? 'production' : 'development'}`);
});

module.exports = app;
