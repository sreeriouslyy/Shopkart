import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const inStock = product.stock > 0;
  const wishlisted = isInWishlist(product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (wishlistLoading) return;

    setWishlistLoading(true);
    setFeedback('');
    try {
      if (wishlisted) {
        const res = await removeFromWishlist(product._id);
        if (!res.success && res.status === 401) {
          navigate('/login');
        }
      } else {
        const res = await addToWishlist(product._id);
        if (!res.success) {
          if (res.status === 401) navigate('/login');
          else setFeedback(res.message || 'Could not add to wishlist');
        }
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!inStock || cartLoading) return;

    setCartLoading(true);
    setFeedback('');
    try {
      const res = await addToCart(product._id);
      if (!res.success) {
        if (res.status === 401) {
          navigate('/login');
        } else {
          setFeedback(res.message || 'Could not add to cart');
        }
      } else {
        setFeedback('Added to cart!');
        setTimeout(() => setFeedback(''), 2500);
      }
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`wishlist-corner-btn ${wishlisted ? 'active' : ''}`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {wishlistLoading ? '⏳' : wishlisted ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-card-body">
        <span className="category-badge">{product.category}</span>
        <h3 className="product-title" title={product.name}>{product.name}</h3>
        <p className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
        <p className={inStock ? 'stock in-stock' : 'stock out-stock'}>
          {inStock ? `${product.stock} units left` : 'Out of stock'}
        </p>

        {feedback && <div className="card-feedback">{feedback}</div>}

        <div className="card-actions">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || cartLoading}
            className="primary add-to-cart-btn"
          >
            {cartLoading ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <Link className="secondary-button details-btn" to={`/products/${product._id}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
