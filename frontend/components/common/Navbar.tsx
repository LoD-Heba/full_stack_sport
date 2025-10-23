"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex shrink-0">
            <span className="text-2xl font-bold text-blue-600">SportStore</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 font-medium">
              Tienda
            </Link>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
              Categorías
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
              Nosotros
            </a>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
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
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
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
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Categorías
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
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
