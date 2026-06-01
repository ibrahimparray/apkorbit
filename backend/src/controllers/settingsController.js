const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT `key`, `value`, `type` FROM settings');
    const result = {};
    settings.forEach(s => {
      if (s.type === 'boolean') result[s.key] = s.value === 'true';
      else if (s.type === 'integer') result[s.key] = parseInt(s.value);
      else if (s.type === 'json') result[s.key] = JSON.parse(s.value || '{}');
      else result[s.key] = s.value;
    });
    return res.json({ settings: result });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { key, value, clear_cache } = req.body;

    if (clear_cache) {
      const dirs = ['uploads/icons', 'uploads/screenshots', 'uploads/temp'];
      for (const dir of dirs) {
        const dirPath = path.join(__dirname, '../../', dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath).filter(f => f !== '.gitkeep');
          for (const file of files) {
            fs.rmSync(path.join(dirPath, file), { force: true });
          }
        }
      }
      return res.json({ message: 'Cache cleared.' });
    }

    if (!key) {
      const keys = Object.keys(req.body).filter(k => k !== 'clear_cache');
      for (const k of keys) {
        const v = req.body[k];
        const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
        const type = typeof v === 'boolean' ? 'boolean' : typeof v === 'number' ? 'integer' : 'string';
        await pool.query(
          'INSERT INTO settings (`key`, `value`, `type`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `value` = ?, `type` = ?',
          [k, val, type, val, type]
        );
      }
      return res.json({ message: 'Settings updated.' });
    }

    const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'integer' : 'string';

    await pool.query(
      'INSERT INTO settings (`key`, `value`, `type`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `value` = ?, `type` = ?',
      [key, val, type, val, type]
    );

    return res.json({ message: 'Setting updated.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const url = `/uploads/icons/${req.file.filename}`;
    await pool.query(
      'INSERT INTO settings (`key`, `value`, `type`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      ['site_logo', url, 'file', url]
    );
    return res.json({ logo_url: url });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getStorageInfo = async (req, res) => {
  try {
    const [[{ used }]] = await pool.query('SELECT COALESCE(SUM(file_size), 0) as used FROM app_versions');
    const [[{ apkCount }]] = await pool.query('SELECT COUNT(*) as apkCount FROM app_versions');
    const [[{ screenshotCount }]] = await pool.query(
      "SELECT COUNT(*) as screenshotCount FROM apps WHERE screenshots IS NOT NULL"
    );

    const maxStorage = 107374182400;
    const usagePercent = maxStorage > 0 ? Math.round((used / maxStorage) * 100) : 0;

    return res.json({
      storage: {
        used,
        max: maxStorage,
        usagePercent,
        apkCount,
        screenshotCount
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};
