const { pool } = require('../config/db');
const {
  generateProductDescription,
  generateSalesInsights,
  chatCustomerSupport
} = require('../utils/gemini');

// @desc    Generate product description using Gemini
// @route   POST /api/ai/generate-description
// @access  Private/Admin
const getAiDescription = async (req, res, next) => {
  try {
    const { productName, categoryName } = req.body;

    if (!productName) {
      res.status(400);
      return next(new Error('Product name is required for description generation'));
    }

    const description = await generateProductDescription(productName, categoryName);

    res.status(200).json({
      success: true,
      description
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate business sales insights using Gemini
// @route   POST /api/ai/sales-insights
// @access  Private/Admin
const getAiSalesInsights = async (req, res, next) => {
  try {
    // 1. Fetch sales breakdown to feed to AI
    const [monthlySales] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue, COUNT(id) as orders_count 
      FROM orders WHERE status != 'cancelled' GROUP BY month ORDER BY month ASC
    `);
    const [bestSellers] = await pool.query(`
      SELECT p.name, SUM(oi.quantity) as units_sold, SUM(oi.quantity * oi.price) as revenue 
      FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id 
      WHERE o.status != 'cancelled' GROUP BY p.id, p.name ORDER BY units_sold DESC LIMIT 5
    `);
    const [categoryRevenue] = await pool.query(`
      SELECT c.name as category_name, SUM(oi.quantity * oi.price) as revenue 
      FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN categories c ON p.category_id = c.id 
      JOIN orders o ON oi.order_id = o.id WHERE o.status != 'cancelled' GROUP BY c.id, c.name
    `);

    const analyticsContext = {
      monthlySales: monthlySales.map(i => ({ month: i.month, revenue: parseFloat(i.revenue), orders: i.orders_count })),
      bestSellers: bestSellers.map(i => ({ name: i.name, units: parseInt(i.units_sold), revenue: parseFloat(i.revenue) })),
      categoryDistribution: categoryRevenue.map(i => ({ category: i.category_name, revenue: parseFloat(i.revenue) }))
    };

    // 2. Generate insights using Gemini
    const insights = await generateSalesInsights(analyticsContext);

    res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interact with the customer support AI chatbot
// @route   POST /api/ai/chat
// @access  Private
const getAiChatResponse = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const user = req.user; // loaded by protect middleware

    if (!message) {
      res.status(400);
      return next(new Error('Message content is required'));
    }

    // 1. Gather Customer Order History Context
    const [userOrders] = await pool.query(
      `SELECT o.id as order_id, o.total_amount, o.status, o.payment_status, o.created_at,
              d.tracking_number, d.carrier, d.delivery_status, d.estimated_delivery
       FROM orders o
       LEFT JOIN deliveries d ON o.id = d.order_id
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [user.id]
    );

    // 2. Gather Store Product Catalog Context (top 15 items for recommendations)
    const [catalog] = await pool.query(
      `SELECT p.id, p.name, p.price, p.stock, c.name as category 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock > 0
       LIMIT 15`
    );

    const storeContext = {
      userName: user.name,
      userEmail: user.email,
      userOrders,
      catalog: catalog.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, inStock: p.stock }))
    };

    // 3. Request conversation resolution from Gemini Utility
    const responseText = await chatCustomerSupport(message, history, storeContext);

    res.status(200).json({
      success: true,
      response: responseText
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAiDescription,
  getAiSalesInsights,
  getAiChatResponse
};
