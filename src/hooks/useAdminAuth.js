import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

// ✅ HOOK CUSTOMIZADO - Para evitar loops infinitos em dashboards admin
export const useAdminAuth = (redirectPath = '/dashboard') => {
  const { user, hasPermission, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Aguardar carregamento da autenticação
    if (loading) return;

    // Se não tem usuário, redirecionar para login
    if (!user) {
      navigate('/login');
      return;
    }

    // Se não é admin, redirecionar
    if (!hasPermission('admin')) {
      navigate(redirectPath);
      return;
    }
  }, [user, loading]); // ✅ Dependências otimizadas

  return {
    user,
    isAdmin: user && hasPermission('admin'),
    isLoading: loading || !user
  };
};

// ✅ HOOK PARA CARREGAMENTO DE DADOS - Com debounce
export const useDataLoader = (loadFunction, dependencies = []) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFunction();
    }, 100); // ✅ Debounce de 100ms

    return () => clearTimeout(timeoutId);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useAdminAuth;