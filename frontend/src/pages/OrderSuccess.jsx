import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data?.success) {
          setOrder(res.data.order);
        } else {
          setError('Order could not be loaded');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="order-success-page">
        {loading && (
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading confirmation details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-card error">
            <h3>Unable to fetch order confirmation</h3>
            <p>{error}</p>
            <button className="primary" onClick={() => navigate('/orders')}>
              Go to My Orders
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-success-card">
            <div className="success-icon-banner">
              <span className="success-check-badge">✓</span>
              <h1>Order Placed Successfully!</h1>
              <p>Thank you for shopping with ShopKart. Your order has been placed.</p>
            </div>

            <div className="order-meta-grid">
              <div className="meta-box">
                <span>Order ID</span>
                <strong>{order._id}</strong>
              </div>
              <div className="meta-box">
                <span>Order Date</span>
                <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
              <div className="meta-box">
                <span>Payment Status</span>
                <span className="status-badge paid">{order.paymentStatus}</span>
              </div>
              <div className="meta-box">
                <span>Order Status</span>
                <span className="status-badge placed">{order.status}</span>
              </div>
            </div>

            <section className="order-items-section">
              <h3>Items Ordered</h3>
              <div className="order-items-list">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <img src={item.image} alt={item.name} />
                    <div className="order-item-desc">
                      <h4>{item.name}</h4>
                      <p>₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}</p>
                    </div>
                    <div className="order-item-subtotal">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-total-summary">
                <div className="summary-row">
                  <span>Shipping</span>
                  <strong className="free-badge">FREE</strong>
                </div>
                <div className="summary-row total-row">
                  <span>Total Paid</span>
                  <span className="subtotal-amount">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </section>

            {order.shippingAddress && (
              <section className="order-shipping-summary">
                <h3>Delivery Address</h3>
                <p><strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              </section>
            )}

            <div className="order-success-actions">
              <Link className="primary" to="/orders">
                View My Orders
              </Link>
              <Link className="secondary-button" to="/products">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
