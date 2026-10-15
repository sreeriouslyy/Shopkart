import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong while loading the product.');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const wishlisted = product ? isInWishlist(product._id) : false;
  const inStock = product ? product.stock > 0 : false;

  const handleAddToCart = async () => {
    if (!product || !inStock || cartLoading) return;
    setCartLoading(true);
    setFeedback({ text: '', type: '' });
    try {
      const res = await addToCart(product._id);
      if (res.success) {
        setFeedback({ text: 'Added to your shopping cart!', type: 'success' });
      } else {
        if (res.status === 401) navigate('/login');
        else setFeedback({ text: res.message || 'Could not add to cart', type: 'error' });
      }
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || wishlistLoading) return;
    setWishlistLoading(true);
    setFeedback({ text: '', type: '' });
    try {
      if (wishlisted) {
        const res = await removeFromWishlist(product._id);
        if (res.success) {
          setFeedback({ text: 'Removed from your wishlist', type: 'info' });
        }
      } else {
        const res = await addToWishlist(product._id);
        if (res.success) {
          setFeedback({ text: 'Saved to your wishlist!', type: 'success' });
        } else {
          if (res.status === 401) navigate('/login');
          else setFeedback({ text: res.message || 'Could not update wishlist', type: 'error' });
        }
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="details-page">
        {loading && (
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading product details...</p>
          </div>
        )}

        {!loading && error && (
          <section className="state-card error">
            <p>{error}</p>
            <button className="primary" onClick={() => navigate('/products')}>
              Back to Products
            </button>
          </section>
        )}

        {!loading && !error && product && (
          <section className="details-card">
            <div className="details-image-wrap">
              <img src={product.image} alt={product.name} className="details-image" />
            </div>

            <div className="details-content">
              <span className="category-badge">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="details-description">{product.description}</p>
              <p className="details-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
              <p className={inStock ? 'stock in-stock' : 'stock out-stock'}>
                {inStock ? `${product.stock} units left in stock` : 'Out of stock'}
              </p>

              {feedback.text && (
                <div className={`details-feedback ${feedback.type}`}>
                  {feedback.text}
                </div>
              )}

              <div className="details-actions">
                <button
                  className="primary"
                  onClick={handleAddToCart}
                  disabled={!inStock || cartLoading}
                >
                  {cartLoading ? 'Adding to Cart...' : inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button
                  className={`secondary-button wishlist-toggle-btn ${wishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? '⏳ Saving...' : wishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
                </button>

                <Link className="secondary-button" to="/products">
                  Back to Products
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
