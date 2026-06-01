// src/middleware/auth.js

const authenticate = (req, res, next) => {
  next(); // temporary bypass (no DB, no JWT check)
};

const authorize = () => (req, res, next) => {
  next(); // allow everything for now
};

module.exports = { authenticate, authorize };
