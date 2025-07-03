-- ===============================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO DE ESTOQUE
-- ERP MESTRES DO CAFÉ - DADOS REAIS SUPABASE
-- ===============================================

-- 1. TABELA DE FORNECEDORES
-- ===============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contact_person VARCHAR(255),
  cnpj VARCHAR(18),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_cnpj ON suppliers(cnpj);

-- 2. TABELA DE CATEGORIAS DE PRODUTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir categorias padrão
INSERT INTO product_categories (name, description) VALUES
('Cafés Especiais', 'Cafés premium e especiais'),
('Equipamentos', 'Máquinas e equipamentos para café'),
('Acessórios', 'Acessórios e utensílios'),
('Embalagens', 'Embalagens para produtos'),
('Insumos', 'Insumos diversos')
ON CONFLICT (name) DO NOTHING;

-- 3. TABELA DE DEPÓSITOS/ALMOXARIFADOS
-- ===============================================
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  capacity INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir depósito padrão
INSERT INTO warehouses (name, description, address, capacity) VALUES
('Depósito Principal', 'Depósito principal da empresa', 'Rua Principal, 123', 1000),
('Depósito Secundário', 'Depósito secundário para excesso', 'Rua Secundária, 456', 500)
ON CONFLICT (name) DO NOTHING;

-- 4. TABELA DE PRODUTOS ESTENDIDOS
-- ===============================================
CREATE TABLE IF NOT EXISTS products_extended (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  cost_price DECIMAL(15,2) DEFAULT 0.00,
  sale_price DECIMAL(15,2) DEFAULT 0.00,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 100,
  location VARCHAR(50) DEFAULT 'A1-01',
  barcode VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'unidade',
  weight DECIMAL(10,3),
  dimensions VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_products_extended_is_active ON products_extended(is_active);
CREATE INDEX IF NOT EXISTS idx_products_extended_sku ON products_extended(sku);
CREATE INDEX IF NOT EXISTS idx_products_extended_category ON products_extended(category_id);
CREATE INDEX IF NOT EXISTS idx_products_extended_supplier ON products_extended(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_extended_stock ON products_extended(current_stock);

-- 5. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- ===============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products_extended(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  movement_type VARCHAR(20) NOT NULL, -- 'entrada', 'saida', 'transferencia', 'ajuste'
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  reason VARCHAR(100) NOT NULL,
  document_number VARCHAR(100),
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- 6. TABELA DE LOCALIZAÇÃO DE PRODUTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS product_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products_extended(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
  location_code VARCHAR(20) NOT NULL, -- Ex: A1-01, B2-05
  quantity INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_locations_unique ON product_locations(product_id, warehouse_id, location_code);
CREATE INDEX IF NOT EXISTS idx_product_locations_code ON product_locations(location_code);

-- 7. TABELA DE LOTES/BATCHES
-- ===============================================
CREATE TABLE IF NOT EXISTS product_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products_extended(id) ON DELETE CASCADE NOT NULL,
  batch_number VARCHAR(50) NOT NULL,
  manufacturing_date DATE,
  expiry_date DATE,
  quantity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'aprovado', -- 'aprovado', 'quarentena', 'reprovado'
  quality_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_product_batches_product ON product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_number ON product_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_product_batches_expiry ON product_batches(expiry_date);

-- 8. TRIGGERS PARA UPDATED_AT
-- ===============================================
-- Usar função existente ou criar se necessário
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses;
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_extended_updated_at ON products_extended;
CREATE TRIGGER update_products_extended_updated_at BEFORE UPDATE ON products_extended
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_locations_updated_at ON product_locations;
CREATE TRIGGER update_product_locations_updated_at BEFORE UPDATE ON product_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_batches_updated_at ON product_batches;
CREATE TRIGGER update_product_batches_updated_at BEFORE UPDATE ON product_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS (ROW LEVEL SECURITY) POLICIES
-- ===============================================

-- Habilitar RLS nas tabelas
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;

-- Políticas para suppliers
CREATE POLICY "Usuários podem ver fornecedores" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir fornecedores" ON suppliers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar fornecedores" ON suppliers
  FOR UPDATE USING (true);

-- Políticas para product_categories
CREATE POLICY "Usuários podem ver categorias" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir categorias" ON product_categories
  FOR INSERT WITH CHECK (true);

-- Políticas para warehouses
CREATE POLICY "Usuários podem ver depósitos" ON warehouses
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir depósitos" ON warehouses
  FOR INSERT WITH CHECK (true);

-- Políticas para products_extended
CREATE POLICY "Usuários podem ver produtos" ON products_extended
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir produtos" ON products_extended
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar produtos" ON products_extended
  FOR UPDATE USING (true);

-- Políticas para stock_movements
CREATE POLICY "Usuários podem ver movimentações" ON stock_movements
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir movimentações" ON stock_movements
  FOR INSERT WITH CHECK (true);

-- Políticas para product_locations
CREATE POLICY "Usuários podem ver localizações" ON product_locations
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir localizações" ON product_locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar localizações" ON product_locations
  FOR UPDATE USING (true);

-- Políticas para product_batches
CREATE POLICY "Usuários podem ver lotes" ON product_batches
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir lotes" ON product_batches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar lotes" ON product_batches
  FOR UPDATE USING (true);

-- 10. FUNÇÕES AUXILIARES
-- ===============================================

-- Função para atualizar estoque do produto
CREATE OR REPLACE FUNCTION update_product_stock(
  product_id UUID,
  quantity_change INTEGER,
  movement_type VARCHAR(20)
)
RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  IF movement_type = 'entrada' THEN
    UPDATE products_extended 
    SET current_stock = current_stock + quantity_change
    WHERE id = product_id
    RETURNING current_stock INTO new_stock;
  ELSE
    UPDATE products_extended 
    SET current_stock = current_stock - quantity_change
    WHERE id = product_id
    RETURNING current_stock INTO new_stock;
  END IF;
  
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar estoque baixo
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TABLE(product_id UUID, product_name VARCHAR, current_stock INTEGER, min_stock INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.current_stock,
    p.min_stock
  FROM products_extended p
  WHERE p.current_stock <= p.min_stock
    AND p.is_active = true
  ORDER BY (p.current_stock::DECIMAL / p.min_stock) ASC;
END;
$$ LANGUAGE plpgsql;

-- 11. DADOS DE DEMONSTRAÇÃO (OPCIONAL)
-- ===============================================

-- Adicionar constraint única para permitir ON CONFLICT
ALTER TABLE suppliers ADD CONSTRAINT unique_supplier_name UNIQUE (name);

-- Inserir fornecedores de demonstração
INSERT INTO suppliers (name, email, phone, address, contact_person, cnpj, is_active) VALUES
('Fazenda Sul', 'contato@fazendasul.com', '(11) 9999-9999', 'Interior de São Paulo', 'João Silva', '12345678901234', true),
('Fazenda Norte', 'vendas@fazendanorte.com', '(11) 8888-8888', 'Interior de Minas Gerais', 'Maria Santos', '23456789012345', true),
('TechCoffee Ltd', 'sales@techcoffee.com', '(11) 7777-7777', 'São Paulo - SP', 'Roberto Costa', '34567890123456', true)
ON CONFLICT (name) DO NOTHING;

-- Obter IDs dos fornecedores e categorias criados
DO $$
DECLARE
  fazenda_sul_id UUID;
  fazenda_norte_id UUID;
  techcoffee_id UUID;
  categoria_cafe_id UUID;
  categoria_equipamento_id UUID;
BEGIN
  -- Obter IDs dos fornecedores
  SELECT id INTO fazenda_sul_id FROM suppliers WHERE name = 'Fazenda Sul' LIMIT 1;
  SELECT id INTO fazenda_norte_id FROM suppliers WHERE name = 'Fazenda Norte' LIMIT 1;
  SELECT id INTO techcoffee_id FROM suppliers WHERE name = 'TechCoffee Ltd' LIMIT 1;
  
  -- Obter IDs das categorias
  SELECT id INTO categoria_cafe_id FROM product_categories WHERE name = 'Cafés Especiais' LIMIT 1;
  SELECT id INTO categoria_equipamento_id FROM product_categories WHERE name = 'Equipamentos' LIMIT 1;
  
  -- Inserir produtos de demonstração
  INSERT INTO products_extended (name, sku, description, category_id, supplier_id, cost_price, sale_price, current_stock, min_stock, max_stock, location) VALUES
  ('Café Santos Premium', 'CAF-001', 'Café premium especial da região de Santos', categoria_cafe_id, fazenda_sul_id, 15.50, 25.90, 45, 20, 100, 'A1-01'),
  ('Café Robusta Especial', 'CAF-002', 'Café robusta especial para blend', categoria_cafe_id, fazenda_norte_id, 12.80, 22.50, 12, 25, 80, 'A1-02'),
  ('Máquina Espresso Professional', 'EQP-001', 'Máquina espresso profissional para cafeterias', categoria_equipamento_id, techcoffee_id, 850.00, 1299.90, 8, 5, 20, 'B1-01')
  ON CONFLICT (sku) DO NOTHING;
END $$;

-- Inserir algumas movimentações de estoque de demonstração
DO $$
DECLARE
  produto_cafe_id UUID;
  deposito_id UUID;
BEGIN
  -- Obter ID do produto de café
  SELECT id INTO produto_cafe_id FROM products_extended WHERE sku = 'CAF-001' LIMIT 1;
  SELECT id INTO deposito_id FROM warehouses WHERE name = 'Depósito Principal' LIMIT 1;
  
  -- Inserir movimentação de entrada (removendo ON CONFLICT para evitar erros)
  INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, unit_cost, total_cost, reason, document_number, stock_before, stock_after) VALUES
  (produto_cafe_id, deposito_id, 'entrada', 50, 15.50, 775.00, 'Compra', 'NF-12345', 0, 50);
END $$;

-- 12. ADICIONAR CONSTRAINT DE FOREIGN KEY NO MÓDULO FINANCEIRO (SE EXISTIR)
-- ===============================================
DO $$
BEGIN
    -- Se a tabela accounts_payable existe, adicionar foreign key para suppliers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts_payable') THEN
        -- Verificar se a constraint já existe antes de tentar adicioná-la
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_accounts_payable_supplier' 
            AND table_name = 'accounts_payable'
        ) THEN
            ALTER TABLE accounts_payable 
            ADD CONSTRAINT fk_accounts_payable_supplier 
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Confirmação da criação
SELECT 'Tabelas do módulo de estoque criadas com sucesso!' AS status; 