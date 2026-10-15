const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

router.use(protect);

router.post('/:productId', cartController.addToCart);
router.get('/', cartController.getCart);
router.patch('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
