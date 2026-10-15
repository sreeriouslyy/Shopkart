import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/cart');
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
      }
    } catch (err) {
      // 401 means not logged in yet, which is normal on public/login pages
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const response = await api.post(`/cart/${productId}`);
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Could not add to cart' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add product to cart';
      return { success: false, message, status: err.response?.status };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity });
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
        return { success: true };
      }
      return { success: false, message: response.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data?.success) {
        setCartItems(response.data.cart || []);
        return { success: true };
      }
      return { success: false, message: response.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove product';
      return { success: false, message };
    }
  };

  const clearCartState = () => {
    setCartItems([]);
  };

  // Derived values as specified in Lab 05 rubric
  const totalUnits = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * (item.quantity || 0));
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalUnits,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
