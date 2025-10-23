
"use client";
import dynamic from 'next/dynamic';
import Footer from "@/components/common/Footer";

// Deshabilitar SSR para ShopNavbar porque usa CartContext que depende de localStorage
const ShopNavbar = dynamic(() => import('@/components/shop/ShopNavbar'), {
  ssr: false,
});

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ShopNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}