import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    updateQuantity,
    removeFromCart,
    fetchCart
  } = useCart();

  return (
    <>
      <Navbar />
      <main className="cart-page">
        <div className="page-header">
          <div>
            <p className="tag">ORDER DETAILS</p>
            <h1>My Shopping Cart</h1>
            <p>{totalUnits} {totalUnits === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <Link className="secondary-button" to="/products">
            Continue Shopping
          </Link>
        </div>

        {loading && (
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-card error">
            <h3>Unable to load cart</h3>
            <p>{error}</p>
            <button className="primary" onClick={fetchCart}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="state-card empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button className="primary" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            <section className="cart-items-list">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const itemTotal = product.price * item.quantity;
                const maxStock = product.stock;

                return (
                  <article key={product._id} className="cart-item-card">
                    <div className="cart-item-image">
                      <img src={product.image} alt={product.name} />
                    </div>

                    <div className="cart-item-info">
                      <span className="category-badge">{product.category}</span>
                      <h3>
                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                      </h3>
                      <p className="cart-unit-price">
                        ₹{Number(product.price).toLocaleString('en-IN')} each
                      </p>
                      <p className="cart-stock-note">
                        {maxStock} in stock
                      </p>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-counter">
                        <button
                          className="qty-btn"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          disabled={item.quantity >= maxStock}
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-total">
                        ₹{Number(itemTotal).toLocaleString('en-IN')}
                      </div>

                      <button
                        className="danger-btn remove-cart-btn"
                        onClick={() => removeFromCart(product._id)}
                        title="Remove product"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="order-summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Total Items</span>
                <strong>{totalUnits}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <strong className="free-badge">FREE</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Subtotal</span>
                <span className="subtotal-amount">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                className="primary checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout →
              </button>

              <div className="summary-note">
                🔒 Safe and secure payment with Razorpay Test Mode
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
