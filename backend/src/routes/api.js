const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadAPK, uploadIcon, uploadScreenshots, handleMulterError } = require('../middleware/upload');
const authController = require('../controllers/authController');
const appController = require('../controllers/appController');
const categoryController = require('../controllers/categoryController');
const analyticsController = require('../controllers/analyticsController');
const settingsController = require('../controllers/settingsController');

// ============================================================
// AUTH ROUTES
// ============================================================
router.post('/auth/login', authController.login);
router.post('/auth/verify-2fa', authController.verify2fa);
router.get('/auth/me', authenticate, authController.me);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.put('/auth/password', authenticate, authController.changePassword);

// ============================================================
// CATEGORY ROUTES
// ============================================================
router.get('/categories', categoryController.list);
router.get('/categories/:id', categoryController.detail);
router.post('/categories', authenticate, authorize('admin'), categoryController.create);
router.put('/categories/:id', authenticate, authorize('admin'), categoryController.update);
router.delete('/categories/:id', authenticate, authorize('admin'), categoryController.delete);

// ============================================================
// APP ROUTES (Public)
// ============================================================
router.get('/apps', appController.list);
router.get('/apps/:id', appController.detail);
router.post('/apps/check-update', appController.checkUpdate);

// ============================================================
// APP ROUTES (Protected)
// ============================================================
router.post('/apps', authenticate, authorize('admin', 'editor'), uploadIcon, handleMulterError, appController.create);
router.put('/apps/:id', authenticate, authorize('admin', 'editor'), uploadIcon, handleMulterError, appController.update);
router.delete('/apps/:id', authenticate, authorize('admin'), appController.delete);
router.put('/apps/:id/toggle-publish', authenticate, authorize('admin', 'editor'), appController.togglePublish);
router.put('/apps/:id/toggle-archive', authenticate, authorize('admin'), appController.toggleArchive);
router.post('/apps/:id/screenshots', authenticate, authorize('admin', 'editor'), uploadScreenshots, handleMulterError, appController.uploadScreenshots);

// ============================================================
// VERSION ROUTES
// ============================================================
router.get('/apps/:id/versions/latest', appController.latestVersion);
router.post('/apps/:id/versions', authenticate, authorize('admin', 'editor'), uploadAPK, handleMulterError, appController.uploadVersion);

// ============================================================
// DOWNLOAD ROUTES
// ============================================================
router.get('/apps/:id/download', appController.downloadAPK);
router.get('/apps/:id/download/:versionId', appController.downloadAPK);

// ============================================================
// ANALYTICS ROUTES
// ============================================================
router.get('/analytics/dashboard', authenticate, analyticsController.dashboard);
router.get('/analytics/downloads', authenticate, analyticsController.downloads);

// ============================================================
// SETTINGS ROUTES
// ============================================================
router.get('/settings', settingsController.getAll);
router.put('/settings', authenticate, authorize('admin'), settingsController.update);
router.post('/settings/logo', authenticate, authorize('admin'), uploadIcon, handleMulterError, settingsController.uploadLogo);
router.get('/settings/storage', authenticate, settingsController.getStorageInfo);

module.exports = router;
