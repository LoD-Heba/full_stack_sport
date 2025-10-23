// frontend/app/dashboard/products/[id]/page.tsx

"use client";
import { use } from 'react';
import ProductForm from '@/components/dashboard/ProductForm';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-1">Actualiza la información del producto</p>
      </div>

      <ProductForm productId={id} />
    </div>
  );
}