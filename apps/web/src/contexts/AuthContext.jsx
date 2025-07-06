import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se há um usuário logado no localStorage na inicialização
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = authAPI.getCurrentUser();
        const savedToken = authAPI.getToken();
        
        if (savedUser && savedToken) {
          setUser({ ...savedUser, token: savedToken });
          // Verificar se o token ainda é válido
          const verifyResult = await authAPI.verifyToken();
          if (!verifyResult.success) {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Limpar dados de autenticação
  const clearAuth = () => {
    setUser(null);
    authAPI.logout();
  };

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        setUser({ ...response.user, token: response.token });
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Erro no login');
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        return { 
          success: true, 
          message: 'Cadastro realizado com sucesso! Faça login para continuar.',
          user: response.user 
        };
      } else {
        throw new Error(response.error || 'Erro no cadastro');
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer cadastro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      authAPI.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      clearAuth();
    }
  };

  // Atualizar perfil do usuário
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Por enquanto simular sucesso até ter endpoint real
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário tem permissão para uma ação
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roles = {
      'admin': 3,
      'cliente_pj': 2,
      'cliente_pf': 1
    };
    
    const userRole = roles[user.user_type] || 0;
    const requiredLevel = roles[requiredRole] || 0;
    
    return userRole >= requiredLevel;
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return !!user && !!user.token;
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    isAuthenticated,
    clearError,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

