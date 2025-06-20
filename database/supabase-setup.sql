-- =========================================
-- SETUP BANCO MESTRES DO CAFÉ - SUPABASE
-- =========================================

-- Criar tabela de usuários
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
  level TEXT DEFAULT 'aprendiz',
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT DEFAULT 'cafe',
  origin TEXT,
  sca_score INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pendente',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de itens do pedido
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- =========================================
-- CONFIGURAR SEGURANÇA (RLS)
-- =========================================

-- Ativar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for new users" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para produtos (todos podem ver)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Políticas para pedidos
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Políticas para itens do pedido
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- =========================================
-- INSERIR DADOS DEMO
-- =========================================

-- Produtos demo com imagens reais
INSERT INTO products (name, description, price, original_price, origin, sca_score, is_featured, is_active, stock_quantity, images) VALUES
('Café Bourbon Amarelo Premium', 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo. Torra média que realça sua doçura natural.', 45.90, 52.90, 'Montanhas de Minas', 86, true, true, 50, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400']),

('Café Geisha Especial', 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único. Notas de jasmin e bergamota.', 89.90, 105.90, 'Fazenda São Benedito', 92, true, true, 30, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400']),

('Blend Signature', 'Blend especial da casa com equilíbrio perfeito entre doçura e acidez. Ideal para espresso e métodos filtrados.', 67.90, 75.90, 'Seleção Especial', 88, true, true, 40, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400']),

('Café Catuaí Vermelho', 'Variedade tradicional brasileira com corpo intenso e baixa acidez. Perfeito para café com leite.', 38.90, 42.90, 'Serra da Mantiqueira', 84, false, true, 60, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400']),

('Café Mundo Novo', 'Café robusto com notas de chocolate amargo e castanhas. Ideal para quem gosta de sabor marcante.', 41.90, 48.90, 'Mogiana Paulista', 85, false, true, 45, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400']),

('Café Icatu Amarelo', 'Variedade resistente com perfil frutado e acidez balanceada. Notas de frutas cítricas.', 43.90, 49.90, 'Alto da Mogiana', 87, true, true, 35, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400']);

-- =========================================
-- FUNÇÕES AUXILIARES
-- =========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =========================================
-- CONFIGURAÇÃO COMPLETA ✅
-- =========================================

-- Verificar se tudo foi criado
SELECT 
  'users' as tabela, 
  COUNT(*) as registros 
FROM users
UNION ALL
SELECT 
  'products' as tabela, 
  COUNT(*) as registros 
FROM products;

-- Mostrar produtos criados
SELECT 
  name, 
  price, 
  origin, 
  is_featured 
FROM products 
ORDER BY is_featured DESC, price DESC; 