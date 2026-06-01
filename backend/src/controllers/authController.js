const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.twofa_enabled) {
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    }

    return res.json({ requires2fa: true, userId: user.id });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.verify2fa = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ message: 'User ID and code are required.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    if (!user.twofa_enabled || !user.twofa_secret) {
      return res.status(400).json({ message: '2FA not enabled.' });
    }

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token: code
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA code.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('2FA error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }

    await pool.query('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
      [name, email, userId]);

    const [users] = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [userId]);
    return res.json({ user: users[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    const isMatch = await bcrypt.compare(current_password, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
