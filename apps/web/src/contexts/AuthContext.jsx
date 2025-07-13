import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Verificar se há um usuário logado no localStorage na inicialização
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        // Verificar se localStorage está disponível
        if (typeof localStorage === 'undefined') {
          if (isMounted) setLoading(false);
          return;
        }
        
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('auth_token');

        if (savedUser && savedToken && isMounted) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Recriar perfil baseado no usuário salvo
          const userProfile = {
            id: userData.id,
            email: userData.email,
            name: userData.name || 'Usuário',
            role: userData.is_admin ? 'admin' : 'customer',
            permissions: userData.is_admin ? ['read', 'write', 'admin'] : ['read'],
            user_type: userData.user_type || (userData.is_admin ? 'admin' : 'cliente_pf'),
            is_admin: userData.is_admin,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(userProfile);
          
          console.log('🔍 Restored user from localStorage:', userData);
          console.log('🔍 Restored profile:', userProfile);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        if (isMounted) clearAuth();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Limpar dados de autenticação
  const clearAuth = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login({ email, password });
      
      console.log('🔍 API Response:', response);

      if (response.success) {
        const userData = response.data.user;
        const isAdmin = userData.is_admin || false;
        
        console.log('🔍 User Data:', userData);
        console.log('🔍 Is Admin Check:', {
          'userData.is_admin': userData.is_admin,
          'final isAdmin': isAdmin
        });
        
        // Criar perfil baseado na resposta da API
        const userProfile = {
          id: userData.id,
          email: userData.email,
          name: userData.name || 'Usuário',
          role: isAdmin ? 'admin' : 'customer',
          permissions: isAdmin ? ['read', 'write', 'admin'] : ['read'],
          user_type: isAdmin ? 'admin' : 'cliente_pf', // Para compatibilidade
          is_admin: isAdmin,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('🔍 Created Profile:', userProfile);
        
        const authUser = {
          ...userData,
          token: response.data.access_token,
          user_type: isAdmin ? 'admin' : 'cliente_pf',
          is_admin: isAdmin
        };
        
        setUser(authUser);
        setProfile(userProfile);
        
        // Salvar no localStorage
        localStorage.setItem('auth_token', response.data.token || response.data.access_token);
        localStorage.setItem('user', JSON.stringify(authUser));
        
        return { success: true, user: authUser };
      } else {
        throw new Error(response.error || "Erro no login");
      }
    } catch (error) {
      const errorMessage = error.message || "Erro ao fazer login";
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
          message: "Cadastro realizado com sucesso! Faça login para continuar.",
          user: response.user,
        };
      } else {
        throw new Error(response.error || "Erro no cadastro");
      }
    } catch (error) {
      const errorMessage = error.message || "Erro ao fazer cadastro";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
        throw new Error("Usuário não autenticado");
      }

      // Por enquanto simular sucesso até ter endpoint real
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || "Erro ao atualizar perfil";
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
      admin: 3,
      cliente_pj: 2,
      cliente_pf: 1,
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

  // Funções de admin
  const getUserProfile = () => {
    return profile;
  };

  const getCurrentUser = () => {
    return user;
  };

  const isAdmin = useMemo(() => {
    return profile?.role === 'admin' || profile?.role === 'super_admin' || user?.is_admin;
  }, [profile?.role, user?.is_admin]);

  const isSuperAdmin = useMemo(() => {
    return profile?.role === 'super_admin';
  }, [profile?.role]);

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    isAuthenticated,
    clearError,
    clearAuth,
    getUserProfile,
    getCurrentUser,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
