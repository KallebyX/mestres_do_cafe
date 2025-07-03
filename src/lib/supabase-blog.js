import { _supabase } from './supabase';

// Buscar todos os posts publicados
export const _getAllBlogPosts = async (limit = 10, offset = 0) => {
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
export const _getBlogPostById = async (id) => {
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

// Buscar post por slug
export const _getBlogPostBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Erro ao buscar post por slug:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar post por slug:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Buscar posts por categoria
export const _getBlogPostsByCategory = async (category, limit = 10, offset = 0) => {
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
export const _getFeaturedBlogPosts = async (limit = 3) => {
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
export const _getAllBlogPostsAdmin = async () => {
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
export const _createBlogPost = async (postData) => {
  try {
    const _slug = postData.title
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
export const _updateBlogPost = async (id, postData) => {
  try {
    const _updates = {
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
export const _deleteBlogPost = async (id) => {
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
export const _incrementPostViews = async (id) => {
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

// FUNCIONALIDADES DE INTERAÇÃO SOCIAL

// Curtir/descurtir post
export const _togglePostLike = async (postId, userId) => {
  try {
    // Verificar se já curtiu
    const { data: existingLike, error: checkError } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar like:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingLike) {
      // Remover like
      const { error: deleteError } = await supabase
        .from('blog_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Erro ao remover like:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // O contador será atualizado automaticamente pelo trigger

      return { success: true, liked: false, message: 'Like removido!' };
    } else {
      // Adicionar like
      const { error: insertError } = await supabase
        .from('blog_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) {
        console.error('Erro ao adicionar like:', insertError);
        return { success: false, error: insertError.message };
      }

      // O contador será atualizado automaticamente pelo trigger

      return { success: true, liked: true, message: 'Post curtido!' };
    }
  } catch (error) {
    console.error('Erro ao curtir/descurtir post:', error);
    return { success: false, error: error.message };
  }
};

// Verificar se usuário curtiu o post
export const _checkUserLiked = async (postId, userId) => {
  try {
    const { data, error } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar like:', error);
      return { success: false, error: error.message, liked: false };
    }

    return { success: true, liked: !!data };
  } catch (error) {
    console.error('Erro ao verificar like:', error);
    return { success: false, error: error.message, liked: false };
  }
};

// Adicionar comentário
export const _addComment = async (postId, userId, content, userName) => {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content,
        user_name: userName
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      return { success: false, error: error.message };
    }

    // O contador será atualizado automaticamente pelo trigger

    return { success: true, data, message: 'Comentário adicionado!' };
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return { success: false, error: error.message };
  }
};

// Buscar comentários do post
export const _getPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Remover comentário (apenas o autor ou admin)
export const _deleteComment = async (commentId, userId) => {
  try {
    // Buscar o comentário para verificar se é do usuário
    const { data: comment, error: fetchError } = await supabase
      .from('blog_comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar comentário:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Verificar se é o autor do comentário
    if (comment.user_id !== userId) {
      return { success: false, error: 'Você só pode deletar seus próprios comentários' };
    }

    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Erro ao deletar comentário:', error);
      return { success: false, error: error.message };
    }

    // O contador será atualizado automaticamente pelo trigger

    return { success: true, message: 'Comentário removido!' };
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    return { success: false, error: error.message };
  }
};

// Registrar compartilhamento
export const _recordShare = async (postId, platform) => {
  try {
    const { error } = await supabase
      .from('blog_shares')
      .insert([{
        post_id: postId,
        platform: platform
      }]);

    if (error) {
      console.error('Erro ao registrar compartilhamento:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Compartilhamento registrado!' };
  } catch (error) {
    console.error('Erro ao registrar compartilhamento:', error);
    return { success: false, error: error.message };
  }
};

// Buscar categorias com contagem
export const _getBlogCategories = async () => {
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
    const _categoryCount = {};
    data.forEach(_post => {
      if (post.category) {
        categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
      }
    });

    const _categories = Object.entries(categoryCount).map(([name, count]) => ({
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