// frontend/app/dashboard/sales/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { Ecommerce } from '@/types/ecommerce';

export default function SalesPage() {
  const [sales, setSales] = useState<Ecommerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Ecommerce | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ecommerce');
      if (!response.ok) throw new Error('Error al cargar ventas');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/ecommerce/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Error al actualizar estado');
      
      setSales(prev =>
        prev.map(sale =>
          sale.id === id ? { ...sale, status: newStatus } : sale
        )
      );
      alert('Estado actualizado correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta venta?')) return;

    try {
      const response = await fetch(`/api/ecommerce/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar venta');
      
      setSales(prev => prev.filter(sale => sale.id !== id));
      alert('Venta eliminada correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleDownloadPDF = (orderId: string) => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/ecommerce-report-pdf/factura/${orderId}`,
      '_blank'
    );
  };

  const handleViewDetails = (sale: Ecommerce) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const filteredSales = sales.filter(sale => {
    const matchesStatus = !filterStatus || sale.status === filterStatus;
    const matchesSearch =
      sale.nameClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.nameCompany && sale.nameCompany.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Vendido':
        return 'bg-green-100 text-green-800';
      case 'Rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = filteredSales.filter(s => s.status === 'Vendido').length;
  const pendingSales = filteredSales.filter(s => s.status === 'Pendiente').length;
  const rejectedSales = filteredSales.filter(s => s.status === 'Rechazado').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
        <p className="text-gray-600 mt-1">Administra todas las órdenes y ventas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredSales.length}
              </p>
            </div>
            <span className="text-4xl opacity-20">🛒</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {completedSales}
              </p>
            </div>
            <span className="text-4xl opacity-20">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {pendingSales}
              </p>
            </div>
            <span className="text-4xl opacity-20">⏳</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                Bs{totalSales.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl opacity-20">💰</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por cliente, empresa o ID de orden..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente ({pendingSales})</option>
          <option value="Vendido">Vendido ({completedSales})</option>
          <option value="Rechazado">Rechazado ({rejectedSales})</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Cargando ventas...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Sales Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs text-gray-900 font-mono">
                      #{sale.id.slice(0, 8)}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sale.nameClient}
                      </div>
                      {sale.nameCompany && (
                        <div className="text-xs text-gray-500">
                          {sale.nameCompany}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(sale.createdAt).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleTimeString('es-BO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {sale.ecommerceDetail.length} {sale.ecommerceDetail.length === 1 ? 'item' : 'items'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">
                      Bs{sale.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={sale.status}
                      onChange={(e) => handleUpdateStatus(sale.id, e.target.value)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${getStatusColor(
                        sale.status
                      )}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(sale)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(sale.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Descargar PDF"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">
                {searchTerm || filterStatus
                  ? 'No se encontraron ventas con los filtros aplicados'
                  : 'No hay ventas registradas'}
              </p>
              {(searchTerm || filterStatus) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('');
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalle de Orden #{selectedSale.id.slice(0, 8)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedSale.createdAt).toLocaleString('es-BO')}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nombre</p>
                    <p className="font-medium text-gray-900">{selectedSale.nameClient}</p>
                  </div>
                  {selectedSale.nameCompany && (
                    <div>
                      <p className="text-gray-600">Empresa</p>
                      <p className="font-medium text-gray-900">{selectedSale.nameCompany}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Estado</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSale.status)}`}>
                      {selectedSale.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Productos ({selectedSale.ecommerceDetail.length})
                </h3>
                <div className="space-y-3">
                  {selectedSale.ecommerceDetail.map((detail) => (
                    <div key={detail.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      {detail.product.images && detail.product.images.length > 0 && (
                        <img
                          src={detail.product.images[0].url}
                          alt={detail.product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{detail.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {detail.quantity} × Bs{detail.product.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Bs{detail.subTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    Bs{selectedSale.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadPDF(selectedSale.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  📥 Descargar Factura PDF
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}