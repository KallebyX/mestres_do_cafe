import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseAuthContext = createContext({});

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth deve ser usado dentro de SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Verificar sessão inicial
    getSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        // Se não encontrar perfil, criar um básico
        await createUserProfile(userId);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  const createUserProfile = async (userId) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const profileData = {
        id: userId,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
        user_type: 'cliente_pf',
        points: 0,
        level: 'Bronze',
        role: 'customer', // customer, admin, super_admin
        permissions: ['read'], // read, write, admin, super_admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { 
          success: false, 
          error: error.message || 'Erro ao fazer login'
        };
      }

      return { 
        success: true, 
        user: data.user 
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
      
      // Registrar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || 'Usuário'
          }
        }
      });

      if (error) {
        return { 
          success: false, 
          error: error.message || 'Erro ao criar conta'
        };
      }

      // Se o registro foi bem-sucedido e temos um usuário
      if (data.user) {
        // Criar perfil na tabela users
        const profileData = {
          id: data.user.id,
          email: email,
          name: userData.name || 'Usuário',
          phone: userData.phone || '',
          cpf_cnpj: userData.cpf_cnpj || '',
          company_name: userData.company_name || '',
          company_segment: userData.company_segment || '',
          user_type: userData.accountType || 'cliente_pf',
          points: 0,
          level: 'Bronze',
          role: 'customer',
          permissions: ['read'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert([profileData]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }
      }

      return { 
        success: true, 
        user: data.user,
        message: 'Conta criada com sucesso! Verifique seu email para confirmar.'
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erro inesperado ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        return { success: false, error: error.message };
      }
      
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao fazer logout' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Atualizar o estado local
      setProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar senha' };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao enviar email de recuperação' };
    }
  };

  const getCurrentUser = () => {
    return user;
  };

  const getUserProfile = () => {
    return profile;
  };

  // Sistema de permissões
  const hasPermission = (permission) => {
    if (!profile) return false;
    
    // Super admin tem todas as permissões
    if (profile.role === 'super_admin') return true;
    
    // Admin tem permissões de admin
    if (permission === 'admin' && (profile.role === 'admin' || profile.role === 'super_admin')) {
      return true;
    }
    
    // Verificar permissões específicas
    return profile.permissions?.includes(permission) || false;
  };

  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'super_admin';
  };

  const isSuperAdmin = () => {
    return profile?.role === 'super_admin';
  };

  // Funções administrativas
  const promoteToAdmin = async (userId) => {
    try {
      if (!isSuperAdmin()) {
        return { success: false, error: 'Permissão negada' };
      }

      const { error } = await supabase
        .from('users')
        .update({
          role: 'admin',
          permissions: ['read', 'write', 'admin'],
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao promover usuário' };
    }
  };

  const revokeAdmin = async (userId) => {
    try {
      if (!isSuperAdmin()) {
        return { success: false, error: 'Permissão negada' };
      }

      const { error } = await supabase
        .from('users')
        .update({
          role: 'customer',
          permissions: ['read'],
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao revogar permissões' };
    }
  };

  // Funções de pontos e gamificação
  const addPoints = async (points, reason = 'Atividade') => {
    try {
      if (!user || !profile) return { success: false, error: 'Usuário não autenticado' };

      const newPoints = (profile.points || 0) + points;
      const newLevel = calculateLevel(newPoints);

      const { error } = await supabase
        .from('users')
        .update({
          points: newPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Registrar histórico de pontos
      await supabase
        .from('points_history')
        .insert({
          user_id: user.id,
          points: points,
          reason: reason,
          created_at: new Date().toISOString()
        });

      setProfile(prev => ({ ...prev, points: newPoints, level: newLevel }));
      return { success: true, newLevel: newLevel !== profile.level };
    } catch (error) {
      return { success: false, error: 'Erro ao adicionar pontos' };
    }
  };

  const calculateLevel = (points) => {
    if (points >= 5000) return 'Diamante';
    if (points >= 3000) return 'Platina';
    if (points >= 1500) return 'Ouro';
    if (points >= 500) return 'Prata';
    return 'Bronze';
  };

  // Analytics e métricas
  const getUserStats = async () => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      return null;
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    resetPassword,
    getCurrentUser,
    getUserProfile,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    promoteToAdmin,
    revokeAdmin,
    addPoints,
    calculateLevel,
    getUserStats
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthContext; 