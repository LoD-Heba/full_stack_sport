// frontend/app/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  address: string;
  companyName?: string;
  taxId?: string;
  role: {
    name: string;
    description: string;
  };
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  products: any[];
}

interface EcommerceOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  ecommerceDetails: any[];
}

export default function UserProfilePage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ecommerceOrders, setEcommerceOrders] = useState<EcommerceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    companyName: '',
    taxId: '',
  });
  const [updateMessage, setUpdateMessage] = useState('');

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cargar datos del usuario y pedidos
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
      loadUserOrders();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          address: data.address,
          companyName: data.companyName || '',
          taxId: data.taxId || '',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserOrders = async () => {
    try {
      const response = await fetch('/api/users/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setEcommerceOrders(data.ecommerceOrders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage('');
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadUserData();
        setIsEditing(false);
        setUpdateMessage('Perfil actualizado correctamente ✓');
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        const error = await response.json();
        setUpdateMessage(`Error: ${error.error || 'No se pudo actualizar'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage('Error al actualizar perfil');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      delivered: 'bg-purple-100 text-purple-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error al cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {user.role.name}
                </span>
                <span className="text-gray-500 text-sm">
                  Miembro desde {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de actualización */}
        {updateMessage && (
          <div className={`mb-6 p-4 rounded-lg ${updateMessage.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {updateMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Información Personal
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Mis Pedidos ({orders.length + ecommerceOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Configuración
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Información Personal */}
            {activeTab === 'profile' && (
              <div>
                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Datos Personales
                      </h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        ✏️ Editar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nombres
                        </label>
                        <p className="text-gray-900 text-lg">{user.firstName}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Apellidos
                        </label>
                        <p className="text-gray-900 text-lg">{user.lastName}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          C.I.
                        </label>
                        <p className="text-gray-900 text-lg">{user.documentNumber}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Teléfono
                        </label>
                        <p className="text-gray-900 text-lg">{user.phone || 'No registrado'}</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Dirección
                        </label>
                        <p className="text-gray-900 text-lg">{user.address}</p>
                      </div>

                      {user.companyName && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Empresa
                            </label>
                            <p className="text-gray-900 text-lg">{user.companyName}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              NIT
                            </label>
                            <p className="text-gray-900 text-lg">{user.taxId}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Editar Perfil
                      </h2>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              phone: user.phone || '',
                              address: user.address,
                              companyName: user.companyName || '',
                              taxId: user.taxId || '',
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateProfile}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          💾 Guardar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombres *
                        </label>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección *
                        </label>
                        <textarea
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          required
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Empresa (opcional)
                        </label>
                        <input
                          type="text"
                          value={editForm.companyName}
                          onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIT (opcional)
                        </label>
                        <input
                          type="text"
                          value={editForm.taxId}
                          onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Pedidos */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Historial de Pedidos
                </h2>

                {orders.length === 0 && ecommerceOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-600 text-lg mb-4">
                      Aún no tienes pedidos
                    </p>
                    <button 
                      onClick={() => router.push('/products')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Explorar productos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...orders, ...ecommerceOrders].map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              Pedido #{('orderNumber' in order) ? order.orderNumber : order.id.slice(0, 8)}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-gray-600 text-sm">Total</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                            Ver detalles →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Configuración de Cuenta
                </h2>

                {/* Cambiar contraseña */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">🔒 Seguridad</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Cambiar contraseña
                  </button>
                </div>

                {/* Notificaciones */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">🔔 Notificaciones</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                      <span className="text-gray-700">Notificaciones de pedidos</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                      <span className="text-gray-700">Ofertas y promociones</span>
                    </label>
                  </div>
                </div>

                {/* Eliminar cuenta */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Zona de peligro</h3>
                  <p className="text-red-700 text-sm mb-4">
                    Una vez eliminada, esta acción no se puede deshacer
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}