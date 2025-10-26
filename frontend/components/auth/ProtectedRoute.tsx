// frontend/components/auth/ProtectedRoute.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine de cargar
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Si se requiere un rol específico, validar
    if (requiredRole && user) {
      const userRole = user.role?.toLowerCase();
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole.map((r) => r.toLowerCase())
        : [requiredRole.toLowerCase()];

      if (!allowedRoles.includes(userRole)) {
        // Redirigir a una página de acceso denegado o a home
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene el rol correcto, no mostrar nada
  // (el useEffect se encargará de redirigir)
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user) {
    const userRole = user.role?.toLowerCase();
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole.map((r) => r.toLowerCase())
      : [requiredRole.toLowerCase()];

    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
}