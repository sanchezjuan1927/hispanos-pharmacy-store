'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations } from '../lib/translations';

const StoreContext = createContext(null);

const CART_KEY = 'hp-cart';

export function StoreProvider({ children }) {
  const [lang, setLang] = useState('es');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const t = translations[lang];

  // Restore the cart after a reload — an accidental back or refresh
  // shouldn't cost someone their whole order. Read after mount so the
  // server and first client render still match.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // Private mode or blocked storage — start with an empty cart.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Not being able to persist must never break checkout.
    }
  }, [cart]);

  // Keep the document language in step with the toggle, for screen readers.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty } : item))
    );
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <StoreContext.Provider
      value={{
        lang,
        t,
        toggleLang,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        cartTotal,
        cartCount,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
