export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex shrink-0">
            <span className="text-2xl font-bold text-black">SportStore</span>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-700 hover:text-black">
              Inicio
            </a>
            <a href="/products" className="text-gray-700 hover:text-black">
              Productos
            </a>
            <a href="/categories" className="text-gray-700 hover:text-black">
              Categorías
            </a>
            <a href="/about" className="text-gray-700 hover:text-black">
              Nosotros
            </a>
          </div>

          {/* Auth & Cart Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/auth/login"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Iniciar Sesión
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Registrarse
            </a>
            <a href="/cart" className="relative">
              <button className="text-gray-700 hover:text-black">🛒</button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <a href="/cart" className="text-gray-700">
              🛒
            </a>
            <button className="text-gray-700">☰</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
