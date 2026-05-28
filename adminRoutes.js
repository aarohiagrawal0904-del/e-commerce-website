const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  addProduct,
  editProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes here require user login & admin role privileges
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.post('/products', addProduct);
router.route('/products/:id')
  .put(editProduct)
  .delete(deleteProduct);

module.exports = router;
