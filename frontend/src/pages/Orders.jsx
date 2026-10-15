import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/orders');
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load order history');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />
      <main className="orders-page">
        <div className="page-header">
          <div>
            <p className="tag">PURCHASE HISTORY</p>
            <h1>My Orders</h1>
            <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
          </div>
          <Link className="secondary-button" to="/products">
            Browse Products
          </Link>
        </div>

        {loading && (
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-card error">
            <h3>Unable to load orders</h3>
            <p>{error}</p>
            <button className="primary" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="state-card empty-orders">
            <div className="empty-orders-icon">📦</div>
            <h2>You have not placed any orders yet</h2>
            <p>When you complete a purchase, your order history will appear here.</p>
            <button className="primary" onClick={() => navigate('/products')}>
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order._id} className="order-history-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id-label">ORDER #{order._id}</span>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="order-badges">
                    <span className={`status-badge ${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-items-preview-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-preview-item">
                      <img src={item.image} alt={item.name} />
                      <div className="preview-details">
                        <h4>{item.name}</h4>
                        <p>₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}</p>
                      </div>
                      <div className="preview-total">
                        ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-footer-total">
                    <span>Total Amount:</span>
                    <strong>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>
                  </div>

                  <Link className="secondary-button" to={`/order-success/${order._id}`}>
                    View Order Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
