// frontend/app/layout.tsx
"use client";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./shop/cart/CartContext";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}