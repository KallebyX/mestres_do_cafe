-- ===============================================
-- SCRIPT DE LIMPEZA E VERIFICAÇÃO - ERP MESTRES DO CAFÉ
-- Execute este script ANTES dos scripts principais para limpar conflitos
-- ===============================================

-- 1. REMOVER TODOS OS TRIGGERS EXISTENTES
-- ===============================================

-- Triggers do módulo financeiro
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_financial_categories_updated_at ON financial_categories;
DROP TRIGGER IF EXISTS update_accounts_receivable_updated_at ON accounts_receivable;
DROP TRIGGER IF EXISTS update_accounts_payable_updated_at ON accounts_payable;

-- Triggers do módulo de estoque
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses;
DROP TRIGGER IF EXISTS update_products_extended_updated_at ON products_extended;
DROP TRIGGER IF EXISTS update_product_locations_updated_at ON product_locations;
DROP TRIGGER IF EXISTS update_product_batches_updated_at ON product_batches;

-- Triggers do módulo RH
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS update_attendances_updated_at ON attendances;
DROP TRIGGER IF EXISTS update_performance_evaluations_updated_at ON performance_evaluations;
DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
DROP TRIGGER IF EXISTS update_training_participations_updated_at ON training_participations;
DROP TRIGGER IF EXISTS update_payroll_updated_at ON payroll;

-- 2. REMOVER FUNÇÕES ESPECÍFICAS (PRESERVE update_updated_at_column)
-- ===============================================

-- Não removemos update_updated_at_column() pois outras tabelas podem depender dela
-- DROP FUNCTION IF EXISTS update_updated_at_column();

DROP FUNCTION IF EXISTS generate_employee_code();
DROP FUNCTION IF EXISTS update_bank_account_balance(UUID, DECIMAL, VARCHAR);
DROP FUNCTION IF EXISTS update_product_stock(UUID, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS check_low_stock();
DROP FUNCTION IF EXISTS calculate_worked_hours(TIME, TIME, TIME, TIME);

-- 3. VERIFICAR ESTADO ATUAL DAS TABELAS
-- ===============================================

-- Verificar existência das tabelas principais
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE TABELAS EXISTENTES ===';
    
    -- Módulo Financeiro
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_accounts') THEN
        RAISE NOTICE '✅ bank_accounts existe';
    ELSE
        RAISE NOTICE '❌ bank_accounts NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_categories') THEN
        RAISE NOTICE '✅ financial_categories existe';
    ELSE
        RAISE NOTICE '❌ financial_categories NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts_receivable') THEN
        RAISE NOTICE '✅ accounts_receivable existe';
    ELSE
        RAISE NOTICE '❌ accounts_receivable NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts_payable') THEN
        RAISE NOTICE '✅ accounts_payable existe';
    ELSE
        RAISE NOTICE '❌ accounts_payable NÃO existe';
    END IF;
    
    -- Módulo Estoque
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE '✅ suppliers existe';
    ELSE
        RAISE NOTICE '❌ suppliers NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products_extended') THEN
        RAISE NOTICE '✅ products_extended existe';
    ELSE
        RAISE NOTICE '❌ products_extended NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_categories') THEN
        RAISE NOTICE '✅ product_categories existe';
    ELSE
        RAISE NOTICE '❌ product_categories NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') THEN
        RAISE NOTICE '✅ warehouses existe';
    ELSE
        RAISE NOTICE '❌ warehouses NÃO existe';
    END IF;
    
    -- Módulo RH
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
        RAISE NOTICE '✅ departments existe';
    ELSE
        RAISE NOTICE '❌ departments NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positions') THEN
        RAISE NOTICE '✅ positions existe';
    ELSE
        RAISE NOTICE '❌ positions NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        RAISE NOTICE '✅ employees existe';
    ELSE
        RAISE NOTICE '❌ employees NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trainings') THEN
        RAISE NOTICE '✅ trainings existe';
    ELSE
        RAISE NOTICE '❌ trainings NÃO existe';
    END IF;
    
    RAISE NOTICE '=== FIM DA VERIFICAÇÃO ===';
END $$;

-- 4. VERIFICAR CONSTRAINTS ÚNICAS
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE CONSTRAINTS ÚNICAS ===';
    
    -- Verificar financial_categories
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'financial_categories' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        RAISE NOTICE '✅ financial_categories.name tem constraint UNIQUE';
    ELSE
        RAISE NOTICE '❌ financial_categories.name NÃO tem constraint UNIQUE';
    END IF;
    
    -- Verificar departments
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'departments' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        RAISE NOTICE '✅ departments.name tem constraint UNIQUE';
    ELSE
        RAISE NOTICE '❌ departments.name NÃO tem constraint UNIQUE';
    END IF;
    
    -- Verificar suppliers
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'suppliers' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        RAISE NOTICE '✅ suppliers.name tem constraint UNIQUE';
    ELSE
        RAISE NOTICE '❌ suppliers.name NÃO tem constraint UNIQUE';
    END IF;
    
    RAISE NOTICE '=== FIM DA VERIFICAÇÃO DE CONSTRAINTS ===';
END $$;

-- 5. REMOVER CONSTRAINTS PROBLEMÁTICAS SE EXISTIREM
-- ===============================================

-- Remover constraint de foreign key problemática se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_accounts_payable_supplier' 
        AND table_name = 'accounts_payable'
    ) THEN
        ALTER TABLE accounts_payable DROP CONSTRAINT fk_accounts_payable_supplier;
        RAISE NOTICE '✅ Constraint fk_accounts_payable_supplier removida';
    END IF;
END $$;

-- 6. ADICIONAR CONSTRAINTS ÚNICAS SE NÃO EXISTIREM
-- ===============================================

-- financial_categories.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'financial_categories' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE financial_categories ADD CONSTRAINT financial_categories_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em financial_categories.name';
    END IF;
END $$;

-- departments.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'departments' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE departments ADD CONSTRAINT departments_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em departments.name';
    END IF;
END $$;

-- positions.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'positions' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE positions ADD CONSTRAINT positions_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em positions.name';
    END IF;
END $$;

-- trainings.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'trainings' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE trainings ADD CONSTRAINT trainings_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em trainings.name';
    END IF;
END $$;

-- suppliers.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'suppliers' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE suppliers ADD CONSTRAINT suppliers_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em suppliers.name';
    END IF;
END $$;

-- product_categories.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'product_categories' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE product_categories ADD CONSTRAINT product_categories_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em product_categories.name';
    END IF;
END $$;

-- warehouses.name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'warehouses' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'name'
    ) THEN
        ALTER TABLE warehouses ADD CONSTRAINT warehouses_name_unique UNIQUE (name);
        RAISE NOTICE '✅ Constraint UNIQUE adicionada em warehouses.name';
    END IF;
END $$;

-- 7. MENSAGEM FINAL
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '=== LIMPEZA E VERIFICAÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Agora você pode executar os scripts principais:';
    RAISE NOTICE '1. database/financial-tables-setup.sql';
    RAISE NOTICE '2. database/stock-tables-setup.sql';
    RAISE NOTICE '3. database/hr-tables-setup.sql';
    RAISE NOTICE '===========================================';
END $$; 