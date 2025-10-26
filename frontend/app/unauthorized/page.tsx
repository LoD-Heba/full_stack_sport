// frontend/app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <span className="text-5xl">🚫</span>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-gray-600 mb-2">
          No tienes permiso para acceder a esta página.
        </p>

        {user && (
          <p className="text-sm text-gray-500 mb-8">
            Tu rol actual es: <span className="font-semibold">{user.role}</span>
          </p>
        )}

        {/* Botones */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Ir al inicio
          </Link>

          <Link
            href="/shop"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Ver tienda
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition"
          >
            ← Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}