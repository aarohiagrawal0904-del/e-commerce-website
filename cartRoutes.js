const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require user authentication
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartQuantity)
  .delete(removeFromCart);

module.exports = router;
