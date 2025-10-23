// frontend/components/dashboard/CategoryForm.tsx

"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, CreateCategoryDto } from '@/types/category';

interface CategoryFormProps {
  categoryId?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!categoryId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    slug: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    }
  }, [categoryId]);

  const fetchCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`);
      if (!response.ok) throw new Error('Error al cargar la categoría');
      const data: Category = await response.json();
      setFormData({
        name: data.name,
        description: data.description || '',
        slug: data.slug,
        imageUrl: data.imageUrl || '',
        isActive: data.isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const method = categoryId ? 'PATCH' : 'POST';
      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error al ${categoryId ? 'actualizar' : 'crear'} la categoría`);
      }

      alert(`Categoría ${categoryId ? 'actualizada' : 'creada'} correctamente`);
      router.push('/dashboard/categories');
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
        <p className="text-gray-600 mt-4">Cargando categoría...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Nombre */}
      <div className="mb-6">
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
          maxLength={60}
          placeholder="Ej: Ropa Deportiva"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Mínimo 2, máximo 60 caracteres</p>
      </div>

      {/* Slug */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="ej-ropa-deportiva (Se genera automáticamente si está vacío)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">URL amigable. Se genera automáticamente si está vacío.</p>
      </div>

      {/* Descripción */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          maxLength={500}
          rows={4}
          placeholder="Describe brevemente la categoría..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.description?.length || 0}/500 caracteres
        </p>
      </div>

      {/* URL de Imagen */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de Imagen
        </label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {formData.imageUrl && (
          <div className="mt-3">
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="h-32 w-32 object-cover rounded"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      {/* Estado */}
      <div className="mb-8">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Categoría Activa</span>
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {submitting ? 'Guardando...' : categoryId ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/categories')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}