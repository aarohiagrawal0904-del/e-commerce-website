const { pool } = require('../config/db');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock 
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      cart: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const qty = parseInt(quantity) || 1;

    if (!productId) {
      res.status(400);
      return next(new Error('Product ID is required'));
    }

    // Check if product exists and check stock
    const [products] = await pool.query('SELECT stock, name FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    const product = products[0];

    // Check if already in cart
    const [existingCartItems] = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    let newQty = qty;
    if (existingCartItems.length > 0) {
      newQty = existingCartItems[0].quantity + qty;
    }

    // Validate stock
    if (product.stock < newQty) {
      res.status(400);
      return next(new Error(`Insufficient stock. Only ${product.stock} units available for ${product.name}`));
    }

    if (existingCartItems.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [newQty, userId, productId]
      );
    } else {
      // Insert item
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, qty]
      );
    }

    // Return the updated cart
    const [updatedCart] = await pool.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock 
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      res.status(400);
      return next(new Error('Please provide a valid quantity greater than zero'));
    }

    // Check stock
    const [products] = await pool.query('SELECT stock, name FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    if (products[0].stock < qty) {
      res.status(400);
      return next(new Error(`Insufficient stock. Only ${products[0].stock} units available for ${products[0].name}`));
    }

    // Check if item exists in cart
    const [existing] = await pool.query(
      'SELECT id FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length === 0) {
      res.status(404);
      return next(new Error('Product not found in your cart'));
    }

    // Update quantity
    await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [qty, userId, productId]
    );

    // Return the updated cart
    const [updatedCart] = await pool.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock 
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Cart quantity updated successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Delete item
    const [result] = await pool.query(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      res.status(404);
      return next(new Error('Product not found in your cart'));
    }

    // Return the updated cart
    const [updatedCart] = await pool.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock 
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Shopping cart cleared successfully',
      cart: []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
