import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AdminDashboardBase = ({ 
  title, 
  tabs, 
  children, 
  permissions = [],
  className = "",
  showStats = true,
  onTabChange = null,
  defaultTab = null
}) => {
  const { user, hasPermission, profile, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !hasPermission('admin'))) {
      navigate('/login');
      return;
    }
    
    if (permissions.length > 0) {
      const hasRequiredPermission = permissions.some(permission => hasPermission(permission));
      if (!hasRequiredPermission) {
        navigate('/admin');
        return;
      }
    }
    
    setLoading(false);
  }, [user, hasPermission, authLoading, navigate, permissions]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setError('');
    setSuccess('');
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const showMessage = (message, type = 'info') => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else if (type === 'success') {
      setSuccess(message);
      setError('');
    }
    
    addNotification(message, type);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Logado como: {profile?.name || user?.email || 'Usuário'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar ao Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={clearMessages}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button
              onClick={clearMessages}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  {tab.icon && <tab.icon className="h-5 w-5 mr-2" />}
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default AdminDashboardBase;