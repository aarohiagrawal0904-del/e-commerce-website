const { pool } = require('../config/db');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res, next) => {
  let connection;
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      res.status(400);
      return next(new Error('Please provide shipping address and payment method'));
    }

    // 1. Get user cart items
    const [cartItems] = await pool.query(
      `SELECT c.*, p.name, p.price, p.stock 
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      res.status(400);
      return next(new Error('Your shopping cart is empty'));
    }

    // 2. Validate stock for all items
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        res.status(400);
        return next(new Error(`Insufficient stock. Only ${item.stock} left for ${item.name}`));
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // 3. Start MySQL Transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 4. Create Order Record
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status) 
       VALUES (?, ?, 'pending', ?, 'paid')`, // assume paid immediately for demo simplicity
      [userId, totalAmount, shippingAddress]
    );
    const orderId = orderResult.insertId;

    // 5. Create Order Items and Deduct Stock
    const insertItemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price) 
      VALUES (?, ?, ?, ?)
    `;
    const deductStockQuery = `
      UPDATE products 
      SET stock = stock - ? 
      WHERE id = ?
    `;

    for (const item of cartItems) {
      // Insert item
      await connection.query(insertItemQuery, [orderId, item.product_id, item.quantity, item.price]);
      // Deduct stock
      await connection.query(deductStockQuery, [item.quantity, item.product_id]);
    }

    // 6. Create Payment Record
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await connection.query(
      `INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id) 
       VALUES (?, ?, ?, 'completed', ?)`,
      [orderId, paymentMethod, totalAmount, transactionId]
    );

    // 7. Create Delivery Record
    const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // estimated 3 days delivery
    
    await connection.query(
      `INSERT INTO deliveries (order_id, tracking_number, carrier, delivery_status, estimated_delivery) 
       VALUES (?, ?, 'FedEx', 'pending', ?)`,
      [orderId, trackingNumber, estimatedDelivery]
    );

    // 8. Clear Cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    // Commit transaction
    await connection.commit();
    connection.release();
    connection = null; // prevent release double-call in finally

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      totalAmount,
      trackingNumber
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT o.*, 
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    // Check if order exists and belongs to user
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    const order = orders[0];

    // Authorize: Only admin or the order owner can view it
    if (req.user.role !== 'admin' && order.user_id !== userId) {
      res.status(403);
      return next(new Error('Unauthorized to view this order'));
    }

    // Get order items with product details
    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // Get payment details
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );

    // Get delivery details
    const [deliveries] = await pool.query(
      'SELECT * FROM deliveries WHERE order_id = ?',
      [orderId]
    );

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        payment: payments.length > 0 ? payments[0] : null,
        delivery: deliveries.length > 0 ? deliveries[0] : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderDetails
};
