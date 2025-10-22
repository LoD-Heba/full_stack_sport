// frontend/components/dashboard/DashboardHeader.tsx
"use client";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  notificationCount?: number;
}

export default function DashboardHeader({
  title = "Dashboard",
  subtitle = "Bienvenido de vuelta",
  userName = "Admin User",
  userRole = "Administrador",
  notificationCount = 0,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
      {/* Left: Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
          🔔
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
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
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}