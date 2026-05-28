const express = require('express');
const router = express.Router();
const { getAiDescription, getAiSalesInsights, getAiChatResponse } = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes (chat is available to all authenticated users)
router.post('/chat', protect, getAiChatResponse);

// Admin-only AI endpoints
router.post('/generate-description', protect, adminOnly, getAiDescription);
router.post('/sales-insights', protect, adminOnly, getAiSalesInsights);

module.exports = router;
