// frontend/components/shop/ShopNavbar.tsx

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ShopNavbar() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar usuario del localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    router.push('/');
  };

  const cartItems = getTotalItems();

  if (!isLoaded) {
    return null; // Evita problemas de hidratación
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">SportStore</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-700 hover:text-gray-900 font-medium">
              Productos
            </Link>
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              Inicio
            </Link>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
              Nosotros
            </a>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Carrito */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition"
              title="Carrito"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartItems > 9 ? '9+' : cartItems}
                </span>
              )}
            </Link>

            {/* Usuario */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <Link
                      href="/shop/my-orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📋 Mis Órdenes
                    </Link>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ⚙️ Mi Perfil
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {/* Carrito Mobile */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-gray-900"
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
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/products"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              Productos
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Nosotros
            </a>
            <div className="border-t pt-2">
              {user ? (
                <>
                  <Link
                    href="/shop/my-orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    📋 Mis Órdenes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded text-sm"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-2 bg-blue-600 text-white rounded text-sm mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}