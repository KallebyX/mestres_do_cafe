import { supabase } from './supabase';

// Buscar todos os posts publicados
export const getAllBlogPosts = async (limit = 10, offset = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return { success: false, error: error.message, data: [], total: 0 };
    }

    return { success: true, data: data || [], total: count || 0 };
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

// Buscar post por ID
export const getBlogPostById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Erro ao buscar post:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Buscar posts por categoria
export const getBlogPostsByCategory = async (category, limit = 10, offset = 0) => {
  try {
    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar posts por categoria:', error);
      return { success: false, error: error.message, data: [], total: 0 };
    }

    return { success: true, data: data || [], total: count || 0 };
  } catch (error) {
    console.error('Erro ao buscar posts por categoria:', error);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

// Buscar posts em destaque
export const getFeaturedBlogPosts = async (limit = 3) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar posts em destaque:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar posts em destaque:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ADMIN: Buscar todos os posts (incluindo rascunhos)
export const getAllBlogPostsAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts admin:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar posts admin:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ADMIN: Criar novo post
export const createBlogPost = async (postData) => {
  try {
    const slug = postData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: postData.title,
        slug: slug,
        excerpt: postData.excerpt,
        content: postData.content,
        featured_image: postData.featured_image || '',
        category: postData.category || 'geral',
        tags: postData.tags || [],
        author_name: postData.author_name || 'Mestres do Café',
        status: postData.status || 'draft',
        is_featured: postData.is_featured || false,
        seo_title: postData.seo_title || postData.title,
        seo_description: postData.seo_description || postData.excerpt,
        published_at: postData.status === 'published' ? new Date().toISOString() : null
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, message: 'Post criado com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return { success: false, error: error.message, data: null };
  }
};

// ADMIN: Atualizar post
export const updateBlogPost = async (id, postData) => {
  try {
    const updates = {
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      featured_image: postData.featured_image,
      category: postData.category,
      tags: postData.tags,
      status: postData.status,
      is_featured: postData.is_featured,
      seo_title: postData.seo_title,
      seo_description: postData.seo_description,
      updated_at: new Date().toISOString()
    };

    // Se estiver publicando pela primeira vez
    if (postData.status === 'published' && !postData.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar post:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, message: 'Post atualizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return { success: false, error: error.message, data: null };
  }
};

// ADMIN: Deletar post
export const deleteBlogPost = async (id) => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Post deletado com sucesso!' };
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    return { success: false, error: error.message };
  }
};

// Incrementar visualizações
export const incrementPostViews = async (id) => {
  try {
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: id
    });

    if (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
  }
};

// Buscar categorias com contagem
export const getBlogCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('status', 'published');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Contar posts por categoria
    const categoryCount = {};
    data.forEach(post => {
      if (post.category) {
        categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
      }
    });

    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }));

    return { success: true, data: categories };
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return { success: false, error: error.message, data: [] };
  }
}; 