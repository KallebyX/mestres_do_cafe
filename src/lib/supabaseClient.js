import { _createClient } from '@supabase/supabase-js';

// Configurações do Supabase
// Suporte tanto para Vite (frontend) quanto Node.js (scripts)
const _isNode = typeof window === 'undefined' && typeof process !== 'undefined';
const _isBrowser = typeof window !== 'undefined';

// Credenciais padrão para fallback
const _DEFAULT_SUPABASE_URL = 'https://uicpqeruwwbnqbykymaj.supabase.co';
const _DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpY3BxZXJ1d3dibnFieWt5bWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODM3NjksImV4cCI6MjA2NTk1OTc2OX0.hn-R8WzjKEqnusblaIWKZjCbm-nDqfBP5VQKymshMsM';

const _supabaseUrl = isBrowser 
  ? (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL)
  : (isNode ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL) : DEFAULT_SUPABASE_URL);

const _supabaseAnonKey = isBrowser 
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY)
  : (isNode ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY) : DEFAULT_SUPABASE_ANON_KEY);

const _supabaseServiceKey = isBrowser 
  ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY 
  : (isNode ? (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) : null);

// Verificação mais flexível - apenas log se não encontrar as variáveis
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas, usando credenciais padrão');
} else {
  console.log('✅ Configurações do Supabase carregadas com sucesso');
}

// Cliente principal para operações normais (frontend)
export const _supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'mestres-do-cafe-frontend'
    }
  }
});

// Cliente administrativo para operações que necessitam Service Role
export const _supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'mestres-do-cafe-admin'
        }
      }
    })
  : null;

// =============================================
// HELPERS GENÉRICOS REUTILIZÁVEIS
// =============================================

/**
 * Buscar todos os registros de uma tabela
 * @param {string} tableName - Nome da tabela
 * @param {object} options - Opções de ordenação e limite
 * @returns {Promise<{success: boolean, data: any[], error?: string}>}
 */
export const _getAll = async (tableName, options = {}) => {
  try {
    const { 
      orderBy = 'created_at', 
      ascending = false, 
      limit = null,
      select = '*'
    } = options;

    let _query = supabase
      .from(tableName)
      .select(select)
      .order(orderBy, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Erro ao buscar ${tableName}:`, error);
      return { success: false, data: [], error: error.message };
    }

    console.log(`✅ ${tableName}: ${data?.length || 0} registros carregados`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error(`❌ Erro genérico ao buscar ${tableName}:`, error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Buscar registro por ID
 * @param {string} tableName - Nome da tabela
 * @param {string|number} id - ID do registro
 * @param {string} select - Campos a selecionar
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export const _getById = async (tableName, id, select = '*') => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`❌ Erro ao buscar ${tableName} ID ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }

    console.log(`✅ ${tableName} ID ${id}: registro encontrado`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Erro genérico ao buscar ${tableName} ID ${id}:`, error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Buscar registros com filtros
 * @param {string} tableName - Nome da tabela
 * @param {object} filters - Filtros a aplicar
 * @param {object} options - Opções adicionais
 * @returns {Promise<{success: boolean, data: any[], error?: string}>}
 */
export const _getFiltered = async (tableName, filters = {}, options = {}) => {
  try {
    const { 
      orderBy = 'created_at', 
      ascending = false, 
      limit = null,
      select = '*'
    } = options;

    let _query = supabase.from(tableName).select(select);

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          query = query.eq(key, value);
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Ordenação
    query = query.order(orderBy, { ascending });

    // Limite
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Erro ao buscar ${tableName} com filtros:`, error);
      return { success: false, data: [], error: error.message };
    }

    console.log(`✅ ${tableName} filtrado: ${data?.length || 0} registros`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error(`❌ Erro genérico ao buscar ${tableName} filtrado:`, error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Inserir novo registro
 * @param {string} tableName - Nome da tabela
 * @param {object} data - Dados a inserir
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export const _insertRecord = async (tableName, data) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error(`❌ Erro ao inserir em ${tableName}:`, error);
      return { success: false, data: null, error: error.message };
    }

    console.log(`✅ ${tableName}: registro inserido com ID ${result.id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Erro genérico ao inserir em ${tableName}:`, error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Atualizar registro
 * @param {string} tableName - Nome da tabela
 * @param {string|number} id - ID do registro
 * @param {object} data - Dados a atualizar
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export const _updateRecord = async (tableName, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`❌ Erro ao atualizar ${tableName} ID ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }

    console.log(`✅ ${tableName} ID ${id}: registro atualizado`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Erro genérico ao atualizar ${tableName} ID ${id}:`, error);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Deletar registro (soft delete se tiver campo is_active)
 * @param {string} tableName - Nome da tabela
 * @param {string|number} id - ID do registro
 * @param {boolean} softDelete - Se deve fazer soft delete
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export const _deleteRecord = async (tableName, id, softDelete = true) => {
  try {
    let result;
    
    if (softDelete) {
      // Tentar soft delete primeiro
      const { data, error } = await supabase
        .from(tableName)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (!error) {
        console.log(`✅ ${tableName} ID ${id}: soft delete realizado`);
        return { success: true, data };
      }
    }

    // Hard delete
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`❌ Erro ao deletar ${tableName} ID ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }

    console.log(`✅ ${tableName} ID ${id}: hard delete realizado`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Erro genérico ao deletar ${tableName} ID ${id}:`, error);
    return { success: false, data: null, error: error.message };
  }
};

// =============================================
// HELPERS ESPECÍFICOS PARA SUPABASE STORAGE
// =============================================

/**
 * Obter URL pública de arquivo no Storage
 * @param {string} bucket - Nome do bucket
 * @param {string} path - Caminho do arquivo
 * @returns {string} URL pública
 */
export const _getPublicURL = (bucket, path) => {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data?.publicUrl || null;
};

/**
 * Upload de arquivo para o Storage
 * @param {string} bucket - Nome do bucket
 * @param {string} path - Caminho onde salvar
 * @param {File} file - Arquivo a fazer upload
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export const _uploadFile = async (bucket, path, file) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`❌ Erro ao fazer upload para ${bucket}/${path}:`, error);
      return { success: false, data: null, error: error.message };
    }

    console.log(`✅ Upload concluído: ${bucket}/${path}`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Erro genérico no upload:`, error);
    return { success: false, data: null, error: error.message };
  }
};

// =============================================
// HELPERS DE VALIDAÇÃO E UTILITÁRIOS
// =============================================

/**
 * Verificar se Supabase está conectado
 * @returns {Promise<boolean>}
 */
export const _checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    return !error;
  } catch {
    return false;
  }
};

/**
 * Obter estatísticas rápidas de uma tabela
 * @param {string} tableName - Nome da tabela
 * @returns {Promise<{total: number, active?: number}>}
 */
export const _getTableStats = async (tableName) => {
  try {
    const { count: total } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    let _active = null;
    
    // Se a tabela tem campo is_active, contar apenas ativos
    try {
      const { count: activeCount } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      active = activeCount;
    } catch {
      // Tabela não tem campo is_active
    }

    return { total: total || 0, active };
  } catch (error) {
    console.error(`❌ Erro ao obter stats de ${tableName}:`, error);
    return { total: 0, active: null };
  }
};

export default {
  supabase,
  supabaseAdmin,
  getAll,
  getById,
  getFiltered,
  insertRecord,
  updateRecord,
  deleteRecord,
  getPublicURL,
  uploadFile,
  checkConnection,
  getTableStats
}; 