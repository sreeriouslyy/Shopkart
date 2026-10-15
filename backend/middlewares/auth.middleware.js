const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

module.exports = async function protect(req, res, next) {
  try {
    const bearerHeader = req.headers.authorization;
    const bearerToken = bearerHeader && bearerHeader.startsWith('Bearer ') ? bearerHeader.split(' ')[1] : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({ success: false, message: 'User not found or session invalid.' });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
