import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase - Mestres do Café
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uicpqeruwwbnqbykymaj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpY3BxZXJ1d3dibnFieWt5bWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NjQ5NDAsImV4cCI6MjA1MzA0MDk0MH0.tJF4-AZKPz_9mVvQkjCYyC6VU0Km5CW5Gw2TpB8h8xw'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções de autenticação usando Supabase
export const supabaseAuth = {
  // Login com email e senha
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Cadastro com email e senha
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.user_type || 'cliente_pf',
            phone: userData.phone,
            cpf_cnpj: userData.cpf_cnpj,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zip_code: userData.zip_code,
            company_name: userData.company_name,
            company_segment: userData.company_segment
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Se o usuário foi criado com sucesso, criar perfil na tabela users
      if (data.user) {
        await supabaseAuth.createUserProfile(data.user.id, userData)
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Criar perfil do usuário na tabela personalizada
  async createUserProfile(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            name: userData.name,
            email: userData.email,
            user_type: userData.user_type || 'cliente_pf',
            phone: userData.phone,
            cpf_cnpj: userData.cpf_cnpj,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zip_code: userData.zip_code,
            company_name: userData.company_name,
            company_segment: userData.company_segment,
            points: 100, // Pontos de boas-vindas
            level: 'aprendiz',
            total_spent: 0,
            orders_count: 0,
            is_active: true
          }
        ])

      if (error) {
        console.error('Erro ao criar perfil:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      return { success: false, error: error.message }
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        return { success: false, error: error.message }
      }

      if (user) {
        // Buscar dados completos do perfil
        const profile = await supabaseAuth.getUserProfile(user.id)
        return {
          success: true,
          user: {
            ...user,
            profile: profile.data
          }
        }
      }

      return { success: false, error: 'Usuário não encontrado' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obter perfil completo do usuário
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Atualizar perfil
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Login demo para testes
  async demoLogin() {
    return await supabaseAuth.signIn('cliente@teste.com', '123456')
  },

  // Verificar se está autenticado
  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  // Obter sessão atual
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Listener para mudanças na autenticação
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

export default supabase 