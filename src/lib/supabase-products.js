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

// Buscar todos os produtos (incluindo inativos) - para admin
export const getAllProductsAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos admin:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar produtos admin:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Criar novo produto
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        origin: productData.origin || '',
        roast_level: productData.roast_level || 'medium',
        sca_score: productData.sca_score || 80,
        images: productData.images || [],
        stock: parseInt(productData.stock) || 0,
        is_active: productData.is_active !== false,
        is_featured: productData.is_featured || false,
        processing_method: productData.processing_method || '',
        altitude: productData.altitude || '',
        harvest_year: productData.harvest_year || new Date().getFullYear(),
        flavor_notes: productData.flavor_notes || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, message: 'Produto criado com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Atualizar produto
export const updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        origin: productData.origin,
        roast_level: productData.roast_level,
        sca_score: productData.sca_score,
        images: productData.images,
        stock: parseInt(productData.stock),
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        processing_method: productData.processing_method,
        altitude: productData.altitude,
        harvest_year: productData.harvest_year,
        flavor_notes: productData.flavor_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, message: 'Produto atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Deletar produto (soft delete)
export const deleteProduct = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, message: 'Produto removido com sucesso!' };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Ativar/Desativar produto
export const toggleProductStatus = async (id, isActive) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao alterar status do produto:', error);
      return { success: false, error: error.message, data: null };
    }

    return { 
      success: true, 
      data, 
      message: `Produto ${isActive ? 'ativado' : 'desativado'} com sucesso!` 
    };
  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Atualizar estoque do produto
export const updateProductStock = async (id, stock) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: parseInt(stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar estoque:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, message: 'Estoque atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    return { success: false, error: error.message, data: null };
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

// Buscar produto por ID (admin - inclui inativos)
export const getProductByIdAdmin = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar produto admin:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar produto admin:', error);
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

// Obter categorias disponíveis
export const getProductCategories = () => [
  'espresso',
  'filtrado',
  'especial',
  'descafeinado',
  'blend',
  'microlote'
];

// Obter níveis de torra disponíveis
export const getRoastLevels = () => [
  'light',
  'medium-light', 
  'medium',
  'medium-dark',
  'dark'
];

// Validar dados do produto
export const validateProductData = (productData) => {
  const errors = [];

  if (!productData.name || productData.name.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }

  if (!productData.description || productData.description.trim().length < 10) {
    errors.push('Descrição deve ter pelo menos 10 caracteres');
  }

  if (!productData.price || parseFloat(productData.price) <= 0) {
    errors.push('Preço deve ser maior que zero');
  }

  if (!productData.category) {
    errors.push('Categoria é obrigatória');
  }

  if (!productData.stock || parseInt(productData.stock) < 0) {
    errors.push('Estoque deve ser maior ou igual a zero');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  getAllProducts,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  updateProductStock,
  getFeaturedProducts,
  getProductById,
  getProductByIdAdmin,
  getProductsByCategory,
  getProductsWithFilters,
  formatPrice,
  calculateDiscount,
  getProductImage,
  getProductCategories,
  getRoastLevels,
  validateProductData
}; 