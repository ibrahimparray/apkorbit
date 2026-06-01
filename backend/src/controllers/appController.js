const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const sort = req.query.sort || 'newest';
    const include_archived = req.query.include_archived === 'true';
    const published = req.query.published;

    let where = [];
    let params = [];

    if (!include_archived) {
      where.push('a.is_archived = 0');
    }

    if (published === 'true') where.push('a.is_published = 1');
    else if (published === 'false') where.push('a.is_published = 0');

    if (category) {
      where.push('c.slug = ?');
      params.push(category);
    }

    if (search) {
      where.push('(a.name LIKE ? OR a.description LIKE ? OR a.short_description LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    let orderBy = 'a.created_at DESC';
    if (sort === 'name') orderBy = 'a.name ASC';
    else if (sort === 'downloads') orderBy = 'a.total_downloads DESC';
    else if (sort === 'updated') orderBy = 'a.updated_at DESC';
    else if (sort === 'oldest') orderBy = 'a.created_at ASC';

    const countQuery = `SELECT COUNT(*) as total FROM apps a LEFT JOIN categories c ON a.category_id = c.id ${whereClause}`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
        av.version_name, av.version_code, av.file_size
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN app_versions av ON a.latest_version_id = av.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [apps] = await pool.query(query, [...params, limit, offset]);
    return res.json({ apps, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List apps error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.detail = async (req, res) => {
  try {
    const identifier = req.params.id;
    let query, params;

    if (isNaN(identifier)) {
      query = `SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM apps a LEFT JOIN categories c ON a.category_id = c.id WHERE a.slug = ?`;
      params = [identifier];
    } else {
      query = `SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM apps a LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?`;
      params = [identifier];
    }

    const [apps] = await pool.query(query, params);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'App not found.' });
    }

    const app = apps[0];
    const [versions] = await pool.query(
      'SELECT * FROM app_versions WHERE app_id = ? ORDER BY version_code DESC',
      [app.id]
    );

    return res.json({ app, versions });
  } catch (err) {
    console.error('App detail error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, package_name, description, short_description, category_id, website_url } = req.body;

    if (!name || !package_name) {
      return res.status(400).json({ message: 'Name and package name are required.' });
    }

    let slug = slugify(name);
    const [existing] = await pool.query('SELECT id FROM apps WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = slug + '-' + uuidv4().substring(0, 8);
    }

    const [existingPkg] = await pool.query('SELECT id FROM apps WHERE package_name = ?', [package_name]);
    if (existingPkg.length > 0) {
      return res.status(400).json({ message: 'An app with this package name already exists.' });
    }

    const icon_url = req.file ? `/uploads/icons/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO apps (user_id, category_id, name, package_name, slug, description, short_description, icon_url, website_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id || null, name, package_name, slug, description || null, short_description || null, icon_url, website_url || null]
    );

    const [app] = await pool.query('SELECT * FROM apps WHERE id = ?', [result.insertId]);
    return res.status(201).json({ app: app[0] });
  } catch (err) {
    console.error('Create app error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, short_description, category_id, website_url, is_published, is_featured } = req.body;

    let slug;
    if (name) {
      slug = slugify(name);
      const [existing] = await pool.query('SELECT id FROM apps WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        slug = slug + '-' + uuidv4().substring(0, 8);
      }
    }

    let icon_url;
    if (req.file) {
      icon_url = `/uploads/icons/${req.file.filename}`;
    }

    const query = `
      UPDATE apps SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        category_id = COALESCE(?, category_id),
        website_url = COALESCE(?, website_url),
        is_published = COALESCE(?, is_published),
        is_featured = COALESCE(?, is_featured),
        icon_url = COALESCE(?, icon_url)
      WHERE id = ?
    `;

    await pool.query(query, [name, slug, description, short_description, category_id, website_url, is_published, is_featured, icon_url, id]);

    const [apps] = await pool.query('SELECT * FROM apps WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'App not found.' });
    return res.json({ app: apps[0] });
  } catch (err) {
    console.error('Update app error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [apps] = await pool.query('SELECT icon_url FROM apps WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'App not found.' });
    const app = apps[0];

    if (app.icon_url) {
      const iconPath = path.join(__dirname, '../..', app.icon_url);
      if (fs.existsSync(iconPath)) fs.unlinkSync(iconPath);
    }

    const [versions] = await pool.query('SELECT file_url FROM app_versions WHERE app_id = ?', [id]);
    for (const v of versions) {
      const filePath = path.join(__dirname, '../..', v.file_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM apps WHERE id = ?', [id]);
    return res.json({ message: 'App deleted successfully.' });
  } catch (err) {
    console.error('Delete app error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const [apps] = await pool.query('SELECT is_published FROM apps WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'App not found.' });
    const newStatus = apps[0].is_published ? 0 : 1;
    await pool.query('UPDATE apps SET is_published = ? WHERE id = ?', [newStatus, id]);
    return res.json({ is_published: !!newStatus });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const [apps] = await pool.query('SELECT is_archived FROM apps WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'App not found.' });
    const newStatus = apps[0].is_archived ? 0 : 1;
    await pool.query('UPDATE apps SET is_archived = ? WHERE id = ?', [newStatus, id]);
    return res.json({ is_archived: !!newStatus });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.uploadScreenshots = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No screenshots uploaded.' });
    }

    const [apps] = await pool.query('SELECT screenshots FROM apps WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'App not found.' });

    const existing = apps[0].screenshots ? JSON.parse(apps[0].screenshots) : [];
    const newScreenshots = files.map(f => `/uploads/screenshots/${f.filename}`);
    const all = [...existing, ...newScreenshots];

    await pool.query('UPDATE apps SET screenshots = ? WHERE id = ?', [JSON.stringify(all), id]);
    return res.json({ screenshots: all });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.uploadVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { version_name, version_code, changelog, min_sdk, target_sdk } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'APK file is required.' });
    }

    if (!version_name || !version_code) {
      return res.status(400).json({ message: 'Version name and version code are required.' });
    }

    const [apps] = await pool.query('SELECT id FROM apps WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'App not found.' });

    const file_url = `/uploads/apks/${req.file.filename}`;
    const file_size = req.file.size;

    const [existing] = await pool.query(
      'SELECT id FROM app_versions WHERE app_id = ? AND version_code = ?',
      [id, version_code]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Version code already exists for this app.' });
    }

    await pool.query('UPDATE app_versions SET is_current = 0 WHERE app_id = ?', [id]);

    const [result] = await pool.query(
      `INSERT INTO app_versions (app_id, version_name, version_code, changelog, file_url, file_size, min_sdk, target_sdk, is_current)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, version_name, version_code, changelog || null, file_url, file_size, min_sdk || 21, target_sdk || 34]
    );

    await pool.query('UPDATE apps SET latest_version_id = ? WHERE id = ?', [result.insertId, id]);

    const [version] = await pool.query('SELECT * FROM app_versions WHERE id = ?', [result.insertId]);
    return res.status(201).json({ version: version[0] });
  } catch (err) {
    console.error('Upload version error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.latestVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const [versions] = await pool.query(
      'SELECT * FROM app_versions WHERE app_id = ? ORDER BY version_code DESC LIMIT 1',
      [id]
    );
    if (versions.length === 0) {
      return res.status(404).json({ message: 'No versions found.' });
    }
    return res.json({ version: versions[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.downloadAPK = async (req, res) => {
  try {
    const { id, versionId } = req.params;
    const versionIdentifier = versionId || 'latest';

    let version;
    if (versionIdentifier === 'latest') {
      const [versions] = await pool.query(
        'SELECT * FROM app_versions WHERE app_id = ? ORDER BY version_code DESC LIMIT 1',
        [id]
      );
      if (versions.length === 0) return res.status(404).json({ message: 'No versions found.' });
      version = versions[0];
    } else {
      const [versions] = await pool.query('SELECT * FROM app_versions WHERE id = ? AND app_id = ?', [versionIdentifier, id]);
      if (versions.length === 0) return res.status(404).json({ message: 'Version not found.' });
      version = versions[0];
    }

    const filePath = path.join(__dirname, '../..', version.file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'APK file not found on server.' });
    }

    await pool.query('UPDATE app_versions SET downloads_count = downloads_count + 1 WHERE id = ?', [version.id]);
    await pool.query('UPDATE apps SET total_downloads = total_downloads + 1 WHERE id = ?', [id]);

    await pool.query(
      `INSERT INTO downloads (app_id, version_id, device_id, device_name, device_model, android_version, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, version.id, req.headers['x-device-id'] || null, req.headers['x-device-name'] || null,
       req.headers['x-device-model'] || null, req.headers['x-android-version'] || null,
       req.ip, req.headers['user-agent'] || null]
    );

    return res.download(filePath, `${path.basename(filePath)}`);
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.checkUpdate = async (req, res) => {
  try {
    const { package_name, current_version_code } = req.body;
    if (!package_name || !current_version_code) {
      return res.status(400).json({ message: 'Package name and current version code are required.' });
    }

    const [apps] = await pool.query('SELECT id, name, slug FROM apps WHERE package_name = ? AND is_published = 1 AND is_archived = 0', [package_name]);
    if (apps.length === 0) {
      return res.json({ update_available: false });
    }

    const app = apps[0];
    const [versions] = await pool.query(
      'SELECT * FROM app_versions WHERE app_id = ? ORDER BY version_code DESC LIMIT 1',
      [app.id]
    );

    if (versions.length === 0) {
      return res.json({ update_available: false });
    }

    const latest = versions[0];
    const updateAvailable = parseInt(latest.version_code) > parseInt(current_version_code);

    if (updateAvailable) {
      return res.json({
        update_available: true,
        app: {
          id: app.id,
          name: app.name,
          slug: app.slug
        },
        version: {
          id: latest.id,
          version_name: latest.version_name,
          version_code: latest.version_code,
          changelog: latest.changelog,
          file_size: latest.file_size
        }
      });
    }

    return res.json({ update_available: false });
  } catch (err) {
    console.error('Check update error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
