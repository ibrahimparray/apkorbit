const pool = require('../config/database');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

exports.list = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT c.*, (SELECT COUNT(*) FROM apps WHERE category_id = c.id AND is_archived = 0) as app_count FROM categories c ORDER BY c.sort_order ASC'
    );
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.detail = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (categories.length === 0) return res.status(404).json({ message: 'Category not found.' });
    return res.json({ category: categories[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    let slug = slugify(name);
    const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = slug + '-' + Date.now();
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)',
      [name, slug, description || null, icon || 'folder', color || '#6366f1']
    );

    const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return res.status(201).json({ category: category[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, sort_order, is_active } = req.body;

    let slug;
    if (name) {
      slug = slugify(name);
      const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) slug = slug + '-' + Date.now();
    }

    await pool.query(
      'UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = COALESCE(?, description), icon = COALESCE(?, icon), color = COALESCE(?, color), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active) WHERE id = ?',
      [name, slug, description, icon, color, sort_order, is_active, id]
    );

    const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) return res.status(404).json({ message: 'Category not found.' });
    return res.json({ category: categories[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE apps SET category_id = NULL WHERE category_id = ?', [id]);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return res.json({ message: 'Category deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};
