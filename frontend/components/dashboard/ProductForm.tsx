// frontend/components/dashboard/ProductForm.tsx

"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CreateProductDto } from '@/types/product';
import { Category } from '@/types/category';

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!productId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    slug: '',
    price: 0,
    stock: 0,
    isAvailable: true,
    images: [],
    categoryId: '',
  });

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Error al cargar el producto');
      const data: Product = await response.json();
      setFormData({
        name: data.name,
        description: data.description || '',
        slug: data.slug,
        price: data.price,
        stock: data.stock,
        isAvailable: data.isAvailable,
        images: data.images?.map(img => img.url) || [],
        categoryId: data.category.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const urls = e.target.value.split('\n').filter(url => url.trim());
    setFormData(prev => ({
      ...prev,
      images: urls,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const method = productId ? 'PATCH' : 'POST';
      const url = productId ? `/api/products/${productId}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error al ${productId ? 'actualizar' : 'crear'} el producto`);
      }

      alert(`Producto ${productId ? 'actualizado' : 'creado'} correctamente`);
      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Cargando producto...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={200}
            placeholder="Ej: Polera Nike Dri-Fit"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo 2, máximo 200 caracteres</p>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min={0.01}
            step={0.01}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Debe ser mayor a 0</p>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min={0}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">No puede ser negativo</p>
        </div>
      </div>

      {/* Slug */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="polera-nike-dri-fit (Se genera automáticamente si está vacío)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">URL amigable. Se genera automáticamente si está vacío.</p>
      </div>

      {/* Descripción */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          maxLength={500}
          rows={4}
          placeholder="Describe brevemente el producto..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description?.length || 0}/500 caracteres
        </p>
      </div>

      {/* URLs de Imágenes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URLs de Imágenes
        </label>
        <textarea
          value={formData.images?.join('\n') || ''}
          onChange={handleImageChange}
          rows={4}
          placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Una URL por línea</p>

        {formData.images && formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  className="h-24 w-24 object-cover rounded"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disponibilidad */}
      <div className="mt-8">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Producto Disponible</span>
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {submitting ? 'Guardando...' : productId ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/products')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}