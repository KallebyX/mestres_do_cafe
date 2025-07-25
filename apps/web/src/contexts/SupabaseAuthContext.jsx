import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
// Supabase removed - using local API
// import { supabase } from "@/lib/api"
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Auth system migrated from Supabase to local API
    
    // Verificar se há um token salvo localmente
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      console.log('🔍 Found saved token:', savedToken);
      // Poderemos verificar a validade do token aqui no futuro
    }
    
    setLoading(false);
  }, []);

  // Simplified functions without Supabase dependencies
  const getSession = async () => {
    // Using local token instead of Supabase session
    const token = localStorage.getItem('auth_token');
    return token ? { valid: true } : { valid: false };
  };

  const loadUserProfile = async (userId) => {
    // Profile management simplified for local API
    console.log('Profile loading simplified - Supabase removed');
  };

  const createUserProfile = async (userId) => {
    // Profile creation simplified for local API
    console.log('Profile creation simplified - Supabase removed');
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Use our local API only (Supabase removed)
      const apiResult = await authAPI.login({ email, password });
      
      console.log('🔍 API Result:', apiResult);
      
      if (apiResult.success) {
        const userData = apiResult.data.user;
        const isAdmin = apiResult.data.is_admin || userData.is_admin;
        
        console.log('🔍 User Data:', userData);
        console.log('🔍 Is Admin Check:', {
          'apiResult.data.is_admin': apiResult.data.is_admin,
          'userData.is_admin': userData.is_admin,
          'final isAdmin': isAdmin
        });
        
        // Criar um perfil baseado na resposta da API
        const tempProfile = {
          id: userData.id,
          email: userData.email,
          name: userData.name || 'Usuário',
          role: isAdmin ? 'admin' : 'customer',
          permissions: isAdmin ? ['read', 'write', 'admin'] : ['read'],
          provider: 'email',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('🔍 Created Profile:', tempProfile);
        
        // Simular um usuário autenticado
        const tempUser = {
          id: userData.id,
          email: userData.email,
          user_metadata: {
            name: userData.name || 'Usuário'
          }
        };
        
        setUser(tempUser);
        setProfile(tempProfile);
        
        // Salvar token no localStorage
        localStorage.setItem('auth_token', apiResult.data.token || apiResult.data.access_token);
        
        return { 
          success: true, 
          user: tempUser 
        };
      }
      
      return { 
        success: false, 
        error: apiResult.error || 'Erro ao fazer login'
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erro inesperado ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      
      // Use our local API for registration (Supabase removed)
      const apiResult = await authAPI.register({
        email,
        password,
        name: userData.name || 'Usuário',
        phone: userData.phone || '',
        cpf_cnpj: userData.cpf_cnpj || '',
        company_name: userData.company_name || '',
        company_segment: userData.company_segment || '',
        accountType: userData.accountType || 'individual'
      });

      if (apiResult.success) {
        return { 
          success: true, 
          user: apiResult.data,
          message: 'Conta criada com sucesso!'
        };
      } else {
        return { 
          success: false, 
          error: apiResult.error || 'Erro ao criar conta'
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Erro inesperado ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  // OAuth functions disabled (Supabase removed)
  const loginWithGoogle = async () => {
    return { 
      success: false, 
      error: 'Login com Google não disponível (Supabase removido)'
    };
  };

  const registerWithGoogle = async () => {
    return { 
      success: false, 
      error: 'Cadastro com Google não disponível (Supabase removido)'
    };
  };

  const logout = async () => {
    try {
      // Limpar token local
      localStorage.removeItem('auth_token');
      
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao fazer logout' };
    }
  };

  // Simplified functions without Supabase
  const updateProfile = async (updates) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    // Update local state only (Supabase removed)
    setProfile(prev => ({ ...prev, ...updates }));
    return { success: true };
  };

  const updatePassword = async (newPassword) => {
    return { success: false, error: 'Atualização de senha não disponível (Supabase removido)' };
  };

  const resetPassword = async (email) => {
    return { success: false, error: 'Recuperação de senha não disponível (Supabase removido)' };
  };

  const getCurrentUser = () => {
    return user;
  };

  const getUserProfile = () => {
    return profile;
  };

  // Sistema de permissões - MEMORIZADO para evitar loops
  const hasPermission = useCallback((permission) => {
    if (!profile) return false;
    
    // Super admin tem todas as permissões
    if (profile.role === 'super_admin') return true;
    
    // Admin tem permissões de admin
    if (permission === 'admin' && (profile.role === 'admin' || profile.role === 'super_admin')) {
      return true;
    }
    
    // Verificar permissões específicas
    return profile.permissions?.includes(permission) || false;
  }, [profile]);

  const isAdmin = useMemo(() => {
    return profile?.role === 'admin' || profile?.role === 'super_admin';
  }, [profile?.role]);

  const isSuperAdmin = useMemo(() => {
    return profile?.role === 'super_admin';
  }, [profile?.role]);

  // Simplified administrative functions (Supabase removed)
  const promoteToAdmin = async (userId) => {
    return { success: false, error: 'Função administrativa não disponível (Supabase removido)' };
  };

  const revokeAdmin = async (userId) => {
    return { success: false, error: 'Função administrativa não disponível (Supabase removido)' };
  };

  const addPoints = async (points, reason = 'Atividade') => {
    if (!user || !profile) return { success: false, error: 'Usuário não autenticado' };
    
    const newPoints = (profile.points || 0) + points;
    const newLevel = calculateLevel(newPoints);
    
    setProfile(prev => ({ ...prev, points: newPoints, level: newLevel }));
    return { success: true, newLevel: newLevel !== profile.level };
  };

  const getUserStats = async () => {
    return null; // Statistics not available (Supabase removed)
  };

  const activateAdminCreatedAccount = async (password) => {
    return { success: false, error: 'Ativação de conta não disponível (Supabase removido)' };
  };

  const requestPasswordReset = async (email) => {
    return { success: false, error: 'Recuperação de senha não disponível (Supabase removido)' };
  };

  const confirmPasswordReset = async (newPassword) => {
    return { success: false, error: 'Redefinição de senha não disponível (Supabase removido)' };
  };

  const calculateLevel = (points) => {
    if (points >= 5000) return 'Diamante';
    if (points >= 3000) return 'Platina';
    if (points >= 1500) return 'Ouro';
    if (points >= 500) return 'Prata';
    return 'Bronze';
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    logout,
    updateProfile,
    updatePassword,
    resetPassword,
    requestPasswordReset,
    confirmPasswordReset,
    getCurrentUser,
    getUserProfile,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    promoteToAdmin,
    revokeAdmin,
    addPoints,
    calculateLevel,
    getUserStats,
    activateAdminCreatedAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 