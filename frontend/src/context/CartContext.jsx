import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const TAX_RATE = 0.08; // 8% Tax

  useEffect(() => {
    const storedCart = localStorage.getItem('cafe_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cafe_cart', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updatedItems = [...cartItems];

    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({ product, quantity });
    }
    
    saveCart(updatedItems);
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => item.product.id !== productId);
    saveCart(updatedItems);
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedItems = cartItems.map(item => 
      item.product.id === productId ? { ...item, quantity: qty } : item
    );
    saveCart(updatedItems);
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    setDiscountCode(cleanCode);
    if (cleanCode === 'COFFEE20') {
      setDiscountPercent(0.20); // 20% off
      return { success: true, message: 'Coupon applied: 20% discount!' };
    }
    setDiscountPercent(0);
    return { success: false, message: 'Invalid coupon code.' };
  };

  const clearCart = () => {
    saveCart([]);
    setDiscountCode('');
    setDiscountPercent(0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    return getSubtotal() * discountPercent;
  };

  const getTaxAmount = () => {
    const taxableAmount = getSubtotal() - getDiscountAmount();
    return Math.max(0, taxableAmount * TAX_RATE);
  };

  const getTotal = () => {
    const total = getSubtotal() - getDiscountAmount() + getTaxAmount();
    return Math.max(0, total);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      discountCode,
      discountPercent,
      TAX_RATE,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      clearCart,
      getSubtotal,
      getDiscountAmount,
      getTaxAmount,
      getTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
