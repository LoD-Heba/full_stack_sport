// frontend/app/shop/order-confirmation/[id]/page.tsx

"use client";
import { use } from 'react';
import Link from 'next/link';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-12 max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
        <p className="text-gray-600 mb-2">Tu orden ha sido recibida correctamente</p>
        <p className="text-sm text-gray-500 mb-8">
          Número de Orden: <span className="font-mono font-semibold">#{id.slice(0, 8)}</span>
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            📧 Hemos enviado un email de confirmación con los detalles de tu pedido
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/shop/my-orders"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Ver Mis Órdenes
          </Link>
          <Link
            href="/products"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Continuar Comprando
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-gray-500">
            Tiempo estimado de entrega: 3-5 días hábiles
          </p>
        </div>
      </div>
    </div>
  );
}