"use client";
import { useState, ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Usuarios", href: "/dashboard/users", icon: "👥" },
    { label: "Roles", href: "/dashboard/roles", icon: "🔐" },
    { label: "Productos", href: "/dashboard/products", icon: "📦" },
    { label: "Categorías", href: "/dashboard/categories", icon: "🏷️" },
    { label: "Órdenes", href: "/dashboard/orders", icon: "🛒" },
    { label: "Reportes", href: "/dashboard/reports", icon: "📈" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          {sidebarOpen && <span className="text-xl font-bold">SportAdmin</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded transition"
            title={sidebarOpen ? "Cerrar" : "Abrir"}
          >
            ☰
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition group"
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="text-xl flex shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium group-hover:text-white">
                  {item.label}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-red-400 hover:text-red-300"
            title={!sidebarOpen ? "Cerrar Sesión" : ""}
          >
            <span className="text-xl flex shrink-0">🚪</span>
            {sidebarOpen && (
              <span className="text-sm font-medium">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
          {/* Left: Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Bienvenido de vuelta</p>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
              🔔
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition">
              ⚙️
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600">👤</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto p-6">
          {/* Placeholder Content */}
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
                  {[
                    { label: "Total Usuarios", value: "1,234", icon: "👥" },
                    { label: "Productos", value: "567", icon: "📦" },
                    { label: "Órdenes", value: "89", icon: "🛒" },
                    { label: "Ingresos", value: "$12,345", icon: "💰" },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stat.value}
                          </p>
                        </div>
                        <span className="text-4xl opacity-20">{stat.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
