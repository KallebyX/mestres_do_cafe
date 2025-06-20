import { supabase } from './supabase';

// Buscar todos os produtos ativos
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Buscar produtos em destaque
export const getFeaturedProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sca_score', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Buscar produto por ID
export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Buscar produtos por categoria
export const getProductsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('price', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Buscar produtos com filtros
export const getProductsWithFilters = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    // Aplicar filtros
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.minScore) {
      query = query.gte('sca_score', filters.minScore);
    }

    if (filters.origin) {
      query = query.ilike('origin', `%${filters.origin}%`);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,origin.ilike.%${filters.search}%`
      );
    }

    // Ordenação
    if (filters.sortBy) {
      const ascending = filters.sortOrder !== 'desc';
      query = query.order(filters.sortBy, { ascending });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Limite de resultados
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar produtos com filtros:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar produtos com filtros:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Formatar preço brasileiro
export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

// Calcular desconto percentual
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Obter primeira imagem do produto
export const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400';
};

export default {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  getProductsWithFilters,
  formatPrice,
  calculateDiscount,
  getProductImage
}; 