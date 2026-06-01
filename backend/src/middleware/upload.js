const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const UPLOAD_BASE = path.resolve(process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'));
const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE) || 104857600;

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_BASE, subDir);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const apkFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.apk' && ext !== '.xapk' && ext !== '.aab') {
    return cb(new Error('Only APK, XAPK, and AAB files are allowed'), false);
  }
  cb(null, true);
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WebP, and SVG images are allowed'), false);
  }
  cb(null, true);
};

const uploadAPK = multer({
  storage: createStorage('apks'),
  fileFilter: apkFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('apk_file');

const uploadIcon = multer({
  storage: createStorage('icons'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('icon');

const uploadScreenshots = multer({
  storage: createStorage('screenshots'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }
}).array('screenshots', 10);

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { uploadAPK, uploadIcon, uploadScreenshots, handleMulterError };
