import React from 'react';
import { Coffee, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// =============================================
// LOADING COMPONENTS
// =============================================

/**
 * Loading Spinner simples
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <Coffee className="w-full h-full text-amber-600" />
    </div>
  );
};

/**
 * Loading Skeleton para produtos
 */
export const ProductSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-slate-200"></div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
              <div className="w-12 h-5 bg-slate-200 rounded"></div>
            </div>
            <div className="w-full h-6 bg-slate-200 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-slate-200 rounded mb-1"></div>
            <div className="w-1/2 h-3 bg-slate-200 rounded mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="w-20 h-6 bg-slate-200 rounded"></div>
              <div className="w-20 h-8 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Loading Skeleton para tabelas
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Array.from({ length: cols }).map((_, index) => (
          <div key={index} className="h-4 bg-slate-200 rounded"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 mb-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-slate-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Loading de tela completa
 */
export const FullScreenLoading = ({ 
  title = 'Carregando...', 
  subtitle = 'Aguarde enquanto buscamos os dados',
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-600 mb-6">{subtitle}</p>
        
        {showProgress && (
          <div className="w-64 bg-slate-200 rounded-full h-2 mx-auto">
            <div 
              className="bg-amber-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================
// ERROR COMPONENTS
// =============================================

/**
 * Componente de erro genérico
 */
export const ErrorMessage = ({ 
  title = 'Ops! Algo deu errado',
  message,
  onRetry,
  showRetry = true,
  type = 'error' // 'error', 'warning', 'info'
}) => {
  const typeStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    error: <AlertCircle className="w-8 h-8 text-red-600" />,
    warning: <AlertCircle className="w-8 h-8 text-yellow-600" />,
    info: <AlertCircle className="w-8 h-8 text-blue-600" />
  };

  return (
    <div className={`border rounded-2xl p-8 max-w-md mx-auto text-center ${typeStyles[type]}`}>
      <div className="mb-4">{icons[type]}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {message && <p className="mb-4">{message}</p>}
      
      {showRetry && onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-xl border border-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
};

/**
 * Erro de conexão específico
 */
export const ConnectionError = ({ onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto text-center">
      <WifiOff className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-red-900 mb-2">Sem Conexão</h3>
      <p className="text-red-700 mb-4">
        Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.
      </p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
        >
          <Wifi className="w-4 h-4" />
          Reconectar
        </button>
      )}
    </div>
  );
};

/**
 * Estado vazio (sem dados)
 */
export const EmptyState = ({ 
  title = 'Nenhum resultado encontrado',
  subtitle = 'Tente ajustar os filtros ou adicionar novos dados',
  icon = <Coffee className="w-16 h-16 text-slate-400" />,
  action = null
}) => {
  return (
    <div className="text-center py-12">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{subtitle}</p>
      {action}
    </div>
  );
};

// =============================================
// HOOK PERSONALIZADO PARA GERENCIAR ESTADOS
// =============================================

/**
 * Hook para gerenciar estados de loading, erro e dados
 */
export const useDataState = (initialData = null) => {
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('useDataState error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    execute,
    reset
  };
};

// =============================================
// COMPONENTE WRAPPER PARA DADOS ASSÍNCRONOS
// =============================================

/**
 * Wrapper que automatiza loading e error states
 */
export const AsyncDataWrapper = ({ 
  loading,
  error,
  data,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children
}) => {
  if (loading) {
    return loadingComponent || <FullScreenLoading />;
  }

  if (error) {
    return errorComponent || (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent || (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <EmptyState />
      </div>
    );
  }

  return children;
};

export default {
  LoadingSpinner,
  ProductSkeleton,
  TableSkeleton,
  FullScreenLoading,
  ErrorMessage,
  ConnectionError,
  EmptyState,
  useDataState,
  AsyncDataWrapper
}; 