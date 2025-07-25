import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  DollarSign,
  MapPin
} from 'lucide-react';
import { apiClient } from '../config/api';
import PaymentStatusTracker from './PaymentStatusTracker';
import ShippingTracker from './ShippingTracker';
import EscrowStatus from './EscrowStatus';

const OrderStatusIntegrated = ({ orderId, onStatusUpdate }) => {
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [escrowData, setEscrowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
      
      // Auto refresh a cada 2 minutos
      const interval = setInterval(fetchOrderData, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError('');

      // Buscar dados do pedido
      const orderResponse = await apiClient.get(`/api/orders/${orderId}`);
      if (orderResponse.data.success) {
        setOrder(orderResponse.data.order);
        
        // Buscar dados do pagamento se existir
        if (orderResponse.data.order.payment_id) {
          const paymentResponse = await apiClient.get(`/api/payments/${orderResponse.data.order.payment_id}`);
          if (paymentResponse.data.success) {
            setPayment(paymentResponse.data.payment);
            
            // Buscar dados do escrow se pagamento tem vendor
            if (paymentResponse.data.payment.vendor_id) {
              const escrowResponse = await apiClient.get(`/api/escrow/payment/${paymentResponse.data.payment.id}`);
              if (escrowResponse.data.success) {
                setEscrowData(escrowResponse.data.escrow);
              }
            }
          }
        }
        
        // Buscar dados de envio se existir tracking code
        if (orderResponse.data.order.tracking_code) {
          const shippingResponse = await apiClient.get(`/api/shipping/melhor-envio/track/${orderResponse.data.order.tracking_code}`);
          if (shippingResponse.data.success) {
            setShipping(shippingResponse.data.tracking_data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      setError('Erro ao carregar dados do pedido');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = (newStatus, oldStatus) => {
    onStatusUpdate?.('payment', newStatus, oldStatus);
    fetchOrderData(); // Refresh data
  };

  const handleShippingStatusChange = (newStatus, oldStatus) => {
    onStatusUpdate?.('shipping', newStatus, oldStatus);
    
    // Se entregue, pode impactar o escrow
    if (newStatus === 'delivered') {
      fetchOrderData(); // Refresh escrow data
    }
  };

  const getOverallStatus = () => {
    if (!order) return { status: 'unknown', label: 'Carregando...', color: 'gray' };

    // Lógica para determinar status geral baseado em pagamento, envio e escrow
    if (payment?.status === 'failed') {
      return { status: 'failed', label: 'Pagamento falhou', color: 'red' };
    }
    
    if (payment?.status === 'pending') {
      return { status: 'pending_payment', label: 'Aguardando pagamento', color: 'yellow' };
    }
    
    if (payment?.status === 'held' && !shipping?.status) {
      return { status: 'payment_held', label: 'Pagamento em escrow', color: 'blue' };
    }
    
    if (shipping?.status === 'delivered' && payment?.status === 'held') {
      return { status: 'awaiting_release', label: 'Aguardando liberação do pagamento', color: 'orange' };
    }
    
    if (shipping?.status === 'delivered' && payment?.status === 'released') {
      return { status: 'completed', label: 'Pedido concluído', color: 'green' };
    }
    
    if (shipping?.status === 'in_transit') {
      return { status: 'in_transit', label: 'Em trânsito', color: 'blue' };
    }
    
    if (shipping?.status === 'shipped') {
      return { status: 'shipped', label: 'Enviado', color: 'blue' };
    }
    
    if (payment?.status === 'paid') {
      return { status: 'processing', label: 'Processando envio', color: 'blue' };
    }
    
    return { status: 'unknown', label: 'Status desconhecido', color: 'gray' };
  };

  const renderOverview = () => {
    const overallStatus = getOverallStatus();
    
    return (
      <div className="space-y-6">
        {/* Status Geral */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-${overallStatus.color}-500`}></div>
              <h3 className="text-lg font-semibold">{overallStatus.label}</h3>
            </div>
            <button 
              onClick={fetchOrderData}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {order && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Pedido:</span>
                <p className="font-medium">#{order.order_number}</p>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>
                <p className="font-medium">R$ {order.total_amount}</p>
              </div>
              <div>
                <span className="text-gray-500">Data:</span>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium">{order.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pagamento */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold">Pagamento</h4>
            </div>
            
            {payment ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    payment.status === 'paid' || payment.status === 'released' ? 'text-green-600' :
                    payment.status === 'held' ? 'text-blue-600' :
                    payment.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor:</span>
                  <span className="font-medium">R$ {payment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Método:</span>
                  <span className="font-medium">{payment.payment_method}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Aguardando dados do pagamento</p>
            )}
          </div>

          {/* Escrow */}
          {payment?.vendor_id && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Escrow</h4>
              </div>
              
              {payment && <EscrowStatus payment={payment} />}
            </div>
          )}

          {/* Envio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold">Envio</h4>
            </div>
            
            {shipping ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    shipping.status === 'delivered' ? 'text-green-600' :
                    shipping.status === 'in_transit' ? 'text-blue-600' :
                    shipping.status === 'shipped' ? 'text-purple-600' :
                    'text-gray-600'
                  }`}>
                    {shipping.status_description || shipping.status}
                  </span>
                </div>
                {order?.tracking_code && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Código:</span>
                    <span className="font-medium">{order.tracking_code}</span>
                  </div>
                )}
                {shipping.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Previsão:</span>
                    <span className="font-medium">
                      {new Date(shipping.estimated_delivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : order?.tracking_code ? (
              <p className="text-gray-500">Carregando dados de rastreamento...</p>
            ) : (
              <p className="text-gray-500">Envio ainda não criado</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    return (
      <div className="space-y-6">
        {/* Pagamento Detalhado */}
        {payment && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Detalhes do Pagamento
            </h4>
            <PaymentStatusTracker 
              paymentId={payment.id} 
              onStatusChange={handlePaymentStatusChange}
            />
          </div>
        )}

        {/* Rastreamento Detalhado */}
        {order?.tracking_code && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Rastreamento da Entrega
            </h4>
            <ShippingTracker 
              trackingCode={order.tracking_code}
              onStatusChange={handleShippingStatusChange}
            />
          </div>
        )}

        {/* Escrow Detalhado */}
        {escrowData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Sistema de Escrow
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium">{escrowData.status}</p>
                </div>
                <div>
                  <span className="text-gray-500">Valor retido:</span>
                  <p className="font-medium">R$ {escrowData.amount}</p>
                </div>
              </div>
              {escrowData.release_eligible_at && (
                <div>
                  <span className="text-gray-500">Elegível para liberação em:</span>
                  <p className="font-medium">
                    {new Date(escrowData.release_eligible_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && !order) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Carregando dados do pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button 
          onClick={fetchOrderData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detailed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detalhado
          </button>
        </nav>
      </div>

      {/* Conteúdo */}
      {activeTab === 'overview' ? renderOverview() : renderDetailedView()}
    </div>
  );
};

export default OrderStatusIntegrated;