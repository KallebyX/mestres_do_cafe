-- ===============================================
-- ESTRUTURA COMPLETA DO ERP MESTRES DO CAFÉ
-- ===============================================

-- 1. MÓDULO FINANCEIRO
-- ===========================

-- Tabela de contas bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    agency VARCHAR(20) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'conta_corrente',
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    initial_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS financial_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receita', 'despesa')),
    parent_id UUID REFERENCES financial_categories(id),
    code VARCHAR(20) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contas a receber
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES users(id),
    invoice_number VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    payment_date DATE,
    payment_method VARCHAR(50),
    category_id UUID REFERENCES financial_categories(id),
    bank_account_id UUID REFERENCES bank_accounts(id),
    discount DECIMAL(15,2) DEFAULT 0.00,
    interest DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS accounts_payable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id),
    invoice_number VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    payment_date DATE,
    payment_method VARCHAR(50),
    category_id UUID REFERENCES financial_categories(id),
    bank_account_id UUID REFERENCES bank_accounts(id),
    discount DECIMAL(15,2) DEFAULT 0.00,
    interest DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. MÓDULO DE ESTOQUE
-- ===========================

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    contact_person VARCHAR(255),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES product_categories(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de depósitos/almoxarifados
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE,
    address TEXT,
    responsible_user_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela ampliada de produtos
CREATE TABLE IF NOT EXISTS products_extended (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category_id UUID REFERENCES product_categories(id),
    description TEXT,
    unit_of_measure VARCHAR(20) DEFAULT 'kg',
    cost_price DECIMAL(15,2) DEFAULT 0.00,
    sale_price DECIMAL(15,2) DEFAULT 0.00,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    supplier_id UUID REFERENCES suppliers(id),
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products_extended(id),
    warehouse_id UUID REFERENCES warehouses(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'transferencia', 'ajuste')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    reason VARCHAR(255),
    document_number VARCHAR(100),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. MÓDULO DE RECURSOS HUMANOS
-- ===========================

-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'demitido', 'licenca')),
    manager_id UUID REFERENCES employees(id),
    bank_account VARCHAR(100),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de presenças
CREATE TABLE IF NOT EXISTS attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    lunch_out TIME,
    lunch_in TIME,
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'presente' CHECK (status IN ('presente', 'ausente', 'falta', 'licenca', 'ferias')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de avaliações de desempenho
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    reviewer_id UUID REFERENCES employees(id),
    review_period_start DATE,
    review_period_end DATE,
    overall_score DECIMAL(3,2),
    goals_score DECIMAL(3,2),
    skills_score DECIMAL(3,2),
    attitude_score DECIMAL(3,2),
    comments TEXT,
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida', 'aprovada')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. MÓDULO DE VENDAS
-- ===========================

-- Tabela de vendedores
CREATE TABLE IF NOT EXISTS sales_reps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    monthly_goal DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES users(id),
    sales_rep_id UUID REFERENCES sales_reps(id),
    quotation_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'vencido')),
    valid_until DATE,
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    discount DECIMAL(15,2) DEFAULT 0.00,
    tax DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quotation_id UUID REFERENCES quotations(id),
    product_id UUID REFERENCES products_extended(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. MÓDULO DE COMPRAS
-- ===========================

-- Tabela de ordens de compra
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id),
    order_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'recebido', 'cancelado')),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    tax DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens da ordem de compra
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES purchase_orders(id),
    product_id UUID REFERENCES products_extended(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. MÓDULO DE PRODUÇÃO
-- ===========================

-- Tabela de receitas/fórmulas
CREATE TABLE IF NOT EXISTS production_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    final_product_id UUID REFERENCES products_extended(id),
    version VARCHAR(20) DEFAULT '1.0',
    yield_quantity DECIMAL(10,3) NOT NULL,
    production_time INTEGER, -- em minutos
    difficulty_level VARCHAR(20) DEFAULT 'medio',
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ingredientes da receita
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES production_recipes(id),
    ingredient_id UUID REFERENCES products_extended(id),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ordens de produção
CREATE TABLE IF NOT EXISTS production_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE,
    recipe_id UUID REFERENCES production_recipes(id),
    quantity_planned DECIMAL(10,3) NOT NULL,
    quantity_produced DECIMAL(10,3) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_producao', 'concluida', 'cancelada')),
    start_date DATE,
    planned_finish_date DATE,
    actual_finish_date DATE,
    responsible_employee_id UUID REFERENCES employees(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. ÍNDICES E TRIGGERS
-- ===========================

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_customer ON accounts_receivable(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_supplier ON accounts_payable(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_attendances_employee_date ON attendances(employee_id, date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_extended_updated_at BEFORE UPDATE ON products_extended FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. SISTEMA DE NOTIFICAÇÕES
-- ===========================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert', 'financial', 'stock', 'hr', 'task')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Trigger para updated_at em notificações
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. DADOS INICIAIS DE EXEMPLO
-- ===========================

-- Inserir categorias financeiras básicas
INSERT INTO financial_categories (name, type, code) VALUES 
('Vendas de Café', 'receita', 'REC001'),
('Prestação de Serviços', 'receita', 'REC002'),
('Compra de Matéria Prima', 'despesa', 'DES001'),
('Salários', 'despesa', 'DES002'),
('Aluguel', 'despesa', 'DES003'),
('Utilidades', 'despesa', 'DES004')
ON CONFLICT (code) DO NOTHING;

-- Inserir conta bancária padrão
INSERT INTO bank_accounts (name, bank_name, account_number, agency, current_balance) VALUES 
('Conta Principal', 'Banco do Brasil', '12345-6', '1234', 50000.00)
ON CONFLICT DO NOTHING;

-- Inserir categorias de produtos
INSERT INTO product_categories (name, description) VALUES 
('Cafés Especiais', 'Cafés de origem única e blends especiais'),
('Equipamentos', 'Equipamentos para preparo de café'),
('Acessórios', 'Acessórios e utensílios')
ON CONFLICT DO NOTHING;

-- Inserir depósito padrão
INSERT INTO warehouses (name, code, address) VALUES 
('Depósito Principal', 'DEP001', 'Rua da Torrefação, 123 - Centro')
ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) - Configurações básicas
-- Habilitar RLS nas tabelas principais
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (admin tem acesso total)
CREATE POLICY "Admin access" ON bank_accounts FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access" ON accounts_receivable FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access" ON accounts_payable FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access" ON suppliers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin access" ON employees FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para notificações (usuários só veem suas próprias notificações)
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all notifications" ON notifications FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

COMMIT; 