"use client";
import { CartProvider } from "@/context/CartContext";
import ShopNavbar from "@/components/shop/ShopNavbar";
import Footer from "@/components/common/Footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <ShopNavbar />
        <main className="flex grow">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}