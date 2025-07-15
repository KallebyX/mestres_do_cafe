import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, AlertTriangle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import PaymentStatusTracker from './PaymentStatusTracker';

const MercadoPagoAdmin = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refunding, setRefunding] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');

      // Como não temos um endpoint específico para listar todos os pagamentos,
      // vamos simular com dados locais por enquanto
      // Em produção, você criaria um endpoint /api/payments/mercadopago/list
      
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas pagamentos do Mercado Pago
        const mpPayments = data.payments?.filter(p => p.provider === 'mercado_pago') || [];
        setPayments(mpPayments);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar pagamentos');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId, amount = null) => {
    try {
      setRefunding(prev => ({ ...prev, [paymentId]: true }));

      const refundData = {
        payment_id: paymentId
      };

      if (amount) {
        refundData.amount = amount;
      }

      const response = await fetch('/api/payments/mercadopago/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(refundData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Estorno realizado com sucesso! ID: ${data.refund_id}`);
          loadPayments(); // Recarregar lista
        } else {
          alert(`Erro no estorno: ${data.error}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Erro no estorno: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      alert('Erro interno no estorno');
    } finally {
      setRefunding(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Pago' },
      held: { color: 'bg-blue-100 text-blue-800', text: 'Em Escrow' },
      released: { color: 'bg-green-100 text-green-800', text: 'Liberado' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Falhou' },
      refunded: { color: 'bg-purple-100 text-purple-800', text: 'Estornado' },
      disputed: { color: 'bg-orange-100 text-orange-800', text: 'Disputado' }
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

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = !filters.status || payment.status === filters.status;
    const matchesSearch = !filters.search || 
      payment.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.provider_transaction_id?.toLowerCase().includes(filters.search.toLowerCase());
    
    const paymentDate = new Date(payment.created_at);
    const matchesDateFrom = !filters.dateFrom || paymentDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || paymentDate <= new Date(filters.dateTo);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Administração Mercado Pago
        </h1>
        <p className="text-gray-600">
          Gerencie pagamentos e estornos do Mercado Pago
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
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
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="held">Em Escrow</option>
              <option value="released">Liberado</option>
              <option value="failed">Falhou</option>
              <option value="refunded">Estornado</option>
              <option value="disputed">Disputado</option>
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
                placeholder="ID do pagamento..."
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
            onClick={loadPayments}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Pagamentos ({filteredPayments.length})
          </h3>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Nenhum pagamento encontrado
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          MP: {payment.provider_transaction_id || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Valor:</span>
                        <span className="ml-1">{formatAmount(payment.amount)}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Data:</span>
                        <span className="ml-1">{formatDate(payment.created_at)}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Método:</span>
                        <span className="ml-1 capitalize">
                          {payment.payment_method?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium">Pedido:</span>
                        <span className="ml-1">{payment.order_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Detalhes
                    </button>

                    {['paid', 'held', 'released'].includes(payment.status) && (
                      <button
                        onClick={() => {
                          const amount = prompt('Valor do estorno (deixe vazio para estorno total):');
                          if (amount !== null) {
                            handleRefund(payment.id, amount || null);
                          }
                        }}
                        disabled={refunding[payment.id]}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {refunding[payment.id] ? 'Estornando...' : 'Estornar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes do Pagamento
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <PaymentStatusTracker 
                paymentId={selectedPayment.id}
                onStatusChange={(newStatus, oldStatus) => {
                  console.log(`Payment status changed from ${oldStatus} to ${newStatus}`);
                  loadPayments(); // Recarregar lista
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MercadoPagoAdmin;