const mongoose = require('mongoose');
const Product = require('../models/product.model');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'All product fields are required' });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be a non-negative integer' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numericStock
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search?.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category?.trim() && category.trim().toLowerCase() !== 'all') {
      filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(filter)
      .select('name description price category image stock createdAt')
      .sort(sortOption);

    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(id)
      .select('name description price category image stock createdAt');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
