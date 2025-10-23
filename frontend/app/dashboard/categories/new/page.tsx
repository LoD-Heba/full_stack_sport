"use client";
import CategoryForm from '@/components/dashboard/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Categoría</h1>
        <p className="text-gray-600 mt-1">Completa el formulario para crear una nueva categoría</p>
      </div>

      <CategoryForm />
    </div>
  );
}
