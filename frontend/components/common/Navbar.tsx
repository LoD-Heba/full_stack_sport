// frontend/components/common/Navbar.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from '@/app/shop/cart/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex shrink-0">
            <span className="text-2xl font-bold text-blue-600">SportStore</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Tienda
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 font-medium transition flex items-center gap-1"
            >
              <span>📊</span> Dashboard
            </Link>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Categorías
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Nosotros
            </a>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Carrito */}
            <Link
              href="/shop/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition"
            >
              <span className="text-2xl">🛒</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            {/* Carrito Mobile */}
            <Link
              href="/shop/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900"
            >
              <span className="text-xl">🛒</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-gray-900"
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/shop"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Tienda
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              📊 Dashboard
            </Link>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Categorías
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Nosotros
            </a>
            <div className="border-t pt-2">
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="block px-4 py-2 bg-blue-600 text-white rounded text-sm mt-2"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}