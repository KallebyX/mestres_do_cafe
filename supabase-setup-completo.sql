-- ========================================
-- MESTRES DO CAFÉ - SETUP COMPLETO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. TABELAS PRINCIPAIS
-- ========================================

-- Tabela de usuários (perfis)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'cliente_pf',
  phone TEXT,
  cpf_cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  company_name TEXT,
  company_segment TEXT,
  points INTEGER DEFAULT 100,
  level TEXT DEFAULT 'Bronze',
  role TEXT DEFAULT 'customer',
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT DEFAULT 'cafe',
  origin TEXT,
  roast_level TEXT DEFAULT 'medium',
  flavor_notes TEXT[],
  sca_score INTEGER DEFAULT 80,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  images TEXT[],
  weight TEXT DEFAULT '500g',
  altitude TEXT,
  process TEXT,
  variety TEXT,
  farm TEXT,
  farmer TEXT,
  harvest_year TEXT,
  certification TEXT[],
  brewing_methods TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  tracking_code TEXT,
  notes TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens dos pedidos
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  duration TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado', 'Todos os Níveis')),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  instructor TEXT NOT NULL,
  max_students INTEGER NOT NULL DEFAULT 12,
  enrolled_students INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  schedule TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de posts do blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT DEFAULT 'geral',
  tags TEXT[],
  author_name TEXT DEFAULT 'Mestres do Café',
  status TEXT DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for new users" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para products
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all products" ON products FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para courses
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all courses" ON courses FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para blog
CREATE POLICY "Published posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');

-- ========================================
-- 3. FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. DADOS INICIAIS - PRODUTOS
-- ========================================

INSERT INTO products (name, description, price, original_price, category, origin, roast_level, flavor_notes, sca_score, is_featured, is_active, stock, images, weight) VALUES
('Bourbon Amarelo Premium', 'Café especial com notas de chocolate e caramelo', 45.90, 52.90, 'especiais', 'Sul de Minas Gerais', 'medium', ARRAY['chocolate', 'caramelo', 'nozes'], 87, true, true, 50, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'], '500g'),
('Café Geisha Especial', 'Variedade Geisha com perfil floral único', 89.90, 105.90, 'especiais', 'Fazenda São Benedito', 'light', ARRAY['floral', 'jasmin', 'bergamota'], 92, true, true, 30, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600'], '500g'),
('Blend Signature', 'Blend especial com equilíbrio perfeito', 67.90, 75.90, 'blends', 'Seleção Especial', 'medium', ARRAY['chocolate', 'frutas'], 88, true, true, 40, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'], '500g'),
('Café Catuaí Vermelho', 'Variedade tradicional com corpo intenso', 38.90, 42.90, 'tradicionais', 'Serra da Mantiqueira', 'medium-dark', ARRAY['chocolate', 'castanhas'], 84, false, true, 60, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600'], '500g'),
('Café Mundo Novo', 'Café robusto com notas marcantes', 41.90, 48.90, 'tradicionais', 'Mogiana Paulista', 'dark', ARRAY['chocolate amargo', 'castanhas'], 85, false, true, 45, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'], '500g'),
('Café Icatu Amarelo', 'Variedade resistente com perfil frutado', 43.90, 49.90, 'especiais', 'Alto da Mogiana', 'medium-light', ARRAY['frutas cítricas', 'acidez'], 87, true, true, 35, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600'], '500g');

-- ========================================
-- 5. DADOS INICIAIS - CURSOS
-- ========================================

INSERT INTO courses (title, description, duration, level, price, original_price, instructor, max_students, image, tags, is_featured, schedule, location) VALUES
('Curso de Barista Básico', 'Aprenda os fundamentos da profissão de barista', '16 horas', 'Iniciante', 290.00, 350.00, 'Carlos Silva', 12, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', ARRAY['barista', 'básico', 'espresso'], true, 'Sábados das 8h às 17h', 'São Paulo - SP'),
('Torra Artesanal de Café', 'Domine a arte da torra artesanal', '12 horas', 'Intermediário', 450.00, 520.00, 'Ana Costa', 8, 'https://images.unsplash.com/photo-1442411210769-aa91ebe72cd4?w=600', ARRAY['torra', 'artesanal', 'intermediário'], true, 'Domingos das 9h às 18h', 'São Paulo - SP'),
('Cupping e Análise Sensorial', 'Desenvolva seu paladar profissional', '8 horas', 'Avançado', 380.00, 420.00, 'Roberto Lima', 10, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', ARRAY['cupping', 'análise', 'sensorial'], false, 'Sábado das 14h às 18h', 'São Paulo - SP'),
('Latte Art Avançado', 'Técnicas avançadas de arte no leite', '6 horas', 'Avançado', 320.00, 380.00, 'Marina Santos', 6, 'https://images.unsplash.com/photo-1442411210769-aa91ebe72cd4?w=600', ARRAY['latte art', 'avançado', 'técnicas'], true, 'Domingo das 14h às 20h', 'São Paulo - SP'),
('Métodos de Extração V60', 'Domine o método V60 de extração', '4 horas', 'Intermediário', 250.00, 300.00, 'Pedro Oliveira', 8, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600', ARRAY['v60', 'extração', 'filtrado'], false, 'Sábado das 10h às 14h', 'São Paulo - SP'),
('Café como Negócio', 'Empreendedorismo no mercado de café', '20 horas', 'Todos os Níveis', 590.00, 690.00, 'João Ferreira', 15, 'https://images.unsplash.com/photo-1442411210769-aa91ebe72cd4?w=600', ARRAY['negócio', 'empreendedorismo', 'gestão'], true, 'Fins de semana das 9h às 18h', 'São Paulo - SP');

-- ========================================
-- 6. DADOS INICIAIS - BLOG
-- ========================================

INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, status, is_featured, published_at) VALUES
('Como Escolher o Café Perfeito para Você', 'como-escolher-cafe-perfeito', 'Guia completo para escolher o café ideal baseado no seu gosto pessoal e método de preparo preferido.', 'Escolher o café perfeito pode parecer uma tarefa complexa, mas com as informações certas, você pode encontrar grãos que se alinhem perfeitamente com seu paladar. Este guia abrangente vai ajudá-lo a navegar pelo mundo dos cafés especiais...', 'Educação', ARRAY['café especial', 'escolha', 'guia'], 'published', true, NOW()),
('Métodos de Extração: Guia Completo', 'metodos-extracao-guia-completo', 'Explore os diferentes métodos de preparo e descubra qual é o ideal para destacar as características únicas de cada café.', 'Cada método de extração ressalta diferentes características do café. Desde o espresso italiano até o pour-over japonês, cada técnica tem sua personalidade...', 'Preparo', ARRAY['métodos', 'extração', 'preparo'], 'published', false, NOW()),
('Café Especial: Do Grão à Xícara', 'cafe-especial-grao-xicara', 'Conheça toda a jornada do café especial, desde o cultivo na fazenda até o preparo na sua xícara.', 'O café especial representa o que há de melhor na cafeicultura mundial. Com pontuação acima de 80 pontos na escala SCA, estes cafés possuem características sensoriais únicas...', 'Educação', ARRAY['café especial', 'qualidade', 'origem'], 'published', false, NOW());

-- ========================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);

-- ========================================
-- 8. FINALIZAÇÃO
-- ========================================

-- Verificar se tudo foi criado
SELECT 'Setup completo! Tabelas criadas:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Mostrar estatísticas
SELECT 
  'products' as tabela, 
  COUNT(*) as registros 
FROM products
UNION ALL
SELECT 
  'courses' as tabela, 
  COUNT(*) as registros 
FROM courses
UNION ALL
SELECT 
  'blog_posts' as tabela, 
  COUNT(*) as registros 
FROM blog_posts;

-- ========================================
-- ✅ SETUP COMPLETO - MESTRES DO CAFÉ
-- ======================================== 