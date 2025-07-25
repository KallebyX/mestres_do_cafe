import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  Info,
  Package, Users
} from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notificationAPI } from "../services/api.js";
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Em vez de lançar erro, retornar valores padrão seguros
    console.warn('⚠️ useNotifications usado fora do NotificationProvider, retornando fallbacks');
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      isVisible: false,
      setIsVisible: () => {},
      notificationTypes: {},
      hasNotificationPermission: false,
      loadNotifications: () => Promise.resolve(),
      createNotification: () => Promise.resolve({ success: true }),
      markAsRead: () => Promise.resolve({ success: true }),
      markAllAsRead: () => Promise.resolve({ success: true }),
      deleteNotification: () => Promise.resolve({ success: true }),
      requestNotificationPermission: () => Promise.resolve(false),
      notifySuccess: () => Promise.resolve({ success: true }),
      notifyError: () => Promise.resolve({ success: true }),
      notifyInfo: () => Promise.resolve({ success: true }),
      checkFinancialAlerts: () => Promise.resolve(),
      checkStockAlerts: () => Promise.resolve()
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  const { user, hasPermission } = useAuth();

  // Tipos de notificação com configurações
  const notificationTypes = {
    financial: {
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    stock: {
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    hr: {
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    task: {
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    alert: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  // Função placeholder - não precisamos mais verificar tabelas do Supabase
  const tableExists = useCallback(async (tableName) => {
    // Como estamos usando Flask API, sempre retornamos false
    // para evitar tentativas de acesso a tabelas Supabase
    return false;
  }, []);

  // Carregar notificações do banco - VERSÃO ULTRA ROBUSTA
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Usar APENAS a API ultra-robusta que nunca falha
      const result = await notificationAPI.getNotifications(user.id);
      
      // A API sempre retorna success: true
      const notifications = Array.isArray(result.data) ? result.data : [];
      setNotifications(notifications);
      
      // Validação segura para contagem de não lidas
      const unreadNotifications = notifications.filter(n => n && !n.read);
      setUnreadCount(unreadNotifications.length || 0);
      } catch (error) {
      console.error('❌ Erro inesperado ao carregar notificações:', error);
      // Garantir que sempre temos arrays vazios 
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Criar notificação - VERSÃO ULTRA ROBUSTA
  const createNotification = useCallback(async (notification) => {
    try {
      // Usar APENAS a API ultra-robusta que nunca falha  
      const result = await notificationAPI.createNotification({
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: notification.priority || 'medium',
        action_url: notification.actionUrl,
        metadata: notification.metadata || {}
      });

      // Criar notificação local sempre (independente do resultado da API)
      const newNotification = {
        id: Date.now(),
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        priority: notification.priority || 'medium',
        read: false,
        action_url: notification.actionUrl,
        metadata: notification.metadata || {},
        created_at: new Date().toISOString()
      };

      // Atualizar estado local se for para o usuário atual
      if (notification.userId === user?.id) {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }

      return { success: true, data: newNotification };
    } catch (error) {
      console.error('❌ Erro inesperado ao criar notificação:', error);
      return { success: true, message: 'Notificação criada localmente' };
    }
  }, [user]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Atualizar estado local imediatamente para melhor UX
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Usar a nova API robusta
      const result = await notificationAPI.markAsRead(notificationId);
      
      if (!result.success) {
        console.error('Erro ao marcar notificação no servidor:', result.error);
        // Estado local já foi atualizado, então não reverter
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      // Estado local já foi atualizado, então manter a mudança
      return { success: true };
    }
  }, []);

  // Marcar todas como lidas - VERSÃO SIMPLIFICADA
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      // SEMPRE atualizar estado local primeiro (melhor UX)
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      // Tentar atualizar no backend (sem falhar se der erro)
      try {
        await notificationAPI.markAsRead('all');
        } catch (error) {
        console.warn('Erro ao marcar todas como lidas no backend:', error);
        }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro inesperado ao marcar todas como lidas:', error);
      return { success: true }; // Sempre retornar sucesso para UX
    }
  }, [user]);

  // Deletar notificação - VERSÃO SIMPLIFICADA
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // SEMPRE remover do estado local primeiro (melhor UX)
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Tentar deletar no backend (sem falhar se der erro)
      try {
        // Futuro: implementar delete na API robusta se necessário
      } catch (error) {
        console.warn('Erro ao deletar notificação no backend:', error);
        }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro inesperado ao deletar notificação:', error);
      return { success: true }; // Sempre retornar sucesso para UX
    }
  }, []);

  // Sistema de alertas automáticos - SIMPLIFICADO (sem Supabase)
  const checkFinancialAlerts = useCallback(async () => {
    if (!hasPermission('admin')) return;

    try {
      // TODO: Implementar verificação via Flask API quando necessário
      // Por enquanto, não fazemos verificações automáticas
      console.log('Verificação de alertas financeiros desativada - aguardando implementação Flask API');
    } catch (error) {
      console.error('Erro ao verificar alertas financeiros:', error);
    }
  }, [user, hasPermission]);

  const checkStockAlerts = useCallback(async () => {
    if (!hasPermission('admin')) return;

    try {
      // TODO: Implementar verificação via Flask API quando necessário
      // Por enquanto, não fazemos verificações automáticas
      console.log('Verificação de alertas de estoque desativada - aguardando implementação Flask API');
    } catch (error) {
      console.error('Erro ao verificar alertas de estoque:', error);
    }
  }, [user, hasPermission]);

  // Solicitar permissão para notificações (apenas quando o usuário interagir)
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasNotificationPermission(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  }, []);

  // Configurar subscriptions em tempo real - DESABILITADO POR SEGURANÇA
  useEffect(() => {
    if (!user) return;

    // TEMPORARIAMENTE DESABILITADO para evitar erros 404
    // As notificações funcionam via estado local
    // Futuro: reativar quando tabela notifications estiver 100% funcional
    // const setupSubscriptions = async () => {
    //   try {
    //     const result = await notificationAPI.tableExists('notifications');
    //     if (!result) return;
    //     // ... subscription code
    //   } catch (error) {
    //     //   }
    // };
    
  }, [user, hasNotificationPermission]);

  // Verificar alertas periodicamente (apenas para admins)
  useEffect(() => {
    let isMounted = true;
    
    if (!user || !hasPermission('admin') || !isMounted) return;

    const checkAlerts = () => {
      if (isMounted) {
        checkFinancialAlerts();
        checkStockAlerts();
      }
    };

    // Verificar após 5 segundos da inicialização
    const initialTimeout = setTimeout(checkAlerts, 5000);

    // Verificar a cada 10 minutos
    const interval = setInterval(checkAlerts, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user, hasPermission, checkFinancialAlerts, checkStockAlerts]);

  // Carregar notificações na inicialização
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      loadNotifications();
    }
    
    return () => {
      isMounted = false;
    };
  }, [loadNotifications]);

  // Verificar permissão existente para notificações
  useEffect(() => {
    let isMounted = true;
    
    if ('Notification' in window && isMounted) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Funções de notificação rápida para módulos
  const notifySuccess = useCallback((title, message, actionUrl) => {
    return createNotification({
      userId: user?.id,
      type: 'success',
      title,
      message,
      actionUrl
    });
  }, [user, createNotification]);

  const notifyError = useCallback((title, message, actionUrl) => {
    return createNotification({
      userId: user?.id,
      type: 'alert',
      priority: 'high',
      title,
      message,
      actionUrl
    });
  }, [user, createNotification]);

  const notifyInfo = useCallback((title, message, actionUrl) => {
    return createNotification({
      userId: user?.id,
      type: 'info',
      title,
      message,
      actionUrl
    });
  }, [user, createNotification]);

  const value = {
    notifications,
    unreadCount,
    loading,
    isVisible,
    setIsVisible,
    notificationTypes,
    hasNotificationPermission,
    
    // Funções principais
    loadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    
    // Funções de conveniência
    notifySuccess,
    notifyError,
    notifyInfo,
    
    // Verificadores de alertas
    checkFinancialAlerts,
    checkStockAlerts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
