const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (email === 'admin@demo.com' && password === '123456') {
    return res.json({
      success: true,
      token: 'simple-token-123',
      user: {
        id: 1,
        name: 'Admin',
        email
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

module.exports = router;
