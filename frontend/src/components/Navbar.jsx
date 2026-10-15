import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';

export default function Navbar() {
  const navigate = useNavigate();
  const { totalUnits, clearCartState } = useCart();

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      clearCartState();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/products" className="navbar-brand">
          <span className="brand-badge">S</span>
          <span className="brand-text">ShopKart</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/home" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Products
          </NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Wishlist
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active cart-nav' : 'nav-link cart-nav')}>
            Cart
            <span className="cart-badge">{totalUnits}</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            My Orders
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button onClick={handleLogout} className="logout-btn" title="Log out of ShopKart">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
