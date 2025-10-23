// frontend/context/CartContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Cart } from '@/types/cart';

interface CartContextType {
  cart: Cart;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
    }
    setIsLoaded(true);
  }, []);

  // Guardar carrito en localStorage
  const saveCart = (newCart: Cart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addToCart = (newItem: CartItem) => {
    const existingItem = cart.items.find(item => item.productId === newItem.productId);

    if (existingItem) {
      const updatedItems = cart.items.map(item =>
        item.productId === newItem.productId
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );
      const newCart = {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
      saveCart(newCart);
    } else {
      const updatedItems = [...cart.items, newItem];
      const newCart = {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
      saveCart(newCart);
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    const newCart = {
      items: updatedItems,
      total: calculateTotal(updatedItems),
    };
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = cart.items.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );
    const newCart = {
      items: updatedItems,
      total: calculateTotal(updatedItems),
    };
    saveCart(newCart);
  };

  const clearCart = () => {
    const newCart = { items: [], total: 0 };
    saveCart(newCart);
  };

  const getTotalItems = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.total;
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
}