const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

router.use(protect);

router.post('/create-payment-order', orderController.createPaymentOrder);
router.post('/verify-payment', orderController.verifyPayment);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
