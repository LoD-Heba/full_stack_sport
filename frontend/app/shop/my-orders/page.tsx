// frontend/app/shop/my-orders/page.tsx

"use client";
import { useEffect, useState } from 'react';
import { Ecommerce } from '@/types/ecommerce';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Ecommerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Obtener token del localStorage
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
    
    if (storedToken) {
      fetchMyOrders(storedToken);
    } else {
      setError('Debes iniciar sesión para ver tus órdenes');
      setLoading(false);
    }
  }, []);

  const fetchMyOrders = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ecommerce/my-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar tus órdenes');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (orderId: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/ecommerce-report-pdf/factura/${orderId}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Vendido':
        return 'bg-green-100 text-green-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
        <p className="text-gray-600 mt-1">Historial de compras en la tienda</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Cargando tus órdenes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Aún no tienes órdenes</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Orden ID</p>
                    <p className="text-sm font-semibold text-gray-900">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="text-sm font-semibold text-green-600">
                      Bs{order.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estado</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      📥 Descargar
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {order.ecommerceDetail.map((detail) => (
                      <div key={detail.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {detail.product.name} x {detail.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          Bs{detail.subTotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}