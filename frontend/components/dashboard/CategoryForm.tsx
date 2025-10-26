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
      // ✅ Limpiar datos antes de enviar
      // Solo enviar campos que tengan valores válidos
      const dataToSend: any = {
        name: formData.name.trim(),
      };

      // Solo agregar campos opcionales si tienen valor
      if (formData.description && formData.description.trim()) {
        dataToSend.description = formData.description.trim();
      }

      if (formData.slug && formData.slug.trim()) {
        dataToSend.slug = formData.slug.trim();
      }

      if (formData.imageUrl && formData.imageUrl.trim()) {
        dataToSend.imageUrl = formData.imageUrl.trim();
      }

      // Solo incluir isActive si es diferente de true o si estamos actualizando
      if (categoryId || formData.isActive !== true) {
        dataToSend.isActive = formData.isActive;
      }

      console.log('Datos a enviar:', dataToSend); // Para debug

      const method = categoryId ? 'PATCH' : 'POST';
      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Error del servidor:', data); // Para debug
        throw new Error(data.error || data.message || `Error al ${categoryId ? 'actualizar' : 'crear'} la categoría`);
      }

      alert(`Categoría ${categoryId ? 'actualizada' : 'creada'} correctamente`);
      router.push('/dashboard/categories');
      router.refresh();
    } catch (err) {
      console.error('Error completo:', err); // Para debug
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
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Nombre */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Categoría *
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-500 mt-1">
          Mínimo 2, máximo 60 caracteres ({formData.name.length}/60)
        </p>
      </div>

      {/* Slug */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug (URL amigable)
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="ropa-deportiva (opcional, se genera automáticamente)"
          pattern="[a-z0-9\-]*"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-500 mt-1">
          Solo letras minúsculas, números y guiones. Se genera automáticamente del nombre si se deja vacío.
        </p>
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <p className="text-xs text-gray-500 mt-1">
          Debe ser una URL válida (http:// o https://)
        </p>
        
        {/* Preview de imagen */}
        {formData.imageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
            <div className="relative">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="h-48 w-48 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden bg-gray-100 h-48 w-48 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <span className="text-4xl">🖼️</span>
                  <p className="text-sm mt-2">URL inválida</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estado Activo/Inactivo */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              Categoría Activa
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Las categorías inactivas no se mostrarán en la tienda
            </p>
          </div>
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting || !formData.name.trim()}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : (
            `${categoryId ? '💾 Actualizar' : '➕ Crear'} Categoría`
          )}
        </button>
        
        <button
          type="button"
          onClick={() => router.push('/dashboard/categories')}
          disabled={submitting}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition font-medium"
        >
          Cancelar
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Consejo:</strong> Si no especificas un slug, se generará automáticamente 
          a partir del nombre de la categoría.
        </p>
      </div>
    </form>
  );
}