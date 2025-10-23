// frontend/app/shop/products/[id]/page.tsx

"use client";
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Producto no encontrado');
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url,
    });

    setSuccessMessage(`✅ ${product.name} agregado al carrito`);
    setTimeout(() => setSuccessMessage(''), 3000);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/cart');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg mb-4">{error || 'Producto no encontrado'}</p>
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

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-8">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imágenes */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              {images.length > 0 ? (
                <div>
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-4">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-16 h-16 rounded border-2 transition ${
                            currentImageIndex === idx
                              ? 'border-blue-600'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`${product.name} ${idx}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Categoría */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {product.category.name}
              </span>
            </div>

            {/* Nombre */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Slug */}
            <code className="text-sm text-gray-500 mb-4 block">
              {product.slug}
            </code>

            {/* Descripción */}
            {product.description && (
              <p className="text-gray-600 text-lg mb-6">
                {product.description}
              </p>
            )}

            {/* Precio */}
            <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
              <p className="text-gray-600 text-sm mb-2">Precio</p>
              <p className="text-4xl font-bold text-blue-600">
                Bs{product.price.toFixed(2)}
              </p>
            </div>

            {/* Stock */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className={`text-sm font-medium ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `✅ ${product.stock} en stock` : '❌ Sin stock'}
              </p>
            </div>

            {/* Disponibilidad */}
            <div className="mb-6">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                product.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.isAvailable ? '✅ Disponible' : '❌ No disponible'}
              </span>
            </div>

            {/* Cantidad */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), product.stock));
                  }}
                  className="flex-1 text-center border-0 outline-none"
                  min={1}
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={!product.isAvailable || product.stock === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
              >
                Comprar Ahora
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stock === 0}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 transition font-medium"
              >
                Agregar al Carrito
              </button>
            </div>

            {/* Info Adicional */}
            <div className="mt-8 pt-8 border-t">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-semibold text-gray-900">Envío Gratis</p>
                    <p className="text-sm text-gray-600">En compras mayores a Bs100</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="font-semibold text-gray-900">Devoluciones Fáciles</p>
                    <p className="text-sm text-gray-600">30 días de garantía</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-semibold text-gray-900">Múltiples Pagos</p>
                    <p className="text-sm text-gray-600">Transferencia o efectivo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}