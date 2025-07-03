/**
 * 🌟 API de Testimonials (Depoimentos)
 * Sistema dos Mestres do Café - Supabase
 */

import { supabase } from './supabase';

// ============================================
// 📖 BUSCAR TESTIMONIALS
// ============================================

/**
 * Buscar testimonials em destaque para a Landing Page
 * @param {number} limit - Quantidade máxima de testimonials (padrão: 3)
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getFeaturedTestimonials = async (limit = 3) => {
  try {
    console.log('🌟 Buscando testimonials em destaque...');

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar testimonials em destaque:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ ${data?.length || 0} testimonials em destaque carregados`);
    return { success: true, data: data || [] };

  } catch (error) {
    console.error('❌ Erro na API getFeaturedTestimonials:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Buscar todos os testimonials ativos
 * @param {number} limit - Quantidade máxima de testimonials (padrão: 10)
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getAllTestimonials = async (limit = 10) => {
  try {
    console.log('🌟 Buscando todos os testimonials...');

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar testimonials:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ ${data?.length || 0} testimonials carregados`);
    return { success: true, data: data || [] };

  } catch (error) {
    console.error('❌ Erro na API getAllTestimonials:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Buscar testimonials por rating
 * @param {number} minRating - Rating mínimo (1-5)
 * @param {number} limit - Quantidade máxima de testimonials (padrão: 5)
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getTestimonialsByRating = async (minRating = 4, limit = 5) => {
  try {
    console.log(`🌟 Buscando testimonials com rating >= ${minRating}...`);

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .gte('rating', minRating)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar testimonials por rating:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ ${data?.length || 0} testimonials com rating >= ${minRating} carregados`);
    return { success: true, data: data || [] };

  } catch (error) {
    console.error('❌ Erro na API getTestimonialsByRating:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================
// 📊 ESTATÍSTICAS DE TESTIMONIALS
// ============================================

/**
 * Obter estatísticas dos testimonials
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const getTestimonialsStats = async () => {
  try {
    console.log('📊 Calculando estatísticas de testimonials...');

    const { data, error } = await supabase
      .from('testimonials')
      .select('rating, is_featured, is_active')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Erro ao buscar estatísticas de testimonials:', error);
      return { success: false, error: error.message, data: {} };
    }

    const stats = {
      total: data.length,
      featured: data.filter(t => t.is_featured).length,
      averageRating: data.length > 0 ? 
        (data.reduce((sum, t) => sum + t.rating, 0) / data.length).toFixed(1) : 0,
      ratingDistribution: {
        5: data.filter(t => t.rating === 5).length,
        4: data.filter(t => t.rating === 4).length,
        3: data.filter(t => t.rating === 3).length,
        2: data.filter(t => t.rating === 2).length,
        1: data.filter(t => t.rating === 1).length,
      }
    };

    console.log('✅ Estatísticas de testimonials calculadas:', stats);
    return { success: true, data: stats };

  } catch (error) {
    console.error('❌ Erro na API getTestimonialsStats:', error);
    return { success: false, error: error.message, data: {} };
  }
};

// ============================================
// ✍️ ADMIN: GERENCIAR TESTIMONIALS
// ============================================

/**
 * Criar novo testimonial (admin only)
 * @param {object} testimonialData - Dados do testimonial
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const createTestimonial = async (testimonialData) => {
  try {
    console.log('✍️ Criando novo testimonial...');

    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonialData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar testimonial:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Testimonial criado com sucesso:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Erro na API createTestimonial:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualizar testimonial (admin only)
 * @param {number} id - ID do testimonial
 * @param {object} updates - Dados para atualizar
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const updateTestimonial = async (id, updates) => {
  try {
    console.log(`✍️ Atualizando testimonial ${id}...`);

    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar testimonial:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Testimonial atualizado com sucesso:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Erro na API updateTestimonial:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletar testimonial (admin only)
 * @param {number} id - ID do testimonial
 * @returns {Promise<{success: boolean}>}
 */
export const deleteTestimonial = async (id) => {
  try {
    console.log(`🗑️ Deletando testimonial ${id}...`);

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar testimonial:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Testimonial deletado com sucesso');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro na API deleteTestimonial:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Alternar status de destaque (admin only)
 * @param {number} id - ID do testimonial
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const toggleFeaturedTestimonial = async (id) => {
  try {
    console.log(`⭐ Alternando status de destaque do testimonial ${id}...`);

    // Primeiro buscar o status atual
    const { data: current, error: fetchError } = await supabase
      .from('testimonials')
      .select('is_featured')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar testimonial:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Alternar o status
    const { data, error } = await supabase
      .from('testimonials')
      .update({ is_featured: !current.is_featured })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar status de destaque:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Status de destaque atualizado:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Erro na API toggleFeaturedTestimonial:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 🔍 VERIFICAÇÃO DE TABELA
// ============================================

/**
 * Verificar se a tabela testimonials existe
 * @returns {Promise<boolean>}
 */
export const testimonialsTableExists = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.log('⚠️ Tabela testimonials não encontrada');
    return false;
  }
};

// Exportar todas as funções
export default {
  getFeaturedTestimonials,
  getAllTestimonials, 
  getTestimonialsByRating,
  getTestimonialsStats,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleFeaturedTestimonial,
  testimonialsTableExists
}; 