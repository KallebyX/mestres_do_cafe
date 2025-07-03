import React, { useState } from 'react';
import { _useNotifications } from '../contexts/NotificationContext';
import { _useNavigate } from 'react-router-dom';
// import { _Bell, _X, _Check, _CheckCheck, _Trash2, _Clock, _AlertCircle, _ChevronRight, _Settings, _Filter } from 'lucide-react'; // Temporarily commented - unused import
import { _formatDistanceToNow } from 'date-fns';
import { _ptBR } from 'date-fns/locale';

export const _NotificationBell = () => {
  const { unreadCount, isVisible, setIsVisible } = useNotifications();

  return (
    <button
      onClick={() => setIsVisible(!isVisible)}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export const _NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    isVisible, 
    setIsVisible,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    notificationTypes,
    loading 
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, financial, stock, hr
  const _navigate = useNavigate();

  if (!isVisible) return null;

  const _filteredNotifications = notifications.filter(_notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const _handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setIsVisible(false);
    }
  };

  const _handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const _handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const _formatTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Agora mesmo';
    }
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-brand-brown to-amber-600 text-white">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Notificações</h3>
          {unreadCount > 0 && (
            <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filtros e Ações */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-brand-brown focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="unread">Não lidas</option>
              <option value="financial">Financeiro</option>
              <option value="stock">Estoque</option>
              <option value="hr">RH</option>
              <option value="alert">Alertas</option>
            </select>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-sm text-brand-brown hover:text-brand-brown/80 font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-brand-brown border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Carregando notificações...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'all' ? 'Você está em dia! 🎉' : 'Tudo certo por aqui!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const _typeConfig = notificationTypes[notification.type] || notificationTypes.info;
              const _IconComponent = typeConfig.icon;

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig.bgColor} ${typeConfig.borderColor} border`}>
                      <IconComponent className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        
                        {/* Ações */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notification.created_at)}
                        </div>

                        {notification.action_url && (
                          <div className="flex items-center gap-1 text-xs text-brand-brown font-medium">
                            Ver detalhes
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Indicador de prioridade */}
                      {notification.priority === 'high' && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600 font-medium">Alta prioridade</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              navigate('/admin/configuracoes?tab=notificacoes');
              setIsVisible(false);
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar notificações
          </button>
        </div>
      )}
    </div>
  );
};

export const _NotificationCenter = () => {
  return (
    <div className="relative">
      <NotificationBell />
      <NotificationDropdown />
    </div>
  );
};

export default NotificationCenter; 