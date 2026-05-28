const express = require('express');
const router = express.Router();
const { getSalesAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Analytics requires admin privileges
router.get('/', protect, adminOnly, getSalesAnalytics);

module.exports = router;
