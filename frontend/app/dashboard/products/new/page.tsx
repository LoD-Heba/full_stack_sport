// frontend/app/dashboard/products/new/page.tsx

"use client";
import ProductForm from '@/components/dashboard/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600 mt-1">Completa el formulario para crear un nuevo producto</p>
      </div>

      <ProductForm />
    </div>
  );
}