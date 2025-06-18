import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authUtils, authAPI } from '../lib/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user,
        error: null 
      };
    case 'LOGIN_ERROR':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: false, 
        user: null,
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null,
        loading: false,
        error: null 
      };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: { ...state.user, ...action.payload } 
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Verificar se há token salvo e validar
    const checkAuth = async () => {
      const token = authUtils.getToken();
      const user = authUtils.getUser();
      
      if (token && user) {
        try {
          const response = await authAPI.verifyToken();
          if (response.valid) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user: response.user } 
            });
          } else {
            authUtils.removeToken();
            authUtils.removeUser();
          }
        } catch (error) {
          authUtils.removeToken();
          authUtils.removeUser();
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(credentials);
      authUtils.setToken(response.access_token);
      authUtils.setUser(response.user);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user } 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: error.message 
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.register(userData);
      authUtils.setToken(response.access_token);
      authUtils.setUser(response.user);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user } 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: error.message 
      });
      throw error;
    }
  };

  const logout = () => {
    authUtils.removeToken();
    authUtils.removeUser();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    authUtils.setUser(updatedUser);
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    isAdmin: state.user?.user_type === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

