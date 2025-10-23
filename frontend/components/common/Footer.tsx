// frontend/components/common/Footer.tsx

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SportStore</h3>
            <p className="text-gray-400 text-sm">
              Tu tienda de ropa deportiva de confianza. Productos de calidad para tu estilo de vida activo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white text-sm transition">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/shop" className="text-gray-400 hover:text-white text-sm transition">
                  Tienda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Ropa Deportiva
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Calzado
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Accesorios
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <p className="text-gray-400 text-sm mb-2">
              📧 info@sportstore.com
            </p>
            <p className="text-gray-400 text-sm mb-2">
              📱 +591 70123456
            </p>
            <p className="text-gray-400 text-sm">
              📍 Cochabamba, Bolivia
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} SportStore. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Términos
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}