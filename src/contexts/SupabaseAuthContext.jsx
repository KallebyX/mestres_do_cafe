import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseAuth, onAuthStateChange } from '../lib/supabase';

const SupabaseAuthContext = createContext();

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth deve ser usado dentro de um SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar se há uma sessão ativa
        const sessionData = await supabaseAuth.getSession();
        if (sessionData) {
          setSession(sessionData);
          
          // Buscar dados completos do usuário
          const userResult = await supabaseAuth.getCurrentUser();
          if (userResult.success) {
            setUser(userResult.user);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      setSession(session);
      
      if (session?.user) {
        // Buscar dados completos do usuário
        const userResult = await supabaseAuth.getCurrentUser();
        if (userResult.success) {
          setUser(userResult.user);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await supabaseAuth.signIn(email, password);

      if (result.success) {
        // O listener onAuthStateChange vai atualizar o estado automaticamente
        return { success: true, user: result.user, session: result.session };
      } else {
        throw new Error(result.error);
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

      const { email, password, ...profileData } = userData;
      
      const result = await supabaseAuth.signUp(email, password, {
        ...profileData,
        email
      });

      if (result.success) {
        return {
          success: true,
          message: 'Conta criada com sucesso! Você ganhou 100 pontos de boas-vindas!',
          user: result.user,
          session: result.session
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao criar conta';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setLoading(true);
      const result = await supabaseAuth.signOut();
      
      if (result.success) {
        setUser(null);
        setSession(null);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil do usuário
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const result = await supabaseAuth.updateProfile(user.id, profileData);

      if (result.success) {
        // Atualizar estado local
        setUser(prev => ({
          ...prev,
          profile: { ...prev.profile, ...profileData }
        }));
        
        return { success: true, user: user };
      } else {
        throw new Error(result.error);
      }
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
    if (!user?.profile) return false;

    const roles = {
      'admin': 3,
      'cliente_pj': 2,
      'cliente_pf': 1
    };

    const userRole = roles[user.profile.user_type] || 0;
    const requiredLevel = roles[requiredRole] || 0;

    return userRole >= requiredLevel;
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return !!session && !!user;
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  // Login demo para testes
  const demoLogin = async () => {
    return await login('cliente@teste.com', '123456');
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    isAuthenticated,
    clearError,
    demoLogin
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthContext; 