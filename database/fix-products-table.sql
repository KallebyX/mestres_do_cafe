-- =========================================
-- CORREÇÃO RÁPIDA - TABELA PRODUCTS
-- Execute este SQL no Supabase para corrigir o erro
-- =========================================

-- Dropar e recriar tabela products com estrutura correta
DROP TABLE IF EXISTS products CASCADE;

-- Criar tabela products com TODAS as colunas necessárias
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

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all products" ON products FOR SELECT USING (auth.role() = 'authenticated');

-- Inserir produtos de teste
INSERT INTO products (name, description, price, original_price, category, origin, roast_level, flavor_notes, sca_score, is_featured, is_active, stock, images, weight) VALUES
('Bourbon Amarelo Premium', 'Café especial com notas de chocolate e caramelo', 45.90, 52.90, 'especiais', 'Sul de Minas Gerais', 'medium', ARRAY['chocolate', 'caramelo', 'nozes'], 87, true, true, 50, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'], '500g'),

('Geisha Especial', 'Variedade rara com perfil floral e cítrico', 89.90, 98.90, 'premium', 'Fazenda São Benedito', 'light', ARRAY['floral', 'cítrico', 'bergamota'], 92, true, true, 25, ARRAY['https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=600'], '250g'),

('Catuaí Vermelho', 'Café doce com notas de frutas vermelhas', 42.90, 0, 'especiais', 'Cerrado Mineiro', 'medium', ARRAY['frutas vermelhas', 'chocolate ao leite', 'mel'], 84, false, true, 75, ARRAY['https://images.unsplash.com/photo-1500761482497-539e91ad4977?w=600'], '500g'),

('Blend Signature', 'Composição especial equilibrada', 39.90, 44.90, 'blends', 'Seleção Especial', 'medium-dark', ARRAY['chocolate', 'caramelo', 'nozes'], 82, false, true, 100, ARRAY['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'], '500g'),

('Expresso Premium', 'Blend para extrações espresso', 36.90, 41.90, 'espresso', 'Blend Especial', 'dark', ARRAY['chocolate amargo', 'caramelo queimado'], 83, false, true, 60, ARRAY['https://images.unsplash.com/photo-1524350876685-274059332603?w=600'], '500g'),

('Décaféinado Especial', 'Todo sabor sem cafeína', 48.90, 55.90, 'decaf', 'Sul de Minas', 'medium', ARRAY['chocolate', 'caramelo', 'nozes'], 81, false, true, 30, ARRAY['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600'], '500g');

-- Verificar produtos inseridos
SELECT COUNT(*) as total_produtos FROM products;

SELECT 'Tabela products corrigida com sucesso! ✅' as status; 