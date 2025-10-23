
"use client";
import { use } from 'react';
import CategoryForm from '@/components/dashboard/CategoryForm';

export default function EditCategoryPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Categoría</h1>
        <p className="text-gray-600 mt-1">Actualiza la información de la categoría</p>
      </div>

      <CategoryForm categoryId={id} />
    </div>
  );
}