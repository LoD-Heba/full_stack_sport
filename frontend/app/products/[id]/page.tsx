// frontend/app/products/[id]/page.tsx
"use client";
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { useCart } from '@/app/shop/cart/CartContext';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

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
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
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

    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        image: product.images?.[0]?.url,
      });
    }

    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
            <p className="text-xl text-gray-900 mb-4">{error || 'Producto no encontrado'}</p>
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-blue-600">Inicio</a>
          <span className="mx-2">/</span>
          <a href="/shop" className="hover:text-blue-600">Tienda</a>
          <span className="mx-2">/</span>
          <a href={`/shop?category=${product.category.id}`} className="hover:text-blue-600">
            {product.category.name}
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Imágenes */}
            <div>
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`bg-gray-100 rounded overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información */}
            <div>
              {/* Categoría */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                  {product.category.name}
                </span>
              </div>

              {/* Nombre */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Precio */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-blue-600">
                  Bs{product.price}
                </p>
              </div>

              {/* Stock y Disponibilidad */}
              <div className="mb-6 space-y-2">
                <p className={`text-sm font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `✅ ${product.stock} unidades disponibles` : '❌ Sin stock'}
                </p>
                <p className={`text-sm font-medium ${
                  product.isAvailable ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {product.isAvailable ? '✅ Producto disponible' : '⚠️ Producto no disponible'}
                </p>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Selector de Cantidad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300 transition font-semibold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={product.stock}
                    className="w-20 text-center border border-gray-300 rounded px-3 py-2 font-semibold"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || product.stock === 0}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                    showAddedMessage
                      ? 'bg-green-600 text-white'
                      : product.isAvailable && product.stock > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {showAddedMessage ? '✅ Agregado al carrito' : '🛒 Agregar al carrito'}
                </button>

                <button
                  onClick={() => router.push('/shop/cart')}
                  className="w-full py-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Ver Carrito
                </button>
              </div>

              {/* Información adicional */}
              <div className="mt-8 pt-8 border-t">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>🚚 Envío gratis en compras mayores a Bs100</p>
                  <p>🔄 30 días de garantía de devolución</p>
                  <p>💳 Pago seguro y protegido</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}