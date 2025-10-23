// frontend/app/shop/layout.tsx
"use client";
import { CartProvider } from './cart/CartContext';
import Navbar from '@/components/common/Navbar';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      {children}
    </CartProvider>
  );
}