// frontend/app/shop/page.tsx

"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import ProductCard from '@/components/shop/ProductCard';

export default function ShopHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (productsRes.ok && categoriesRes.ok) {
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData.slice(0, 8)); // 8 productos destacados
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            SportStore
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
            Encuentra todo lo que necesitas para tu entrenamiento. Ropa deportiva, calzado y accesorios de las mejores marcas.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Explorar Catálogo
          </Link>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Categorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-lg p-8 h-48 flex flex-col items-center justify-center text-center group-hover:shadow-lg transition">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-24 w-24 object-cover rounded-full mb-4"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {category.description?.slice(0, 50)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Productos Destacados</h2>
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
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Necesitas más productos?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Explora nuestro catálogo completo y encuentra todo lo que buscas
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Ver Catálogo Completo
          </Link>
        </div>
      </section>
    </div>
  );
}