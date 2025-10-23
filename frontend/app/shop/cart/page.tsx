// frontend/app/shop/cart/page.tsx
"use client";
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos para comenzar tu compra
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Ir a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Carrito de Compras
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-6 border-b last:border-b-0"
                >
                  {/* Imagen */}
                  <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Precio: <span className="font-medium">Bs{item.price}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock disponible: {item.stock}
                    </p>
                  </div>

                  {/* Cantidad y acciones */}
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Eliminar
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        min={1}
                        max={item.stock}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-900">
                      Bs{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumen de Compra
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>Bs{cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Bs0.00</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span className="text-green-600">Bs{cart.total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => router.push('/shop/checkout')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mb-3"
              >
                Proceder al Pago
              </button>

              <Link
                href="/shop"
                className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-center"
              >
                Seguir Comprando
              </Link>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Pago seguro • 🚚 Envío gratis en compras mayores a Bs100
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}