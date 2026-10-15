import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/wishlist');
      if (response.data?.success) {
        setWishlistItems(response.data.wishlist || []);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load wishlist');
      }
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item._id === productId || item === productId
    );
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await api.post(`/wishlist/${productId}`);
      if (response.data?.success) {
        await fetchWishlist();
        return { success: true };
      }
      return { success: false, message: response.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to wishlist';
      return { success: false, message, status: err.response?.status };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      if (response.data?.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item._id !== productId && item !== productId)
        );
        return { success: true };
      }
      return { success: false, message: response.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove from wishlist';
      return { success: false, message };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        error,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
