import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, loading, error, removeFromWishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (product) => {
    await addToCart(product._id);
    await removeFromWishlist(product._id);
  };

  return (
    <>
      <Navbar />
      <main className="wishlist-page">
        <div className="page-header">
          <div>
            <p className="tag">SAVED ITEMS</p>
            <h1>My Wishlist</h1>
            <p>{wishlistItems.length} {wishlistItems.length === 1 ? 'product' : 'products'} saved</p>
          </div>
          <Link className="secondary-button" to="/products">
            Browse More Products
          </Link>
        </div>

        {loading && (
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-card error">
            <h3>Unable to load wishlist</h3>
            <p>{error}</p>
            <button className="primary" onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlistItems.length === 0 && (
          <div className="state-card empty-wishlist">
            <div className="empty-heart-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <button className="primary" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && wishlistItems.length > 0 && (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => {
              const inStock = product.stock > 0;
              return (
                <article key={product._id} className="wishlist-card">
                  <div className="wishlist-image-wrap">
                    <img src={product.image} alt={product.name} className="wishlist-image" />
                    <span className="category-badge corner">{product.category}</span>
                  </div>

                  <div className="wishlist-card-content">
                    <h3>{product.name}</h3>
                    <p className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
                    <p className={inStock ? 'stock in-stock' : 'stock out-stock'}>
                      {inStock ? `${product.stock} units left` : 'Out of stock'}
                    </p>

                    <div className="wishlist-actions">
                      <button
                        className="primary move-cart-btn"
                        disabled={!inStock}
                        onClick={() => handleMoveToCart(product)}
                      >
                        {inStock ? 'Move to Cart' : 'Out of Stock'}
                      </button>

                      <div className="wishlist-sub-actions">
                        <Link className="secondary-button" to={`/products/${product._id}`}>
                          View Details
                        </Link>
                        <button
                          className="danger-btn"
                          onClick={() => removeFromWishlist(product._id)}
                          title="Remove from Wishlist"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
