import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiClient } from '../config/api';

const ShippingTracker = ({ trackingCode, autoRefresh = true, onStatusChange }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (trackingCode) {
      fetchTrackingData();
      
      // Auto refresh a cada 5 minutos se enabled
      if (autoRefresh) {
        const interval = setInterval(() => {
          fetchTrackingData(false); // Silent refresh
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
      }
    }
  }, [trackingCode, autoRefresh]);

  const fetchTrackingData = async (showLoading = true) => {
    if (!trackingCode) return;

    try {
      if (showLoading) setLoading(true);
      setError('');

      const response = await apiClient.get(`/api/shipping/melhor-envio/track/${trackingCode}`);

      if (response.data.success) {
        const oldStatus = trackingData?.status;
        setTrackingData(response.data.tracking_data);
        setLastUpdate(new Date());
        
        // Notificar mudança de status
        if (oldStatus && oldStatus !== response.data.tracking_data.status) {
          onStatusChange?.(response.data.tracking_data.status, oldStatus);
        }
      } else {
        setError(response.data.error || 'Erro ao rastrear entrega');
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'posted': {
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Postado',
        description: 'Objeto foi postado nos Correios'
      },
      'in_transit': {
        icon: Truck,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Em Trânsito',
        description: 'Objeto está a caminho do destino'
      },
      'out_for_delivery': {
        icon: Truck,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Saiu para Entrega',
        description: 'Objeto saiu para entrega'
      },
      'delivered': {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Entregue',
        description: 'Objeto foi entregue no destinatário'
      },
      'returned': {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Devolvido',
        description: 'Objeto foi devolvido ao remetente'
      },
      'cancelled': {
        icon: AlertTriangle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        title: 'Cancelado',
        description: 'Envio foi cancelado'
      }
    };

    return configs[status] || {
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      title: 'Status Desconhecido',
      description: 'Status não identificado'
    };
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

  const getEventIcon = (eventStatus) => {
    switch (eventStatus) {
      case 'posted':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'in_transit':
        return <Truck className="h-4 w-4 text-yellow-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading && !trackingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !trackingData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => fetchTrackingData()}
            className="text-red-600 hover:text-red-800 underline text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-600">
        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Código de rastreamento não encontrado</p>
      </div>
    );
  }

  const config = getStatusConfig(trackingData.status);
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Status Principal */}
      <div className={`rounded-lg border p-6 ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon className={`h-6 w-6 ${config.color} mr-3`} />
            <div>
              <h3 className={`text-lg font-medium ${config.color}`}>
                {config.title}
              </h3>
              <p className="text-sm text-gray-600">
                {trackingData.status_description || config.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => fetchTrackingData()}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Informações do Rastreamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Código:</span>
            <p className="text-gray-900 font-mono">{trackingData.tracking_code}</p>
          </div>
          
          {trackingData.estimated_delivery && (
            <div>
              <span className="font-medium text-gray-700">Previsão de Entrega:</span>
              <p className="text-gray-900">{formatDate(trackingData.estimated_delivery)}</p>
            </div>
          )}
          
          {trackingData.delivered_at && (
            <div>
              <span className="font-medium text-gray-700">Entregue em:</span>
              <p className="text-gray-900">{formatDate(trackingData.delivered_at)}</p>
            </div>
          )}
        </div>

        {/* Última atualização */}
        {lastUpdate && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Última atualização: {formatDate(lastUpdate.toISOString())}
            </span>
          </div>
        )}
      </div>

      {/* Histórico de Eventos */}
      {trackingData.events && trackingData.events.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Histórico de Rastreamento
          </h4>
          
          <div className="space-y-4">
            {trackingData.events.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {event.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600">
                        {event.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          ℹ️ Informações Importantes
        </h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Os prazos são calculados em dias úteis</li>
          <li>• Atualizações podem levar até 24h para aparecer</li>
          <li>• Em caso de problemas, entre em contato conosco</li>
          {trackingData.status === 'delivered' && (
            <li>• ✅ Entrega confirmada - Obrigado pela compra!</li>
          )}
        </ul>
      </div>

      {/* Ações */}
      {trackingData.status !== 'delivered' && trackingData.status !== 'cancelled' && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchTrackingData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Atualizar Rastreamento
          </button>
        </div>
      )}
    </div>
  );
};

export default ShippingTracker;