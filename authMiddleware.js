const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey12345!');

      // Get user from database (excluding password)
      const [rows] = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      // Attach user to request object
      req.user = rows[0];
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

// Admin access only guard
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Access denied. Administrator privileges required.'));
  }
};

module.exports = {
  protect,
  adminOnly
};
