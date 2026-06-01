require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
//onst apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Trust proxy (Render uses proxies)
app.set('trust proxy', IS_PROD ? 1 : 0);

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: IS_PROD ? false : undefined,
}));

// CORS
const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
const corsConfig = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
if (corsOrigins.includes('*')) {
  corsConfig.origin = '*';
  corsConfig.credentials = false;
} else {
  corsConfig.origin = corsOrigins;
}
app.use(cors(corsConfig));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: { message: 'Too many requests, please try again later.' },
  trustProxy: IS_PROD,
});
app.use('/api/', limiter);

// Logging
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directories exist
const uploadsDir = path.resolve(process.env.UPLOAD_PATH || path.join(__dirname, '../uploads'));
['apks', 'icons', 'screenshots'].forEach(dir => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Static files
app.use('/uploads', express.static(uploadsDir, {
  maxAge: IS_PROD ? '1d' : 0,
  etag: true,
  lastModified: true,
}));

// API Routes
//app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Serve static frontend export (if it exists)
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  // Admin static assets
  if (fs.existsSync(path.join(publicDir, 'admin/_next'))) {
    app.use('/admin/_next', express.static(path.join(publicDir, 'admin/_next')));
    const adminRoutes = ['/', '/login', '/apps', '/upload', '/settings', '/categories', '/analytics', '/downloads', '/updates', '/store'];
    adminRoutes.forEach(route => {
      const htmlPath = path.join(publicDir, `admin${route === '/' ? '/index' : route}.html`);
      if (fs.existsSync(htmlPath)) {
        app.get(`/admin${route === '/' ? '' : route}`, (req, res) => res.sendFile(htmlPath));
      }
    });
    app.get('/admin/store/downloads', (req, res) => res.sendFile(path.join(publicDir, 'admin/store/downloads.html')));
    app.get('/admin/store/search', (req, res) => res.sendFile(path.join(publicDir, 'admin/store/search.html')));
    app.get('/admin/apps/:id', (req, res) => res.sendFile(path.join(publicDir, 'admin/apps/0.html')));
    app.get('/admin/store/app/:id', (req, res) => res.sendFile(path.join(publicDir, 'admin/store/app/0.html')));
    app.get('/admin/store/category/:slug', (req, res) => res.sendFile(path.join(publicDir, 'admin/store/category/all.html')));
  }

  // Store static assets
  if (fs.existsSync(path.join(publicDir, '_next'))) {
    app.use('/_next', express.static(path.join(publicDir, '_next')));
    app.get('/store', (req, res) => res.sendFile(path.join(publicDir, 'store.html')));
    app.get('/store/search', (req, res) => res.sendFile(path.join(publicDir, 'store/search.html')));
    app.get('/store/downloads', (req, res) => res.sendFile(path.join(publicDir, 'store/downloads.html')));
    app.get('/store/app/:id', (req, res) => res.sendFile(path.join(publicDir, 'store/app/0.html')));
    app.get('/store/category/:slug', (req, res) => res.sendFile(path.join(publicDir, 'store/category/all.html')));
  }

app.use('/api/auth', require('./routes/auth'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`APK Store API running on port ${PORT}`);
  if (!IS_PROD) {
    console.log(`Health check: http://localhost:${PORT}/health`);
  }
  console.log(`Environment: ${IS_PROD ? 'production' : 'development'}`);
});

module.exports = app;
