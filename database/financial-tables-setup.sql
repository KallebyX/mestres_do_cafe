-- ===============================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO FINANCEIRO
-- ERP MESTRES DO CAFÉ - DADOS REAIS SUPABASE
-- ===============================================

-- 1. TABELA DE CONTAS BANCÁRIAS
-- ===============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  agency VARCHAR(20),
  account_type VARCHAR(50) DEFAULT 'conta-corrente',
  current_balance DECIMAL(15,2) DEFAULT 0.00,
  initial_balance DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_name ON bank_accounts(bank_name);

-- 2. TABELA DE CATEGORIAS FINANCEIRAS
-- ===============================================
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'income' ou 'expense'
  color VARCHAR(7) DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir categorias padrão
INSERT INTO financial_categories (name, description, type) VALUES
('Vendas', 'Receitas de vendas de produtos', 'income'),
('Serviços', 'Receitas de prestação de serviços', 'income'),
('Investimentos', 'Receitas de investimentos', 'income'),
('Matéria Prima', 'Despesas com matéria prima', 'expense'),
('Operacional', 'Despesas operacionais', 'expense'),
('Marketing', 'Despesas com marketing e publicidade', 'expense'),
('Pessoal', 'Despesas com pessoal', 'expense'),
('Aluguel', 'Despesas com aluguel e imóveis', 'expense'),
('Utilidades', 'Energia, água, telefone, internet', 'expense'),
('Impostos', 'Impostos e taxas', 'expense')
ON CONFLICT (name) DO NOTHING;

-- 3. TABELA DE CONTAS A RECEBER
-- ===============================================
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  received_date DATE,
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'recebido', 'vencido', 'cancelado'
  installment VARCHAR(10) DEFAULT '1/1',
  description TEXT,
  document_number VARCHAR(100),
  type VARCHAR(50) DEFAULT 'sale',
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_customer ON accounts_receivable(customer_name);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_is_active ON accounts_receivable(is_active);

-- 4. TABELA DE CONTAS A PAGAR
-- ===============================================
CREATE TABLE IF NOT EXISTS accounts_payable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_email VARCHAR(255),
  supplier_id UUID, -- Referência será adicionada após a criação da tabela suppliers
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'pago', 'vencido', 'cancelado'
  category VARCHAR(100) DEFAULT 'geral',
  description TEXT,
  document_number VARCHAR(100),
  type VARCHAR(50) DEFAULT 'purchase',
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_supplier ON accounts_payable(supplier_name);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_is_active ON accounts_payable(is_active);

-- 5. TABELA DE MOVIMENTAÇÕES FINANCEIRAS
-- ===============================================
CREATE TABLE IF NOT EXISTS financial_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  movement_type VARCHAR(20) NOT NULL, -- 'entrada', 'saida', 'transferencia'
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'receivable', 'payable', 'transfer', 'manual'
  reference_id UUID,
  document_number VARCHAR(100),
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_financial_movements_bank_account ON financial_movements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_financial_movements_type ON financial_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_financial_movements_date ON financial_movements(created_at);

-- 6. TRIGGERS PARA UPDATED_AT
-- ===============================================
-- Criar função apenas se não existir (para evitar conflitos com outras tabelas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_categories_updated_at ON financial_categories;
CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON financial_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_receivable_updated_at ON accounts_receivable;
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_payable_updated_at ON accounts_payable;
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (ROW LEVEL SECURITY) POLICIES
-- ===============================================

-- Habilitar RLS nas tabelas
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_movements ENABLE ROW LEVEL SECURITY;

-- Políticas para bank_accounts
CREATE POLICY "Usuários podem ver suas contas bancárias" ON bank_accounts
  FOR SELECT USING (true); -- Por enquanto, todos podem ver

CREATE POLICY "Usuários podem inserir contas bancárias" ON bank_accounts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar contas bancárias" ON bank_accounts
  FOR UPDATE USING (true);

-- Políticas para financial_categories
CREATE POLICY "Usuários podem ver categorias financeiras" ON financial_categories
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir categorias financeiras" ON financial_categories
  FOR INSERT WITH CHECK (true);

-- Políticas para accounts_receivable
CREATE POLICY "Usuários podem ver contas a receber" ON accounts_receivable
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir contas a receber" ON accounts_receivable
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar contas a receber" ON accounts_receivable
  FOR UPDATE USING (true);

-- Políticas para accounts_payable
CREATE POLICY "Usuários podem ver contas a pagar" ON accounts_payable
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir contas a pagar" ON accounts_payable
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar contas a pagar" ON accounts_payable
  FOR UPDATE USING (true);

-- Políticas para financial_movements
CREATE POLICY "Usuários podem ver movimentações financeiras" ON financial_movements
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir movimentações financeiras" ON financial_movements
  FOR INSERT WITH CHECK (true);

-- 8. FUNÇÕES AUXILIARES
-- ===============================================

-- Função para atualizar saldo da conta bancária
CREATE OR REPLACE FUNCTION update_bank_account_balance(
  account_id UUID,
  amount DECIMAL(15,2),
  movement_type VARCHAR(20)
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  new_balance DECIMAL(15,2);
BEGIN
  IF movement_type = 'entrada' THEN
    UPDATE bank_accounts 
    SET current_balance = current_balance + amount
    WHERE id = account_id
    RETURNING current_balance INTO new_balance;
  ELSE
    UPDATE bank_accounts 
    SET current_balance = current_balance - amount
    WHERE id = account_id
    RETURNING current_balance INTO new_balance;
  END IF;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- 9. DADOS DE DEMONSTRAÇÃO (OPCIONAL)
-- ===============================================

-- Adicionar constraints únicas para permitir ON CONFLICT
ALTER TABLE bank_accounts ADD CONSTRAINT unique_bank_account_number UNIQUE (bank_name, account_number);
ALTER TABLE accounts_receivable ADD CONSTRAINT unique_receivable_document UNIQUE (document_number);
ALTER TABLE accounts_payable ADD CONSTRAINT unique_payable_document UNIQUE (document_number);

-- Inserir conta bancária de demonstração
INSERT INTO bank_accounts (name, bank_name, account_number, agency, current_balance, initial_balance) VALUES
('Conta Corrente Principal', 'Banco do Brasil', '12345-6', '1234-5', 25000.00, 25000.00),
('Conta Poupança', 'Itaú', '98765-4', '9876', 15000.00, 15000.00),
('Conta Digital', 'Nubank', 'Digital', '-', 8500.00, 8500.00)
ON CONFLICT (bank_name, account_number) DO NOTHING;

-- Inserir algumas contas a receber de demonstração
INSERT INTO accounts_receivable (customer_name, customer_email, amount, due_date, status, description, document_number) VALUES
('Café Brasil Ltda', 'compras@cafebrasil.com', 2850.00, CURRENT_DATE + INTERVAL '15 days', 'pendente', 'Venda de café premium - Lote 001', 'VND-001'),
('Torrefação Sul', 'financeiro@torrefacaosul.com', 1450.00, CURRENT_DATE + INTERVAL '10 days', 'pendente', 'Fornecimento de café especial', 'VND-002'),
('Cafeteria Central', 'contato@cafeteriacentral.com', 3200.00, CURRENT_DATE + INTERVAL '25 days', 'pendente', 'Equipamentos para cafeteria', 'VND-003')
ON CONFLICT (document_number) DO NOTHING;

-- Inserir algumas contas a pagar de demonstração
INSERT INTO accounts_payable (supplier_name, supplier_email, amount, due_date, status, category, description, document_number) VALUES
('Fazenda Santa Clara', 'vendas@fazendasantaclara.com', 4500.00, CURRENT_DATE + INTERVAL '18 days', 'pendente', 'materia-prima', 'Compra de café verde - Safra 2024', 'CMP-001'),
('Energia Elétrica RS', 'atendimento@energiers.com', 890.00, CURRENT_DATE + INTERVAL '22 days', 'pendente', 'operacional', 'Conta de energia elétrica - Fevereiro', 'CMP-002'),
('Transportadora Express', 'cobranca@transportadoraexpress.com', 650.00, CURRENT_DATE + INTERVAL '28 days', 'pendente', 'logistica', 'Frete para entrega de produtos', 'CMP-003')
ON CONFLICT (document_number) DO NOTHING;

-- 10. ADICIONAR CONSTRAINT DE FOREIGN KEY PARA SUPPLIERS (OPCIONAL)
-- Esta constraint será aplicada apenas se a tabela suppliers existir
-- ===============================================
DO $$
BEGIN
    -- Verificar se a tabela suppliers existe antes de adicionar a constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        -- Adicionar foreign key constraint se a tabela suppliers existir
        ALTER TABLE accounts_payable 
        ADD CONSTRAINT fk_accounts_payable_supplier 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Confirmação da criação
SELECT 'Tabelas do módulo financeiro criadas com sucesso!' AS status; 