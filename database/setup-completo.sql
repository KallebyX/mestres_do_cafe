-- =========================================
-- SETUP COMPLETO BANCO MESTRES DO CAFÉ
-- Execute este SQL no Supabase SQL Editor
-- =========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpar tabelas existentes (cuidado!)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabela de usuários (perfis)
CREATE TABLE users (
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
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de produtos (CORRIGIDA)
CREATE TABLE products (
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
  tasting_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de pedidos
CREATE TABLE orders (
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

-- 4. Tabela de itens dos pedidos
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de posts do blog
CREATE TABLE blog_posts (
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
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de carrinho
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =========================================
-- FUNÇÕES UTILITÁRIAS
-- =========================================

-- Função para atualizar estoque
CREATE OR REPLACE FUNCTION update_product_stock(product_id UUID, quantity_sold INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = stock - quantity_sold,
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Função para restaurar estoque
CREATE OR REPLACE FUNCTION restore_product_stock(product_id UUID, quantity_to_restore INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = stock + quantity_to_restore,
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar visualizações do post
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts 
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- POLÍTICAS RLS (Row Level Security)
-- =========================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Políticas para products
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all products" ON products FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para order_items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Políticas para blog_posts
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (status = 'published');

-- Políticas para cart_items
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- DADOS INICIAIS
-- =========================================

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, original_price, category, origin, roast_level, flavor_notes, sca_score, is_featured, is_active, stock, images, weight) VALUES
('Bourbon Amarelo Premium', 'Café especial com notas de chocolate e caramelo, cultivado nas montanhas de Minas Gerais', 45.90, 52.90, 'especiais', 'Sul de Minas Gerais', 'medium', ARRAY['chocolate', 'caramelo', 'nozes'], 87, true, true, 50, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'], '500g'),

('Geisha Especial', 'Variedade rara com perfil floral e cítrico excepcional', 89.90, 98.90, 'premium', 'Fazenda São Benedito', 'light', ARRAY['floral', 'cítrico', 'bergamota'], 92, true, true, 25, ARRAY['https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=600'], '250g'),

('Catuaí Vermelho', 'Café doce com notas de frutas vermelhas e chocolate ao leite', 42.90, 0, 'especiais', 'Cerrado Mineiro', 'medium', ARRAY['frutas vermelhas', 'chocolate ao leite', 'mel'], 84, false, true, 75, ARRAY['https://images.unsplash.com/photo-1500761482497-539e91ad4977?w=600'], '500g'),

('Blend Signature', 'Nossa composição especial para um café equilibrado e cremoso', 39.90, 44.90, 'blends', 'Seleção Especial', 'medium-dark', ARRAY['chocolate', 'caramelo', 'nozes'], 82, false, true, 100, ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'], '500g'),

('Expresso Premium', 'Blend desenvolvido especialmente para extrações espresso', 36.90, 41.90, 'espresso', 'Blend Especial', 'dark', ARRAY['chocolate amargo', 'caramelo queimado'], 83, false, true, 60, ARRAY['https://images.unsplash.com/photo-1524350876685-274059332603?w=600'], '500g'),

('Décaféinado Especial', 'Todo o sabor sem cafeína, processo Swiss Water', 48.90, 55.90, 'decaf', 'Sul de Minas', 'medium', ARRAY['chocolate', 'caramelo', 'nozes'], 81, false, true, 30, ARRAY['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600'], '500g');

-- Inserir posts do blog de exemplo
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, status, is_featured, published_at) VALUES
('Os Segredos da Torra Perfeita', 'segredos-torra-perfeita', 'Descubra como o processo de torra influencia o sabor final do seu café e aprenda as técnicas dos mestres torradores.', 'A torra é uma das etapas mais importantes na produção de um café excepcional. É durante este processo que os grãos verdes se transformam nos grãos aromáticos que conhecemos...', 'Processos', ARRAY['torra', 'técnicas', 'sabor'], 'published', true, NOW()),

('Café Especial: Do Grão à Xícara', 'cafe-especial-grao-xicara', 'Uma jornada completa desde o plantio até o preparo do café especial, descobrindo cada etapa que garante a qualidade excepcional.', 'O café especial representa o que há de melhor na cafeicultura mundial. Desde o cuidado com o solo até a extração perfeita, cada etapa é fundamental...', 'Educação', ARRAY['café especial', 'qualidade', 'origem'], 'published', true, NOW()),

('Métodos de Extração: Guia Completo', 'metodos-extracao-guia-completo', 'Explore os diferentes métodos de preparo e descubra qual é o ideal para destacar as características únicas de cada café.', 'Cada método de extração ressalta diferentes características do café. Desde o espresso italiano até o pour-over japonês, cada técnica tem sua personalidade...', 'Preparo', ARRAY['métodos', 'extração', 'preparo'], 'published', false, NOW());

-- =========================================
-- USUÁRIOS DE TESTE
-- =========================================

-- IMPORTANTE: Os usuários devem ser criados via Supabase Auth
-- Estes são apenas os perfis associados

-- Perfil Admin (crie via Supabase Auth com email: admin@mestrescafe.com)
INSERT INTO users (id, name, email, role, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@mestrescafe.com', 'super_admin', ARRAY['read', 'write', 'delete', 'admin']) 
ON CONFLICT (id) DO NOTHING;

-- Perfil Cliente (crie via Supabase Auth com email: cliente@teste.com)
INSERT INTO users (id, name, email, role, permissions, points, level) VALUES 
('00000000-0000-0000-0000-000000000002', 'Cliente Teste', 'cliente@teste.com', 'customer', ARRAY['read'], 150, 'Bronze') 
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- CRIAÇÃO FINALIZADA
-- =========================================

-- Exibir estatísticas
SELECT 
  'products' as tabela, 
  COUNT(*) as registros 
FROM products
UNION ALL
SELECT 
  'blog_posts' as tabela, 
  COUNT(*) as registros 
FROM blog_posts
UNION ALL
SELECT 
  'users' as tabela, 
  COUNT(*) as registros 
FROM users;

-- Mensagem de sucesso
SELECT 'Setup do banco Mestres do Café concluído com sucesso! 🎉☕' as status; 