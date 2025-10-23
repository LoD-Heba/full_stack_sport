// frontend/app/dashboard/products/page.tsx

"use client";
import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar producto');
      }

      setProducts(products.filter(p => p.id !== id));
      alert('Producto eliminado correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Gestiona el inventario de productos</p>
        </div>
        <a
          href="/dashboard/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Nuevo Producto
        </a>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Cargando productos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibilidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover mr-3"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <code className="text-xs text-gray-500">{product.slug}</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {product.price} bs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/dashboard/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </a>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || selectedCategory ? 'No hay productos que coincidan' : 'No hay productos registrados'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}