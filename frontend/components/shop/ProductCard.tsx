// frontend/components/shop/ProductCard.tsx
"use client";
import Link from 'next/link';
import { Product } from '@/types/product';
import { useState } from 'react';
import { useCart } from '@/app/shop/cart/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.images?.[0]?.url,
    });

    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden group">
        {/* Imagen */}
        <div className="relative bg-gray-100 h-48 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition"
              onError={(e) => {
                e.currentTarget.src = '#';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}

          {/* Badge */}
          {!product.isAvailable && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              No disponible
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Sin stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Categoría */}
          <div className="mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {product.category.name}
            </span>
          </div>

          {/* Nombre */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
            {product.name}
          </h3>

          {/* Descripción */}
          {product.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Precio */}
          <div className="mb-4">
            <p className="text-lg font-bold text-blue-600">
              Bs{product.price}
            </p>
          </div>

          {/* Stock Indicador */}
          <div className="mb-4">
            <p className={`text-xs font-medium ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
            </p>
          </div>

          {/* Botón Agregar */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stock === 0}
            className={`w-full py-2 rounded font-medium transition text-sm ${
              showAddedMessage
                ? 'bg-green-600 text-white'
                : product.isAvailable && product.stock > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {showAddedMessage ? '✅ Agregado al carrito' : '🛒 Agregar al carrito'}
          </button>
        </div>
      </div>
    </Link>
  );
}