export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SportStore</h3>
            <p className="text-gray-400 text-sm">
              Tu tienda de ropa deportiva de confianza. Calidad garantizada.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white text-sm">
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Productos
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/categories/ropa"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Ropa Deportiva
                </a>
              </li>
              <li>
                <a
                  href="/categories/calzado"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Calzado
                </a>
              </li>
              <li>
                <a
                  href="/categories/accesorios"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Accesorios
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <p className="text-gray-400 text-sm mb-2">📧 info@sportstore.com</p>
            <p className="text-gray-400 text-sm">📱 +591 70123456</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SportStore. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Términos
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
