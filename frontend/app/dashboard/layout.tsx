// frontend/app/dashboard/layout.tsx

"use client";
import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto p-6">
          {children || (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow p-8 min-h-96">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contenido del Dashboard
                </h2>
                <p className="text-gray-600">
                  Selecciona una opción del menú lateral para comenzar.
                </p>

                {/* Stats Grid Example */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Usuarios</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          1,234
                        </p>
                      </div>
                      <span className="text-4xl opacity-20">👥</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Productos</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          567
                        </p>
                      </div>
                      <span className="text-4xl opacity-20">📦</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Órdenes</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          89
                        </p>
                      </div>
                      <span className="text-4xl opacity-20">🛒</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Ingresos</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          $12,345
                        </p>
                      </div>
                      <span className="text-4xl opacity-20">💰</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}