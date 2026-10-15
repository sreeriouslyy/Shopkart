const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password || !phone)
      return res.status(400).json({ success: false, message: 'All fields are mandatory' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });

    const normalizedEmail = email.trim().toLowerCase();
    if (await Customer.findOne({ email: normalizedEmail }))
      return res.status(409).json({ success: false, message: 'Email already exists' });

    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      phone: phone.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: { _id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone }
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const customer = await Customer.findOne({ email: email.trim().toLowerCase() });
    if (!customer || !(await bcrypt.compare(password, customer.password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.cookie('token', generateToken(customer._id.toString()), cookieOptions);
    res.json({ success: true, message: 'Login successful' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.me = (req, res) => res.json(req.user);

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Valid old and new passwords are required' });
    const customer = await Customer.findById(req.user._id);
    if (!(await bcrypt.compare(oldPassword, customer.password)))
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
