// frontend/app/page.tsx

import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <section className="mb-16">
            <div className="bg-linear-to-r from-gray-100 to-gray-200 rounded-lg p-12 md:p-20">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Bienvenido a SportStore
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl">
                Encuentra todo lo que necesitas para tu entrenamiento. Ropa deportiva, calzado y accesorios de las mejores marcas.
              </p>
              <a
                href="/products"
                className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Ver Productos
              </a>
            </div>
          </section>

          {/* Categories Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8">Categorías Destacadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-100 rounded-lg p-6 h-48 flex items-center justify-center hover:shadow-lg transition">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">Categoría {item}</p>
                    <p className="text-sm text-gray-500">Ver más</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8">Productos Destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="bg-gray-100 h-48 flex items-center justify-center">
                    <span className="text-gray-400">Imagen Producto</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Producto {item}</h3>
                    <p className="text-sm text-gray-600 mb-3">Descripción corta del producto</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-black">$XX.XX</span>
                      <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition">
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}