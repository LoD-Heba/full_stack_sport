// frontend/app/page.tsx

"use client";
import { useEffect, useState } from 'react';
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (productsRes.ok && categoriesRes.ok) {
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData.slice(0, 8)); // 8 productos destacados
        setCategories(categoriesData.slice(0, 3)); // 3 categorías destacadas
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      console.log("first")
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bienvenido a SportStore
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Encuentra todo lo que necesitas para tu entrenamiento. Ropa deportiva, 
                calzado y accesorios de las mejores marcas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold text-center"
                >
                  Explorar Productos
                </Link>
                <Link
                  href="/shop"
                  className="inline-block px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-900 transition font-semibold text-center border-2 border-white"
                >
                  Ver Tienda
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Categorías Destacadas</h2>
                <Link
                  href="/products"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition">
                      {category.imageUrl ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Productos Destacados</h2>
                <p className="text-gray-600 mt-2">Los más populares de nuestra tienda</p>
              </div>
              <Link
                href="/products"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Ver Todo →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Cargando productos...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg">No hay productos disponibles por el momento</p>
                <Link
                  href="/dashboard/products"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Agregar Productos
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🚚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Envío Gratis</h3>
                <p className="text-gray-600">En compras mayores a Bs100</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Devoluciones Fáciles</h3>
                <p className="text-gray-600">30 días de garantía</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pagos Seguros</h3>
                <p className="text-gray-600">Múltiples métodos de pago</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Explora nuestro catálogo completo y encuentra todo lo que necesitas para tu entrenamiento
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Ver Catálogo Completo
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}