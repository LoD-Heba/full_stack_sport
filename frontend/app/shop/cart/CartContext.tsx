// frontend/app/shop/cart/CartContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

interface CartContextType {
  cart: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito desde localStorage al inicio
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setItems([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Guardar carrito en localStorage cuando cambie (solo después de inicializar)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        // Verificar stock antes de incrementar
        if (existing.quantity < item.stock) {
          return prev.map(i =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        // No agregar si excede el stock
        alert(`Solo hay ${item.stock} unidades disponibles`);
        return prev;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.productId === productId) {
          // No exceder el stock disponible
          const newQuantity = Math.min(quantity, i.stock);
          if (newQuantity < quantity) {
            alert(`Solo hay ${i.stock} unidades disponibles`);
          }
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  // Asegurar que items es siempre un array
  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = safeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: { items: safeItems, total, itemCount },
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}