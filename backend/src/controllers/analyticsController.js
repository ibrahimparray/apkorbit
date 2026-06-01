const pool = require('../config/database');

exports.dashboard = async (req, res) => {
  try {
    const [[{ totalApps }]] = await pool.query('SELECT COUNT(*) as totalApps FROM apps WHERE is_archived = 0');
    const [[{ totalDownloads }]] = await pool.query('SELECT COUNT(*) as totalDownloads FROM downloads');
    const [[{ totalVersions }]] = await pool.query('SELECT COUNT(*) as totalVersions FROM app_versions');
    const [[{ totalCategories }]] = await pool.query('SELECT COUNT(*) as totalCategories FROM categories WHERE is_active = 1');

    const [recentUploads] = await pool.query(
      `SELECT a.id, a.name, a.slug, a.icon_url, av.version_name, a.created_at
       FROM apps a LEFT JOIN app_versions av ON a.latest_version_id = av.id
       WHERE a.is_archived = 0
       ORDER BY a.created_at DESC LIMIT 5`
    );

    const [recentUpdates] = await pool.query(
      `SELECT a.id, a.name, a.slug, a.icon_url, av.version_name, av.created_at as updated_at
       FROM app_versions av JOIN apps a ON av.app_id = a.id
       WHERE a.is_archived = 0
       ORDER BY av.created_at DESC LIMIT 5`
    );

    const [topDownloads] = await pool.query(
      `SELECT a.id, a.name, a.slug, a.icon_url, a.total_downloads
       FROM apps a WHERE a.is_archived = 0
       ORDER BY a.total_downloads DESC LIMIT 5`
    );

    const [downloadsByDay] = await pool.query(
      `SELECT DATE(downloaded_at) as date, COUNT(*) as count
       FROM downloads WHERE downloaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(downloaded_at) ORDER BY date ASC`
    );

    const [[{ storageUsed }]] = await pool.query(
      'SELECT COALESCE(SUM(file_size), 0) as storageUsed FROM app_versions'
    );

    const [downloadsByDevice] = await pool.query(
      `SELECT COALESCE(device_name, 'Unknown') as device, COUNT(*) as count
       FROM downloads GROUP BY device_name ORDER BY count DESC LIMIT 5`
    );

    const [categoryDistribution] = await pool.query(
      `SELECT c.name, c.color, COUNT(a.id) as count
       FROM categories c LEFT JOIN apps a ON a.category_id = c.id AND a.is_archived = 0
       WHERE c.is_active = 1
       GROUP BY c.id, c.name, c.color ORDER BY count DESC`
    );

    return res.json({
      stats: { totalApps, totalDownloads, totalVersions, totalCategories, storageUsed },
      recentUploads,
      recentUpdates,
      topDownloads,
      downloadsByDay,
      downloadsByDevice,
      categoryDistribution
    });
  } catch (err) {
    console.error('Dashboard analytics error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.downloads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM downloads');

    const [downloads] = await pool.query(
      `SELECT d.*, a.name as app_name, a.slug as app_slug, a.icon_url as app_icon,
              av.version_name, av.version_code
       FROM downloads d
       JOIN apps a ON d.app_id = a.id
       JOIN app_versions av ON d.version_id = av.id
       ORDER BY d.downloaded_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({ downloads, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};
