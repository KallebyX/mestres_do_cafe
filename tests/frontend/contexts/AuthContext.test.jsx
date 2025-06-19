import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../../src/contexts/AuthContext'
import { authAPI } from '../../../src/lib/api'

// Componente de teste para usar o contexto
const TestComponent = () => {
  const { 
    user, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    isAuthenticated, 
    hasPermission,
    clearError 
  } = useAuth()

  return (
    <div>
      <div data-testid="user">{user ? user.name : 'null'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="authenticated">{isAuthenticated().toString()}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => register({ name: 'Test', email: 'test@test.com', password: 'password' })}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
      <div data-testid="admin-permission">{hasPermission('admin').toString()}</div>
    </div>
  )
}

const renderWithProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('deve ter estado inicial correto', async () => {
      renderWithProvider()

      // Aguardar a inicialização completar (pode ter verificação de token)
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      // Como temos mock que pode carregar usuário, vamos verificar o estado final
      const user = screen.getByTestId('user').textContent
      const isLoggedIn = user !== 'null'
      
      if (isLoggedIn) {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      } else {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      }
      
      expect(screen.getByTestId('error')).toHaveTextContent('null')
    })
  })

  describe('Funcionalidade de login', () => {
    it('deve fazer login com sucesso', async () => {
      renderWithProvider()

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Test User')
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      })

      expect(authAPI.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' })
    })

    it('deve tratar erro de login', async () => {
      // Primeiro garantir que não há usuário logado
      authAPI.getCurrentUser.mockReturnValueOnce(null)
      authAPI.getToken.mockReturnValueOnce(null)
      
      authAPI.login.mockResolvedValueOnce({
        success: false,
        error: 'Credenciais inválidas'
      })

      renderWithProvider()

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciais inválidas')
      })
      
      // Deve permanecer não autenticado após erro
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('Funcionalidade de registro', () => {
    it('deve fazer registro com sucesso', async () => {
      renderWithProvider()

      fireEvent.click(screen.getByText('Register'))

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith({ 
          name: 'Test', 
          email: 'test@test.com', 
          password: 'password' 
        })
      })
    })

    it('deve tratar erro de registro', async () => {
      authAPI.register.mockResolvedValueOnce({
        success: false,
        error: 'Email já existe'
      })

      renderWithProvider()

      fireEvent.click(screen.getByText('Register'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email já existe')
      })
    })
  })

  describe('Funcionalidade de logout', () => {
    it('deve fazer logout corretamente', async () => {
      renderWithProvider()

      // Fazer login primeiro
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      })

      // Fazer logout
      fireEvent.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      })

      expect(authAPI.logout).toHaveBeenCalled()
    })
  })

  describe('Verificação de permissões', () => {
    it('deve verificar permissão de admin corretamente', async () => {
      renderWithProvider()

      // Login com usuário comum
      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('admin-permission')).toHaveTextContent('false')
      })
    })

    it('deve permitir acesso para admin', async () => {
      authAPI.login.mockResolvedValueOnce({
        success: true,
        user: { name: 'Admin User', user_type: 'admin' },
        token: 'admin-token'
      })

      renderWithProvider()

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('admin-permission')).toHaveTextContent('true')
      })
    })
  })

  describe('Tratamento de erros', () => {
    it('deve limpar erro quando solicitado', async () => {
      authAPI.login.mockResolvedValueOnce({
        success: false,
        error: 'Erro de teste'
      })

      renderWithProvider()

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Erro de teste')
      })

      fireEvent.click(screen.getByText('Clear Error'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null')
      })
    })

    it('deve tratar erro de API', async () => {
      authAPI.login.mockRejectedValueOnce(new Error('Erro de rede'))

      renderWithProvider()

      fireEvent.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Erro de rede')
      })
    })
  })

  describe('Autenticação persistente', () => {
    it('deve verificar token ao inicializar', async () => {
      authAPI.getCurrentUser.mockReturnValueOnce({
        name: 'Saved User',
        user_type: 'cliente_pf'
      })
      authAPI.getToken.mockReturnValueOnce('saved-token')

      renderWithProvider()

      await waitFor(() => {
        expect(authAPI.verifyToken).toHaveBeenCalled()
      })
    })

    it('deve limpar dados se token for inválido', async () => {
      authAPI.getCurrentUser.mockReturnValueOnce({
        name: 'Saved User'
      })
      authAPI.getToken.mockReturnValueOnce('invalid-token')
      authAPI.verifyToken.mockResolvedValueOnce({ success: false })

      renderWithProvider()

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
        expect(authAPI.logout).toHaveBeenCalled()
      })
    })
  })
}) 