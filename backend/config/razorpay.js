const Razorpay = require('razorpay');

let razorpayInstance = null;

try {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart123';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_test_secret_123';

  razorpayInstance = new Razorpay({
    key_id,
    key_secret
  });
} catch (error) {
  console.warn('Razorpay initialization notice:', error.message);
}

module.exports = razorpayInstance;
