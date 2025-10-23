"use client";
import { useState } from 'react';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  menuItems?: MenuItem[];
}

export default function Sidebar({ menuItems: customMenuItems }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const defaultMenuItems: MenuItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Usuarios", href: "/dashboard/users", icon: "👥" },
    { label: "Roles", href: "/dashboard/roles", icon: "🔐" },
    { label: "Productos", href: "/dashboard/products", icon: "📦" },
    { label: "Categorías", href: "/dashboard/categories", icon: "🏷️" },
    { label: "Ventas", href: "/dashboard/sales", icon: "💰" },
    { label: "Órdenes", href: "/dashboard/orders", icon: "🛒" },
  ];

  const menuItems = customMenuItems || defaultMenuItems;

  return (
    <>
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
          <a
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
            href="/"
          >
            <span className="text-xl flex shrink-0">🚪</span>
            {sidebarOpen && (
              <span className="text-sm font-medium">Salir</span>
            )}
          </a>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}