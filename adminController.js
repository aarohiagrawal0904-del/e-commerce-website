const { pool } = require('../config/db');

// ==========================================
// 1. ADMIN DASHBOARD & STATISTICS
// ==========================================

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // Total users (excluding admin itself)
    const [userCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    
    // Total orders
    const [orderCount] = await pool.query("SELECT COUNT(*) as count FROM orders");
    
    // Total revenue (excluding cancelled orders)
    const [revenueResult] = await pool.query(
      "SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'"
    );
    const totalRevenue = parseFloat(revenueResult[0].total || 0);

    // Recent orders (joined with user details)
    const [recentOrders] = await pool.query(
      `SELECT o.*, u.name as user_name 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC
       LIMIT 5`
    );

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: userCount[0].count,
        totalOrders: orderCount[0].count,
        totalRevenue: totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. PRODUCT MANAGEMENT (CRUD)
// ==========================================

// @desc    Add a new product
// @route   POST /api/admin/products
// @access  Private/Admin
const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    if (!name || !price || isNaN(price) || stock === undefined || isNaN(stock)) {
      res.status(400);
      return next(new Error('Please provide valid product name, price, and stock quantity'));
    }

    const img = imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || '', parseFloat(price), parseInt(stock), categoryId || null, img]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      productId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const editProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    // Check if product exists
    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    if (!name || !price || isNaN(price) || stock === undefined || isNaN(stock)) {
      res.status(400);
      return next(new Error('Please provide valid product name, price, and stock quantity'));
    }

    await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ? 
       WHERE id = ?`,
      [name, description || '', parseFloat(price), parseInt(stock), categoryId || null, imageUrl, productId]
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    if (result.affectedRows === 0) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. ORDER & DELIVERY MANAGEMENT
// ==========================================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email, d.tracking_number, d.carrier, d.delivery_status 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN deliveries d ON o.id = d.order_id
       ORDER BY o.id DESC`
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

// @desc    Update order and delivery status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  let connection;
  try {
    const orderId = req.params.id;
    const { status } = req.body; // pending, processing, shipped, delivered, cancelled

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400);
      return next(new Error('Please provide a valid order status'));
    }

    // Check if order exists
    const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    // Start database transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Update Order status
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    // 2. Synchronize Delivery tracking status
    let deliveryStatus = 'pending';
    let actualDeliveryDate = null;

    if (status === 'processing') {
      deliveryStatus = 'pending';
    } else if (status === 'shipped') {
      deliveryStatus = 'in_transit';
    } else if (status === 'delivered') {
      deliveryStatus = 'delivered';
      actualDeliveryDate = new Date();
    } else if (status === 'cancelled') {
      deliveryStatus = 'failed';
    }

    // Check if delivery record exists
    const [deliveries] = await connection.query('SELECT id FROM deliveries WHERE order_id = ?', [orderId]);
    if (deliveries.length > 0) {
      await connection.query(
        `UPDATE deliveries 
         SET delivery_status = ?, actual_delivery = ? 
         WHERE order_id = ?`,
        [deliveryStatus, actualDeliveryDate, orderId]
      );
    }

    // 3. Rollback stock if order is cancelled
    if (status === 'cancelled' && orders[0].status !== 'cancelled') {
      // Get all items in the cancelled order
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );

      // Return items back to stock
      for (const item of items) {
        if (item.product_id) {
          await connection.query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
      
      // Also update payment status to refunded if order is cancelled
      await connection.query(
        "UPDATE payments SET payment_status = 'refunded' WHERE order_id = ?",
        [orderId]
      );
      await connection.query(
        "UPDATE orders SET payment_status = 'refunded' WHERE id = ?",
        [orderId]
      );
    }

    // Commit changes
    await connection.commit();
    connection.release();
    connection = null;

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  addProduct,
  editProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus
};
