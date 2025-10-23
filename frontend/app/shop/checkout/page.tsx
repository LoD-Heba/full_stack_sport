// frontend/app/shop/checkout/page.tsx

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/shop/cart/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [formData, setFormData] = useState({
    nameClient: '',
    nameCompany: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    // Verificar si está autenticado
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      setError('Debes iniciar sesión para continuar');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    setToken(storedToken);

    // Obtener datos del cliente
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setClientData(user);
      setFormData(prev => ({
        ...prev,
        nameClient: `${user.firstName} ${user.lastName}`,
      }));
    }
  }, [router]);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-12 text-center max-w-md">
          <p className="text-xl text-gray-900 mb-4">Tu carrito está vacío</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token || !clientData) {
        throw new Error('Información de autenticación faltante');
      }

      const orderData = {
        clientId: clientData.id,
        nameClient: formData.nameClient,
        nameCompany: formData.nameCompany || undefined,
        userId: clientData.id,
        ecommerceDetail: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/ecommerce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la orden');
      }

      const order = await response.json();
      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de Envío</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nameClient"
                    value={formData.nameClient}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    name="nameCompany"
                    value={formData.nameCompany}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Teléfono */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Método de Pago */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      defaultChecked
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Transferencia Bancaria</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Efectivo al Entrega</span>
                  </label>
                </div>
              </div>

              {/* Términos */}
              <label className="flex items-start mb-8">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Acepto los términos y condiciones de compra
                </span>
              </label>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          </div>

          {/* Resumen de Orden */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen del Pedido</h3>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      Bs{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Bs{cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Bs0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>Total</span>
                  <span className="text-green-600">Bs{cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Nota */}
              <p className="text-xs text-gray-500 text-center">
                Recibirás un email de confirmación después de completar tu pedido
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}