import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, AlertCircle, X, Bell } from 'lucide-react';

const ShippingNotifications = ({ 
  trackingCode, 
  onStatusChange,
  autoCheck = true,
  checkInterval = 300000 // 5 minutos
}) => {
  const [notifications, setNotifications] = useState([]);
  const [lastStatus, setLastStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Verificar atualizações de status
  useEffect(() => {
    if (!trackingCode || !autoCheck) return;

    const checkStatusUpdate = async () => {
      try {
        const response = await fetch(`/api/shipping/melhor-envio/track/${trackingCode}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.tracking_data) {
            const currentStatus = data.tracking_data.status;
            
            if (lastStatus && lastStatus !== currentStatus) {
              const notification = createNotification(currentStatus, lastStatus, data.tracking_data);
              addNotification(notification);
              onStatusChange?.(currentStatus, lastStatus);
            }
            
            setLastStatus(currentStatus);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    // Verificação inicial
    checkStatusUpdate();

    // Verificação periódica
    const interval = setInterval(checkStatusUpdate, checkInterval);

    return () => clearInterval(interval);
  }, [trackingCode, lastStatus, autoCheck, checkInterval, onStatusChange]);

  const createNotification = (newStatus, oldStatus, trackingData) => {
    const statusMessages = {
      'posted': {
        title: 'Pedido Postado',
        message: 'Seu pedido foi postado nos Correios e está a caminho!',
        icon: Package,
        color: 'blue'
      },
      'in_transit': {
        title: 'Em Trânsito',
        message: 'Seu pedido está a caminho do destino.',
        icon: Truck,
        color: 'yellow'
      },
      'out_for_delivery': {
        title: 'Saiu para Entrega',
        message: 'Seu pedido saiu para entrega! Fique atento.',
        icon: Truck,
        color: 'orange'
      },
      'delivered': {
        title: 'Entregue!',
        message: 'Seu pedido foi entregue com sucesso. Obrigado pela compra!',
        icon: CheckCircle,
        color: 'green'
      },
      'returned': {
        title: 'Devolvido',
        message: 'Seu pedido foi devolvido. Entre em contato conosco.',
        icon: AlertCircle,
        color: 'red'
      },
      'cancelled': {
        title: 'Cancelado',
        message: 'O envio foi cancelado.',
        icon: AlertCircle,
        color: 'gray'
      }
    };

    const config = statusMessages[newStatus] || {
      title: 'Status Atualizado',
      message: `Status do pedido alterado para: ${newStatus}`,
      icon: Package,
      color: 'blue'
    };

    return {
      id: Date.now(),
      ...config,
      timestamp: new Date(),
      trackingCode,
      trackingData,
      read: false
    };
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Manter apenas 5 notificações
    setIsVisible(true);

    // Auto-hide após 10 segundos para status não críticos
    if (!['delivered', 'returned', 'cancelled'].includes(notification.status)) {
      setTimeout(() => {
        markAsRead(notification.id);
      }, 10000);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[color] || colors.blue;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Botão de toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="relative bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Lista de notificações */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Atualizações de Entrega</h3>
              <button
                onClick={clearAllNotifications}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 last:border-b-0 ${
                    !notification.read ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-2 rounded-full ${getColorClasses(notification.color)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        <span className="text-xs text-gray-400 font-mono">
                          {notification.trackingCode}
                        </span>
                      </div>
                      
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingNotifications;