// frontend/components/dashboard/RoleForm.tsx
"use client";
import { useState, useEffect } from 'react';
import { CreateRoleDto } from '@/types/role';
import { useRouter } from 'next/navigation';

interface RoleFormProps {
  roleId?: string;
  onSuccess?: () => void;
}

export default function RoleForm({ roleId, onSuccess }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (roleId) fetchRole();
  }, [roleId]);

  const fetchRole = async () => {
    if (!roleId) return;
    try {
      const response = await fetch(`/api/roles/${roleId}`);
      if (response.ok) {
        const role = await response.json();
        setFormData({
          name: role.name,
          description: role.description || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar rol:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = roleId ? `/api/roles/${roleId}` : '/api/roles';
      const method = roleId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar rol');
      }

      alert(roleId ? 'Rol actualizado correctamente' : 'Rol creado correctamente');
      if (onSuccess) onSuccess();
      router.push('/dashboard/roles');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Rol *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
            pattern="^[a-zA-Z0-9_-]+$"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="admin, vendedor, cliente"
          />
          <p className="text-xs text-gray-500 mt-1">
            Solo letras, números, guiones y guiones bajos (3-50 caracteres)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción del rol y sus permisos..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo 1000 caracteres
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Guardando...' : roleId ? 'Actualizar Rol' : 'Crear Rol'}
        </button>
        <a
          href="/dashboard/roles"
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}