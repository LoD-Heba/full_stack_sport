// frontend/components/profile/OrderDetailModal.tsx
"use client";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

interface EcommerceDetail {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    description?: string;
  };
}

interface Order {
  id: string;
  orderNumber?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  products?: Product[];
  ecommerceDetails?: EcommerceDetail[];
}

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      delivered: 'bg-purple-100 text-purple-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'En Proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      delivered: 'Entregado',
    };
    return texts[status.toLowerCase()] || status;
  };

  // Determinar si es un pedido regular o de ecommerce
  const isEcommerceOrder = 'ecommerceDetails' in order && order.ecommerceDetails;
  const items = (isEcommerceOrder 
    ? order.ecommerceDetails 
    : order.products) ?? [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Pedido #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-blue-100">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Estado */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Pedido
            </label>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Productos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📦 Productos ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item: any, index: number) => {
                const name = isEcommerceOrder ? item.product.name : item.name;
                const price = isEcommerceOrder ? item.price : item.price;
                const quantity = isEcommerceOrder ? item.quantity : (item.quantity || 1);
                const subtotal = price * quantity;

                return (
                  <div key={item.id || index} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{name}</h4>
                      {isEcommerceOrder && item.product.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Cantidad: {quantity}</span>
                        <span>•</span>
                        <span>Precio unitario: {formatCurrency(price)}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA (13%)</span>
                <span>{formatCurrency(order.totalAmount * 0.13)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount * 1.13)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              📄 Descargar Factura
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              💬 Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}