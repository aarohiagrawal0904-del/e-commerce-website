const { pool } = require('../config/db');

// @desc    Get detailed sales analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getSalesAnalytics = async (req, res, next) => {
  try {
    // 1. Monthly sales query
    const [monthlySales] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        SUM(total_amount) as revenue, 
        COUNT(id) as orders_count 
      FROM orders 
      WHERE status != 'cancelled' 
      GROUP BY month 
      ORDER BY month ASC
    `);

    // Convert values to numbers
    const formattedMonthlySales = monthlySales.map(item => ({
      month: item.month,
      revenue: parseFloat(item.revenue || 0),
      ordersCount: parseInt(item.orders_count || 0)
    }));

    // 2. Best selling products query
    const [bestSellers] = await pool.query(`
      SELECT 
        p.name, 
        SUM(oi.quantity) as units_sold, 
        SUM(oi.quantity * oi.price) as revenue 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      JOIN orders o ON oi.order_id = o.id 
      WHERE o.status != 'cancelled' 
      GROUP BY p.id, p.name 
      ORDER BY units_sold DESC 
      LIMIT 5
    `);

    const formattedBestSellers = bestSellers.map(item => ({
      name: item.name,
      unitsSold: parseInt(item.units_sold || 0),
      revenue: parseFloat(item.revenue || 0)
    }));

    // 3. Category revenue distribution
    const [categoryRevenue] = await pool.query(`
      SELECT 
        c.name as category_name, 
        SUM(oi.quantity * oi.price) as revenue 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      JOIN categories c ON p.category_id = c.id 
      JOIN orders o ON oi.order_id = o.id 
      WHERE o.status != 'cancelled' 
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `);

    const formattedCategoryRevenue = categoryRevenue.map(item => ({
      categoryName: item.category_name,
      revenue: parseFloat(item.revenue || 0)
    }));

    res.status(200).json({
      success: true,
      analytics: {
        monthlySales: formattedMonthlySales,
        bestSellers: formattedBestSellers,
        categoryRevenue: formattedCategoryRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesAnalytics
};
