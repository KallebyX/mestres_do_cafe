-- =========================================
-- SETUP COMPLETO BANCO MESTRES DO CAFÉ
-- Execute este SQL no Supabase SQL Editor
-- =========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de usuários (já existe, mas vamos garantir)
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
  permissions TEXT[] DEFAULT ARRAY['read'],
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabela de produtos (atualizada)
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
  variety TEXT,
  process TEXT,
  farm TEXT,
  farmer TEXT,
  harvest_year INTEGER,
  certifications TEXT[],
  brewing_methods TEXT[],
  processing_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  tracking_code TEXT,
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB -- Para manter dados do produto no momento da compra
);

-- 5. Tabela de blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT DEFAULT 'geral',
  tags TEXT[],
  author_id UUID REFERENCES users(id),
  author_name TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabela de comentários do blog
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES blog_comments(id), -- Para respostas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Tabela de gamificação (pontos)
CREATE TABLE IF NOT EXISTS points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID, -- ID do pedido, comentário, etc.
  reference_type TEXT, -- 'order', 'comment', 'review', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Tabela de reviews/avaliações
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Tabela de categorias do blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  posts_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================
-- INSERIR DADOS INICIAIS
-- =========================================

-- Produtos reais
INSERT INTO products (name, description, detailed_description, price, original_price, category, origin, roast_level, flavor_notes, sca_score, is_featured, is_active, stock, images, weight, altitude, variety, process, farm, farmer, harvest_year, certifications, brewing_methods) VALUES
('Café Bourbon Amarelo Premium', 
 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo.',
 'O Café Bourbon Amarelo Premium é uma verdadeira obra-prima da cafeicultura brasileira. Cultivado nas terras férteis do Cerrado Mineiro, em altitudes que variam entre 1.000 e 1.200 metros, este café especial representa o que há de melhor na tradição cafeeira nacional. As plantas da variedade Bourbon Amarelo, conhecidas por sua baixa produtividade mas alta qualidade, são cultivadas sob condições climáticas ideais.',
 45.90, 52.90, 'especial', 'Cerrado Mineiro, MG', 'medium', 
 ARRAY['Chocolate', 'Caramelo', 'Nozes'], 86, true, true, 50,
 ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'],
 '500g', '1.000-1.200m', 'Bourbon Amarelo', 'Natural', 'Fazenda São Bento', 'João Carlos Silva', 2023,
 ARRAY['UTZ Certified', 'Rainforest Alliance'], ARRAY['Espresso', 'Filtrado', 'Prensa Francesa']),

('Café Geisha Especial',
 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
 'O Café Geisha Especial é considerado uma das variedades mais nobres do mundo. Originária da Etiópia e cultivada com extremo cuidado nas montanhas do Sul de Minas, esta variedade rara oferece uma experiência sensorial incomparável.',
 89.90, 105.90, 'premium', 'Sul de Minas, MG', 'light',
 ARRAY['Floral', 'Cítrico', 'Bergamota'], 92, true, true, 25,
 ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'],
 '250g', '1.400m', 'Geisha', 'Lavado', 'Fazenda Esperança', 'Maria Santos', 2023,
 ARRAY['Organic', 'Fair Trade'], ARRAY['Pour Over', 'V60', 'Chemex']),

('Café Arábica Torrado Artesanal',
 'Blend exclusivo de grãos selecionados com torra artesanal para um sabor equilibrado.',
 'Nosso Café Arábica Torrado Artesanal é um blend cuidadosamente elaborado que combina grãos de diferentes regiões para criar uma experiência harmoniosa e equilibrada.',
 32.90, 38.90, 'tradicional', 'Mogiana, SP', 'medium-dark',
 ARRAY['Chocolate Amargo', 'Baunilha'], 82, false, true, 80,
 ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'],
 '500g', '1.000m', 'Mundo Novo', 'Semi-lavado', 'Cooperativa Mogiana', 'Diversos', 2023,
 ARRAY['UTZ Certified'], ARRAY['Espresso', 'Cafeteira Italiana']),

('Café Fazenda Santa Helena',
 'Café especial com certificação orgânica, cultivado de forma sustentável.',
 'Cultivado de forma totalmente orgânica na Fazenda Santa Helena, este café representa o compromisso com a sustentabilidade e qualidade excepcional.',
 67.90, 75.90, 'especial', 'Alta Mogiana, SP', 'medium',
 ARRAY['Frutas Vermelhas', 'Chocolate'], 85, true, true, 35,
 ARRAY['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600'],
 '500g', '1.300m', 'Catuaí Vermelho', 'Natural', 'Fazenda Santa Helena', 'Pedro Costa', 2023,
 ARRAY['Organic', 'Rainforest Alliance'], ARRAY['Filtrado', 'Prensa Francesa']),

('Café Tradicional Supremo',
 'Blend tradicional perfeito para o dia a dia, com sabor equilibrado e suave.',
 'Nosso blend tradicional mais popular, desenvolvido para oferecer consistência e qualidade em cada xícara, perfeito para o consumo diário.',
 28.90, 32.90, 'tradicional', 'Sul de Minas, MG', 'medium-dark',
 ARRAY['Chocolate', 'Caramelo'], 80, false, true, 120,
 ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600'],
 '500g', '900-1.100m', 'Catuaí', 'Cereja Descascado', 'Cooperativa Sul Mineira', 'Diversos', 2023,
 ARRAY['BSCA Certified'], ARRAY['Filtrado', 'Espresso', 'Cafeteira']),

('Café Microlote Especial',
 'Edição limitada de microlote especial com pontuação SCAA acima de 85 pontos.',
 'Uma seleção muito especial de grãos de um único talhão da fazenda, com características únicas e pontuação excepcional.',
 120.90, 135.90, 'premium', 'Chapada Diamantina, BA', 'light',
 ARRAY['Frutas Tropicais', 'Floral', 'Mel'], 90, true, true, 15,
 ARRAY['https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600'],
 '250g', '1.500m', 'Catuaí Amarelo', 'Honey', 'Fazenda Diamante', 'Ana Oliveira', 2023,
 ARRAY['COE Winner', 'Specialty Coffee'], ARRAY['Pour Over', 'Aeropress']);

-- Categorias do blog
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Processos', 'processos', 'Artigos sobre métodos de processamento de café', '#3B82F6'),
('Educação', 'educacao', 'Conteúdo educativo sobre café', '#10B981'),
('Mercado', 'mercado', 'Análises e tendências do mercado cafeeiro', '#8B5CF6'),
('Receitas', 'receitas', 'Receitas e métodos de preparo', '#F59E0B'),
('Equipamentos', 'equipamentos', 'Reviews e guias de equipamentos', '#EF4444'),
('Origem', 'origem', 'Histórias sobre origem e produtores', '#6B7280');

-- Posts iniciais do blog
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, author_name, status, is_featured, seo_title, seo_description) VALUES
('Os Segredos da Torra Perfeita',
 'segredos-torra-perfeita',
 'Descubra como o processo de torra influencia o sabor final do seu café.',
 '# Os Segredos da Torra Perfeita

A torra é um dos processos mais críticos na produção de café de qualidade. É durante este processo que os grãos verdes se transformam nos grãos aromáticos que conhecemos.

## Fases da Torra

### 1. Secagem (0-3 min)
Os grãos perdem umidade e começam a aquecer uniformemente.

### 2. Reação de Maillard (3-8 min)
Desenvolvimento dos sabores e aromas complexos.

### 3. Primeiro Crack (8-10 min)
O momento crucial onde definimos o perfil da torra.

### 4. Desenvolvimento (10-12 min)
Ajuste final do perfil de sabor.',
 'Processos', ARRAY['torra', 'café', 'técnicas'], 'Mestres do Café', 'published', true,
 'Guia Completo: Torra Perfeita de Café', 'Aprenda as técnicas profissionais de torra de café'),

('Café Especial: Do Grão à Xícara',
 'cafe-especial-grao-xicara',
 'Uma jornada completa desde o plantio até o preparo do café especial.',
 '# Café Especial: Do Grão à Xícara

O café especial representa muito mais que uma bebida - é uma experiência completa que começa na fazenda e termina na sua xícara.

## O que define um Café Especial?

- Pontuação SCAA acima de 80 pontos
- Rastreabilidade completa
- Cuidado em todas as etapas
- Características sensoriais únicas

## Jornada do Café

### Na Fazenda
- Cultivo em altitudes ideais
- Variedades selecionadas
- Cuidado com o terroir

### Processamento
- Métodos específicos (natural, lavado, honey)
- Secagem controlada
- Seleção rigorosa

### Torra
- Perfil específico para cada origem
- Controle de tempo e temperatura
- Testes de qualidade

### Preparo
- Moagem adequada
- Proporção correta
- Técnica de extração',
 'Educação', ARRAY['café especial', 'qualidade', 'origem'], 'Mestres do Café', 'published', false,
 'Café Especial: Guia Completo do Grão à Xícara', 'Descubra todo o processo do café especial');

-- Cupons de desconto iniciais
INSERT INTO discount_coupons (code, description, discount_type, discount_value, min_order_value, usage_limit, is_active, expires_at) VALUES
('BEMVINDO10', 'Desconto de boas-vindas para novos clientes', 'percentage', 10.00, 50.00, 100, true, NOW() + INTERVAL '30 days'),
('FRETEGRATIS', 'Frete grátis para pedidos acima de R$ 99', 'fixed', 15.00, 99.00, NULL, true, NOW() + INTERVAL '60 days'),
('ESPECIAL20', 'Desconto especial em cafés premium', 'percentage', 20.00, 100.00, 50, true, NOW() + INTERVAL '15 days');

-- =========================================
-- TRIGGERS E FUNÇÕES
-- =========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar contadores
CREATE OR REPLACE FUNCTION update_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de pedidos do usuário
    IF TG_TABLE_NAME = 'orders' AND NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE users SET 
            orders_count = orders_count + 1,
            total_spent = total_spent + NEW.total_amount
        WHERE id = NEW.user_id;
    END IF;
    
    -- Atualizar contador de comentários do post
    IF TG_TABLE_NAME = 'blog_comments' THEN
        UPDATE blog_posts SET comments_count = (
            SELECT COUNT(*) FROM blog_comments WHERE post_id = NEW.post_id AND is_approved = true
        ) WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para contadores
CREATE TRIGGER update_order_counters AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_counters();
CREATE TRIGGER update_comment_counters AFTER INSERT ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_counters();

-- =========================================
-- RLS (Row Level Security)
-- =========================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Políticas para products (públicos para leitura)
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view all products" ON products FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para users (próprio perfil)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Políticas para orders (próprios pedidos)
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para blog (público para leitura)
CREATE POLICY "Published posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- =========================================
-- FINALIZAÇÃO
-- =========================================

-- Verificar se tudo foi criado
SELECT 'Setup completo! Tabelas criadas:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name; 