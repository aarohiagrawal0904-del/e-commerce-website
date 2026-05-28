import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Automatically fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  // Fetch cart items from DB
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err.customMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, error: 'Please log in to add items to your cart' };
    }
    
    setLoading(true);
    try {
      const res = await api.post('/api/cart', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.customMessage || 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/cart/${productId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.customMessage || 'Failed to update quantity' };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/cart/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.customMessage || 'Failed to remove product' };
    } finally {
      setLoading(false);
    }
  };

  // Clear user cart
  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await api.delete('/api/cart');
      if (res.data.success) {
        setCart([]);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.customMessage || 'Failed to clear cart' };
    } finally {
      setLoading(false);
    }
  };

  // Helper calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cart.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
