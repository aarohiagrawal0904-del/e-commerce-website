const { pool } = require('../config/db');

// @desc    Get all products (with filters & search)
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];

    // Category Filter
    if (category) {
      query += ' AND (p.category_id = ? OR c.name = ?)';
      queryParams.push(category, category);
    }

    // Search Term Filter (Name or Description)
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Sorting
    if (sort === 'price-low') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price-high') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'newest') {
      query += ' ORDER BY p.created_at DESC';
    } else {
      query += ' ORDER BY p.id DESC'; // default newest/id order
    }

    const [rows] = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: rows.length,
      products: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [productId]
    );

    if (rows.length === 0) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    res.status(200).json({
      success: true,
      product: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories/all
// @access  Public
const getAllCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.status(200).json({
      success: true,
      categories: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getAllCategories
};
