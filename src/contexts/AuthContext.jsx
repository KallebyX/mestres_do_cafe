import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

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
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('mestres_cafe_user');
        const savedToken = localStorage.getItem('mestres_cafe_token');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser({ ...userData, token: savedToken });
          // Verificar se o token ainda é válido
          verifyToken(savedToken);
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

  // Verificar se o token ainda é válido
  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.valid) {
        clearAuth();
      }
    } catch (error) {
      console.error('Token inválido:', error);
      clearAuth();
    }
  };

  // Limpar dados de autenticação
  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('mestres_cafe_user');
    localStorage.removeItem('mestres_cafe_token');
  };

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user: userData, token } = response.data;
        
        // Salvar no localStorage
        localStorage.setItem('mestres_cafe_user', JSON.stringify(userData));
        localStorage.setItem('mestres_cafe_token', token);
        
        // Atualizar estado
        setUser({ ...userData, token });
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Erro no login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login';
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
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: 'Cadastro realizado com sucesso! Faça login para continuar.',
          user: response.data.user 
        };
      } else {
        throw new Error(response.data.message || 'Erro no cadastro');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer cadastro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      // Tentar notificar o backend sobre o logout
      if (user?.token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
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
      
      const response = await api.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        
        // Atualizar localStorage
        localStorage.setItem('mestres_cafe_user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao atualizar perfil';
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

