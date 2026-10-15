require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with tactile blue switches and aluminum frame.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    stock: 12
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 40h battery.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    stock: 20
  },
  {
    name: "Wireless Ergonomic Mouse",
    description: "Precision wireless mouse with customizable DPI, silent clicks and Bluetooth 5.0.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
    stock: 15
  },
  {
    name: "Premium Denim Jacket",
    description: "Classic rugged denim jacket tailored with durable stitching and metal buttons.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
    stock: 8
  },
  {
    name: "Clean Architecture & Design Guide",
    description: "A craftsman's guide to software structure and design principles.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    stock: 25
  },
  {
    name: "Smart Ambient Desk Lamp",
    description: "Dimmable LED lamp with color temperature adjustment and wireless charging base.",
    price: 1799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    stock: 10
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    const existing = await Product.countDocuments();
    if (existing === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`Successfully seeded ${sampleProducts.length} sample products`);
    } else {
      console.log(`Database already has ${existing} products`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}
seed();
