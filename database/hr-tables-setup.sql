-- ===============================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO DE RH
-- ERP MESTRES DO CAFÉ - DADOS REAIS SUPABASE
-- ===============================================

-- 1. TABELA DE DEPARTAMENTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  budget_annual DECIMAL(15,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir departamentos padrão
INSERT INTO departments (name, description, budget_annual) VALUES
('Vendas', 'Departamento de vendas e relacionamento com clientes', 180000.00),
('Marketing', 'Departamento de marketing e comunicação', 120000.00),
('Produção', 'Departamento de produção e operações', 280000.00),
('Administrativo', 'Departamento administrativo e financeiro', 200000.00),
('Recursos Humanos', 'Departamento de recursos humanos', 150000.00)
ON CONFLICT (name) DO NOTHING;

-- 2. TABELA DE CARGOS/POSIÇÕES
-- ===============================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  salary_min DECIMAL(15,2) DEFAULT 0.00,
  salary_max DECIMAL(15,2) DEFAULT 0.00,
  salary_base DECIMAL(15,2) DEFAULT 0.00,
  requirements TEXT,
  responsibilities TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir cargos padrão
DO $$
DECLARE
  dept_vendas_id UUID;
  dept_marketing_id UUID;
  dept_producao_id UUID;
  dept_admin_id UUID;
BEGIN
  -- Obter IDs dos departamentos
  SELECT id INTO dept_vendas_id FROM departments WHERE name = 'Vendas' LIMIT 1;
  SELECT id INTO dept_marketing_id FROM departments WHERE name = 'Marketing' LIMIT 1;
  SELECT id INTO dept_producao_id FROM departments WHERE name = 'Produção' LIMIT 1;
  SELECT id INTO dept_admin_id FROM departments WHERE name = 'Administrativo' LIMIT 1;
  
  -- Inserir cargos
  INSERT INTO positions (name, description, department_id, salary_min, salary_max, salary_base) VALUES
  ('Gerente de Vendas', 'Responsável pela gestão da equipe de vendas', dept_vendas_id, 7000.00, 12000.00, 8500.00),
  ('Vendedor', 'Responsável pelo atendimento e vendas aos clientes', dept_vendas_id, 2500.00, 4500.00, 3200.00),
  ('Analista de Marketing', 'Responsável pelas estratégias de marketing', dept_marketing_id, 4500.00, 7500.00, 5500.00),
  ('Operador de Produção', 'Responsável pela operação das máquinas', dept_producao_id, 2800.00, 4200.00, 3200.00),
  ('Supervisor de Produção', 'Responsável pela supervisão da produção', dept_producao_id, 4500.00, 6500.00, 5200.00),
  ('Assistente Administrativo', 'Apoio às atividades administrativas', dept_admin_id, 2200.00, 3500.00, 2800.00)
  ON CONFLICT (name) DO NOTHING;
END $$;

-- 3. TABELA DE FUNCIONÁRIOS
-- ===============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  pis VARCHAR(15),
  birth_date DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(30),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  bank_name VARCHAR(100),
  bank_agency VARCHAR(20),
  bank_account VARCHAR(50),
  account_type VARCHAR(20) DEFAULT 'corrente',
  status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'inativo', 'licenca', 'ferias', 'afastado'
  photo_url TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON employees(cpf);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

-- 4. TABELA DE PRESENÇAS/PONTO
-- ===============================================
CREATE TABLE IF NOT EXISTS attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  break_start_time TIME,
  break_end_time TIME,
  total_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'presente', -- 'presente', 'ausente', 'falta', 'licenca', 'ferias'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendances_employee_date ON attendances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_attendances_status ON attendances(status);

-- 5. TABELA DE AVALIAÇÕES DE DESEMPENHO
-- ===============================================
CREATE TABLE IF NOT EXISTS performance_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  goals_achieved INTEGER DEFAULT 0,
  goals_total INTEGER DEFAULT 0,
  performance_comments TEXT,
  strengths TEXT,
  improvement_areas TEXT,
  development_plan TEXT,
  status VARCHAR(20) DEFAULT 'em_andamento', -- 'em_andamento', 'concluida', 'cancelada'
  evaluation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_employee ON performance_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_period ON performance_evaluations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_status ON performance_evaluations(status);

-- 6. TABELA DE TREINAMENTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  instructor VARCHAR(255),
  duration_hours DECIMAL(4,1),
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  max_participants INTEGER,
  cost DECIMAL(15,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'planejado', -- 'planejado', 'em_andamento', 'concluido', 'cancelado'
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE PARTICIPAÇÃO EM TREINAMENTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS training_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  registration_date DATE DEFAULT CURRENT_DATE,
  attendance_status VARCHAR(20) DEFAULT 'inscrito', -- 'inscrito', 'presente', 'ausente', 'cancelado'
  completion_status VARCHAR(20) DEFAULT 'em_andamento', -- 'em_andamento', 'concluido', 'reprovado'
  score DECIMAL(5,2),
  certificate_issued BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_participations_unique ON training_participations(training_id, employee_id);

-- 8. TABELA DE FOLHA DE PAGAMENTO
-- ===============================================
CREATE TABLE IF NOT EXISTS payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  reference_month INTEGER NOT NULL CHECK (reference_month >= 1 AND reference_month <= 12),
  reference_year INTEGER NOT NULL,
  base_salary DECIMAL(15,2) NOT NULL,
  overtime_amount DECIMAL(15,2) DEFAULT 0.00,
  commission_amount DECIMAL(15,2) DEFAULT 0.00,
  bonus_amount DECIMAL(15,2) DEFAULT 0.00,
  gross_salary DECIMAL(15,2) NOT NULL,
  inss_amount DECIMAL(15,2) DEFAULT 0.00,
  irrf_amount DECIMAL(15,2) DEFAULT 0.00,
  fgts_amount DECIMAL(15,2) DEFAULT 0.00,
  other_deductions DECIMAL(15,2) DEFAULT 0.00,
  net_salary DECIMAL(15,2) NOT NULL,
  worked_days INTEGER DEFAULT 22,
  overtime_hours DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'calculada', -- 'calculada', 'aprovada', 'paga'
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_employee_period ON payroll(employee_id, reference_month, reference_year);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll(status);

-- 9. TRIGGERS PARA UPDATED_AT
-- ===============================================
-- Reutilizar função existente ou criar se necessário
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendances_updated_at ON attendances;
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_performance_evaluations_updated_at ON performance_evaluations;
CREATE TRIGGER update_performance_evaluations_updated_at BEFORE UPDATE ON performance_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_participations_updated_at ON training_participations;
CREATE TRIGGER update_training_participations_updated_at BEFORE UPDATE ON training_participations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payroll_updated_at ON payroll;
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. RLS (ROW LEVEL SECURITY) POLICIES
-- ===============================================

-- Habilitar RLS nas tabelas
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Políticas para departments
CREATE POLICY "Usuários podem ver departamentos" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir departamentos" ON departments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar departamentos" ON departments
  FOR UPDATE USING (true);

-- Políticas para positions
CREATE POLICY "Usuários podem ver posições" ON positions
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir posições" ON positions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar posições" ON positions
  FOR UPDATE USING (true);

-- Políticas para employees
CREATE POLICY "Usuários podem ver funcionários" ON employees
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir funcionários" ON employees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar funcionários" ON employees
  FOR UPDATE USING (true);

-- Políticas para attendances
CREATE POLICY "Usuários podem ver presenças" ON attendances
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir presenças" ON attendances
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar presenças" ON attendances
  FOR UPDATE USING (true);

-- Políticas para performance_evaluations
CREATE POLICY "Usuários podem ver avaliações" ON performance_evaluations
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir avaliações" ON performance_evaluations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar avaliações" ON performance_evaluations
  FOR UPDATE USING (true);

-- Políticas para trainings
CREATE POLICY "Usuários podem ver treinamentos" ON trainings
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir treinamentos" ON trainings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar treinamentos" ON trainings
  FOR UPDATE USING (true);

-- Políticas para training_participations
CREATE POLICY "Usuários podem ver participações" ON training_participations
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir participações" ON training_participations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar participações" ON training_participations
  FOR UPDATE USING (true);

-- Políticas para payroll
CREATE POLICY "Usuários podem ver folha de pagamento" ON payroll
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir folha de pagamento" ON payroll
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar folha de pagamento" ON payroll
  FOR UPDATE USING (true);

-- 11. FUNÇÕES AUXILIARES
-- ===============================================

-- Função para calcular horas trabalhadas
CREATE OR REPLACE FUNCTION calculate_worked_hours(
  check_in TIME,
  check_out TIME,
  break_start TIME DEFAULT NULL,
  break_end TIME DEFAULT NULL
)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  total_minutes INTEGER;
  break_minutes INTEGER := 0;
BEGIN
  IF check_in IS NULL OR check_out IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calcular total de minutos trabalhados
  total_minutes := EXTRACT(EPOCH FROM (check_out - check_in)) / 60;
  
  -- Subtrair pausa para almoço se informada
  IF break_start IS NOT NULL AND break_end IS NOT NULL THEN
    break_minutes := EXTRACT(EPOCH FROM (break_end - break_start)) / 60;
    total_minutes := total_minutes - break_minutes;
  END IF;
  
  -- Converter para horas decimais
  RETURN ROUND((total_minutes / 60.0)::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para gerar código de funcionário
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  next_number INTEGER;
  new_employee_code VARCHAR(20);
BEGIN
  -- Obter próximo número sequencial
  SELECT COALESCE(MAX(CAST(SUBSTRING(e.employee_code FROM 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM employees e
  WHERE e.employee_code ~ '^EMP[0-9]+$';
  
  -- Gerar código no formato EMP001, EMP002, etc.
  new_employee_code := 'EMP' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_employee_code;
END;
$$ LANGUAGE plpgsql;

-- 12. DADOS DE DEMONSTRAÇÃO (OPCIONAL)
-- ===============================================

-- Inserir funcionários de demonstração
DO $$
DECLARE
  dept_vendas_id UUID;
  dept_marketing_id UUID;
  dept_producao_id UUID;
  pos_gerente_vendas_id UUID;
  pos_analista_marketing_id UUID;
  pos_operador_producao_id UUID;
BEGIN
  -- Obter IDs dos departamentos
  SELECT id INTO dept_vendas_id FROM departments WHERE name = 'Vendas' LIMIT 1;
  SELECT id INTO dept_marketing_id FROM departments WHERE name = 'Marketing' LIMIT 1;
  SELECT id INTO dept_producao_id FROM departments WHERE name = 'Produção' LIMIT 1;
  
  -- Obter IDs das posições
  SELECT id INTO pos_gerente_vendas_id FROM positions WHERE name = 'Gerente de Vendas' LIMIT 1;
  SELECT id INTO pos_analista_marketing_id FROM positions WHERE name = 'Analista de Marketing' LIMIT 1;
  SELECT id INTO pos_operador_producao_id FROM positions WHERE name = 'Operador de Produção' LIMIT 1;
  
  -- Inserir funcionários
  INSERT INTO employees (
    employee_code, name, email, phone, cpf, rg, birth_date,
    department_id, position_id, hire_date, salary, status,
    address, bank_name, bank_agency, bank_account
  ) VALUES
  (
    generate_employee_code(), 'João Silva Santos', 'joao.silva@mestres.com', 
    '(11) 99999-1234', '123.456.789-00', '12.345.678-9', '1985-03-20',
    dept_vendas_id, pos_gerente_vendas_id, '2023-01-15', 8500.00, 'ativo',
    'Rua das Flores, 123 - São Paulo/SP', 'Banco do Brasil', '1234-5', '12345-6'
  ),
  (
    generate_employee_code(), 'Maria Oliveira Costa', 'maria.costa@mestres.com', 
    '(11) 99999-5678', '987.654.321-00', '98.765.432-1', '1990-07-15',
    dept_marketing_id, pos_analista_marketing_id, '2023-04-10', 5500.00, 'ativo',
    'Av. Paulista, 456 - São Paulo/SP', 'Itaú', '5678-9', '98765-4'
  ),
  (
    generate_employee_code(), 'Carlos Eduardo Lima', 'carlos.lima@mestres.com', 
    '(11) 99999-9012', '456.789.123-00', '45.678.912-3', '1988-12-05',
    dept_producao_id, pos_operador_producao_id, '2022-11-20', 3200.00, 'ativo',
    'Rua do Café, 789 - São Paulo/SP', 'Caixa Econômica', '9012-3', '45678-9'
  )
  ON CONFLICT (employee_code) DO NOTHING;
END $$;

-- Inserir alguns treinamentos
INSERT INTO trainings (name, description, instructor, duration_hours, start_date, end_date, location, max_participants, cost, status) VALUES
('Atendimento ao Cliente', 'Treinamento focado em excelência no atendimento', 'Sandra Oliveira', 8.0, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'Sala de Treinamento', 15, 500.00, 'planejado'),
('Segurança do Trabalho', 'Treinamento obrigatório de segurança', 'Roberto Silva', 4.0, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 'Auditório', 25, 300.00, 'planejado'),
('Técnicas de Torra', 'Aperfeiçoamento em técnicas de torra de café', 'Mestre Torreiro', 16.0, CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE + INTERVAL '47 days', 'Laboratório', 8, 1200.00, 'planejado')
ON CONFLICT (name) DO NOTHING;

-- Confirma a criação
SELECT 'Tabelas do módulo de RH criadas com sucesso!' AS status; 