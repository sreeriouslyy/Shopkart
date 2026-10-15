const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

module.exports = router;
