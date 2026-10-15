import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { totalUnits } = useCart();
  const { wishlistItems } = useWishlist();

  const [customer, setCustomer] = useState(null);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    api.get('/customers/me')
      .then((r) => setCustomer(r.data))
      .catch(() => navigate('/login', { replace: true }));

    api.get('/orders')
      .then((r) => {
        if (r.data?.success) setOrderCount(r.data.count || 0);
      })
      .catch(() => {});
  }, [navigate]);

  if (!customer) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="home">
        <p className="tag">DASHBOARD</p>
        <h1>Welcome back, {customer.fullName}!</h1>
        <p className="home-subtitle">
          Manage your ShopKart account, browse new arrivals, and track your orders.
        </p>

        <section className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/cart')}>
            <span className="stat-icon">🛒</span>
            <div>
              <span className="stat-num">{totalUnits}</span>
              <p className="stat-label">Items in Cart</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/wishlist')}>
            <span className="stat-icon">❤️</span>
            <div>
              <span className="stat-num">{wishlistItems.length}</span>
              <p className="stat-label">Wishlist Items</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/orders')}>
            <span className="stat-icon">📦</span>
            <div>
              <span className="stat-num">{orderCount}</span>
              <p className="stat-label">Orders Placed</p>
            </div>
          </div>
        </section>

        <div className="home-actions">
          <Link className="primary" to="/products">
            Browse Products Catalogue →
          </Link>
          <Link className="secondary-button" to="/orders">
            View My Orders
          </Link>
        </div>

        <section className="profile">
          <h2>Customer Account Info</h2>
          <div>
            <span>Full Name</span>
            <strong>{customer.fullName}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{customer.email}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{customer.phone}</strong>
          </div>
          <div>
            <span>Account Type</span>
            <span className="category-badge">Verified Customer</span>
          </div>
        </section>
      </main>
    </>
  );
}
