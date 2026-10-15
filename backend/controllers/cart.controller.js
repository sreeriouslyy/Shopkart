const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Helper to populate and sanitize cart items
async function getPopulatedCart(customerId) {
  const customer = await Customer.findById(customerId).populate({
    path: 'cart.product',
    select: 'name price category image stock'
  });

  if (!customer) return [];

  // Filter out any items whose product reference no longer exists
  const validCart = (customer.cart || []).filter((item) => item.product !== null);
  if (validCart.length !== customer.cart.length) {
    customer.cart = validCart;
    await customer.save();
  }

  return customer.cart;
}

// POST /cart/:productId
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer not found' });
    }

    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = customer.cart[existingItemIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units available in stock.`
        });
      }
      customer.cart[existingItemIndex].quantity = newQuantity;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is currently out of stock'
        });
      }
      customer.cart.push({ product: product._id, quantity: 1 });
    }

    await customer.save();
    const updatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

// GET /cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    return res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
};

// PATCH /cart/:productId
exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const numericQty = Number(quantity);
    if (!Number.isInteger(numericQty) || numericQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer greater than or equal to 1'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer not found' });
    }

    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    if (numericQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`
      });
    }

    customer.cart[existingItemIndex].quantity = numericQty;
    await customer.save();

    const updatedCart = await getPopulatedCart(customer._id);

    return res.json({
      success: true,
      message: 'Quantity updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
};

// DELETE /cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer not found' });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await customer.save();

    const updatedCart = await getPopulatedCart(customer._id);

    return res.json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
};
