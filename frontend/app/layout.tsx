// frontend/app/layout.tsx
"use client";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./shop/cart/CartContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}