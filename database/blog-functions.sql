-- Funções RPC para o Blog

-- Função para incrementar visualizações de um post
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$;

-- Função para atualizar contadores de likes de um post
CREATE OR REPLACE FUNCTION update_post_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET likes_count = (
    SELECT COUNT(*) 
    FROM blog_likes 
    WHERE blog_likes.post_id = post_id
  ),
  updated_at = NOW()
  WHERE id = post_id;
END;
$$;

-- Função para atualizar contadores de comentários de um post
CREATE OR REPLACE FUNCTION update_post_comments_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET comments_count = (
    SELECT COUNT(*) 
    FROM blog_comments 
    WHERE blog_comments.post_id = post_id 
    AND is_approved = true
  ),
  updated_at = NOW()
  WHERE id = post_id;
END;
$$;

-- Trigger para atualizar automaticamente o contador de likes
CREATE OR REPLACE FUNCTION trigger_update_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_post_likes_count(NEW.post_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_post_likes_count(OLD.post_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger para atualizar automaticamente o contador de comentários
CREATE OR REPLACE FUNCTION trigger_update_comments_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_post_comments_count(NEW.post_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_post_comments_count(OLD.post_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM update_post_comments_count(NEW.post_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Aplicar triggers
DROP TRIGGER IF EXISTS blog_likes_count_trigger ON blog_likes;
CREATE TRIGGER blog_likes_count_trigger
  AFTER INSERT OR DELETE ON blog_likes
  FOR EACH ROW EXECUTE FUNCTION trigger_update_likes_count();

DROP TRIGGER IF EXISTS blog_comments_count_trigger ON blog_comments;
CREATE TRIGGER blog_comments_count_trigger
  AFTER INSERT OR DELETE OR UPDATE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_update_comments_count();

-- Função para buscar posts relacionados por categoria
CREATE OR REPLACE FUNCTION get_related_posts(current_post_id UUID, post_category TEXT, limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER,
  likes_count INTEGER,
  comments_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.featured_image,
    bp.category,
    bp.author_name,
    bp.published_at,
    bp.views_count,
    bp.likes_count,
    bp.comments_count
  FROM blog_posts bp
  WHERE bp.status = 'published'
    AND bp.id != current_post_id
    AND bp.category = post_category
  ORDER BY bp.published_at DESC
  LIMIT limit_count;
END;
$$; 