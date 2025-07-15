import React, { useState, useEffect } from 'react';
import { Package, Truck, FileText, Download, Eye, RefreshCw, Plus, Filter, Search } from 'lucide-react';
import ShippingTracker from './ShippingTracker';

const ShippingAdmin = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/shipping/melhor-envio/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShipments(data.shipments || []);
        } else {
          setError(data.error || 'Erro ao carregar envios');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro na comunicação com o servidor');
      }
    } catch (error) {
      console.error('Error loading shipments:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (orderData) => {
    try {
      const response = await fetch('/api/shipping/melhor-envio/create-shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Envio criado com sucesso!\nCódigo: ${data.tracking_code}`);
          setShowCreateModal(false);
          loadShipments(); // Recarregar lista
        } else {
          alert(`Erro ao criar envio: ${data.error}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar envio: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Erro interno ao criar envio');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'shipped': { color: 'bg-blue-100 text-blue-800', text: 'Enviado' },
      'delivered': { color: 'bg-green-100 text-green-800', text: 'Entregue' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelado' },
      'returned': { color: 'bg-yellow-100 text-yellow-800', text: 'Devolvido' },
      'processing': { color: 'bg-gray-100 text-gray-800', text: 'Processando' }
    };

    const config = configs[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesStatus = !filters.status || shipment.status === filters.status;
    const matchesSearch = !filters.search || 
      shipment.order_number.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.tracking_code?.toLowerCase().includes(filters.search.toLowerCase());
    
    const shipmentDate = new Date(shipment.created_at);
    const matchesDateFrom = !filters.dateFrom || shipmentDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || shipmentDate <= new Date(filters.dateTo);

    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gerenciamento de Envios
            </h1>
            <p className="text-gray-600">
              Controle de etiquetas e rastreamento via Melhor Envio
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Envio
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
              <option value="returned">Devolvido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Pedido ou código..."
                className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '', search: '' })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpar filtros
          </button>
          
          <button
            onClick={loadShipments}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de Envios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Envios ({filteredShipments.length})
          </h3>
        </div>

        {filteredShipments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum envio encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredShipments.map((shipment) => (
              <div key={shipment.order_id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Pedido #{shipment.order_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {shipment.tracking_code || 'Sem código de rastreamento'}
                        </p>
                      </div>
                      
                      <div>
                        {getStatusBadge(shipment.status)}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Valor:</span>
                        <span className="ml-1">{formatAmount(shipment.total_amount)}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Método:</span>
                        <span className="ml-1">{shipment.shipping_method || 'N/A'}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Criado:</span>
                        <span className="ml-1">{formatDate(shipment.created_at)}</span>
                      </div>

                      {shipment.delivered_at && (
                        <div>
                          <span className="font-medium">Entregue:</span>
                          <span className="ml-1">{formatDate(shipment.delivered_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {shipment.tracking_code && (
                      <button
                        onClick={() => setSelectedShipment(shipment)}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Rastrear
                      </button>
                    )}

                    <button
                      onClick={() => alert('Funcionalidade de etiqueta em desenvolvimento')}
                      className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Etiqueta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Rastreamento */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Rastreamento - Pedido #{selectedShipment.order_number}
                </h3>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <ShippingTracker 
                trackingCode={selectedShipment.tracking_code}
                onStatusChange={(newStatus, oldStatus) => {
                  console.log(`Shipment status changed from ${oldStatus} to ${newStatus}`);
                  loadShipments(); // Recarregar lista
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Envio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Criar Novo Envio
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Esta funcionalidade criará automaticamente uma etiqueta de envio para o pedido selecionado.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID do Pedido
                  </label>
                  <input
                    type="text"
                    placeholder="UUID do pedido"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serviço de Entrega
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="1">PAC</option>
                    <option value="2">SEDEX</option>
                    <option value="17">Jadlog Econômico</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Criar Envio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAdmin;