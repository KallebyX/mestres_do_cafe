import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export const useAdminDashboard = (options = {}) => {
  const { 
    initialTab = 'overview',
    permissions = [],
    autoRefresh = false,
    refreshInterval = 30000
  } = options;

  const { user, hasPermission, profile, loading: authLoading } = useAuth();
  const { createNotification } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission check
  const hasRequiredPermissions = useCallback(() => {
    if (!user || !hasPermission('admin')) return false;
    if (permissions.length === 0) return true;
    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission, permissions]);

  // Message handling
  const showMessage = useCallback((message, type = 'info') => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else if (type === 'success') {
      setSuccess(message);
      setError('');
    }
    
    createNotification({
      userId: user?.id,
      title: message,
      message: message,
      type: type
    });
  }, [createNotification, user]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Tab management
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    clearMessages();
    setRefreshKey(prev => prev + 1);
  }, [clearMessages]);

  // Refresh functionality
  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Loading state management
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  // Generic API call wrapper
  const handleApiCall = useCallback(async (apiCall, successMessage = null, errorMessage = null) => {
    setLoading(true);
    clearMessages();
    
    try {
      const result = await apiCall();
      
      if (result.success) {
        if (successMessage) {
          showMessage(successMessage, 'success');
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      const message = errorMessage || error.message || 'Erro ao processar solicitação';
      showMessage(message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showMessage, clearMessages]);

  // Generic form submission handler
  const handleFormSubmit = useCallback(async (formData, apiCall, successMessage = 'Operação realizada com sucesso') => {
    return handleApiCall(apiCall, successMessage);
  }, [handleApiCall]);

  // Generic delete handler
  const handleDelete = useCallback(async (itemId, apiCall, itemName = 'item') => {
    if (!window.confirm(`Tem certeza que deseja deletar este ${itemName}?`)) {
      return false;
    }
    
    try {
      await handleApiCall(apiCall, `${itemName} deletado com sucesso`);
      return true;
    } catch (error) {
      return false;
    }
  }, [handleApiCall]);

  // Generic status toggle handler
  const handleStatusToggle = useCallback(async (itemId, currentStatus, apiCall, itemName = 'item') => {
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'ativado' : 'desativado';
    
    try {
      await handleApiCall(apiCall, `${itemName} ${statusText} com sucesso`);
      return true;
    } catch (error) {
      return false;
    }
  }, [handleApiCall]);

  return {
    // State
    user,
    profile,
    loading,
    authLoading,
    activeTab,
    error,
    success,
    refreshKey,
    
    // Permission checks
    hasRequiredPermissions,
    hasPermission,
    
    // Actions
    handleTabChange,
    showMessage,
    clearMessages,
    refreshData,
    handleApiCall,
    handleFormSubmit,
    handleDelete,
    handleStatusToggle,
    
    // Utilities
    setLoading,
    setError,
    setSuccess,
    setActiveTab
  };
};

export default useAdminDashboard;