const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getAllCategories } = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/categories/all', getAllCategories);
router.get('/:id', getProductById);

module.exports = router;
