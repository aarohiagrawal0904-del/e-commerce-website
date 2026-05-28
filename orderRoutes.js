const express = require('express');
const router = express.Router();
const { placeOrder, getUserOrders, getOrderDetails } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(placeOrder)
  .get(getUserOrders);

router.route('/:id')
  .get(getOrderDetails);

module.exports = router;
