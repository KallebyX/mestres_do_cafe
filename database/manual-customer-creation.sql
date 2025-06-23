-- ================================================
-- SCRIPT: Criação Manual de Clientes pelo Admin
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- Adicionar colunas necessárias à tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS criado_por_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pendente_ativacao BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_ativacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES users(id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_criado_por_admin ON users(criado_por_admin);
CREATE INDEX IF NOT EXISTS idx_users_pendente_ativacao ON users(pendente_ativacao);
CREATE INDEX IF NOT EXISTS idx_users_created_by_admin ON users(created_by_admin_id);

-- Criar tabela de logs de criação manual
CREATE TABLE IF NOT EXISTS admin_customer_creation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES users(id) NOT NULL,
  customer_id UUID REFERENCES users(id) NOT NULL,
  admin_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  action_type TEXT DEFAULT 'create', -- create, activate, edit, status_change
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_logs_admin_id ON admin_customer_creation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_logs_customer_id ON admin_customer_creation_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON admin_customer_creation_logs(created_at);

-- Trigger para registrar logs automaticamente
CREATE OR REPLACE FUNCTION log_admin_customer_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Log quando um cliente é criado pelo admin
    IF NEW.criado_por_admin = true AND OLD.criado_por_admin IS DISTINCT FROM NEW.criado_por_admin THEN
        INSERT INTO admin_customer_creation_logs (
            admin_id, customer_id, admin_name, customer_name, customer_email, 
            action_type, details
        ) VALUES (
            NEW.created_by_admin_id, NEW.id, 
            (SELECT name FROM users WHERE id = NEW.created_by_admin_id),
            NEW.name, NEW.email,
            'create',
            jsonb_build_object(
                'user_type', NEW.user_type,
                'phone', NEW.phone,
                'cpf_cnpj', NEW.cpf_cnpj,
                'city', NEW.city,
                'state', NEW.state,
                'observacao', NEW.observacao
            )
        );
    END IF;
    
    -- Log quando um cliente é ativado
    IF NEW.pendente_ativacao = false AND OLD.pendente_ativacao = true THEN
        INSERT INTO admin_customer_creation_logs (
            admin_id, customer_id, admin_name, customer_name, customer_email,
            action_type, details
        ) VALUES (
            NEW.created_by_admin_id, NEW.id,
            (SELECT name FROM users WHERE id = NEW.created_by_admin_id),
            NEW.name, NEW.email,
            'activate',
            jsonb_build_object(
                'data_ativacao', NEW.data_ativacao,
                'previous_status', 'pendente'
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger
CREATE TRIGGER log_admin_customer_actions 
    AFTER UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION log_admin_customer_creation();

-- RLS para logs (apenas admins podem ver)
ALTER TABLE admin_customer_creation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view creation logs" 
    ON admin_customer_creation_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- ================================================
-- DADOS DE EXEMPLO PARA TESTES
-- ================================================

-- Comentário: Alguns clientes de exemplo criados pelo admin
-- (descomente se quiser dados de teste)

/*
-- Cliente PF criado pelo admin (pendente ativação)
INSERT INTO users (
    id, name, email, user_type, phone, cpf_cnpj, 
    address, city, state, zip_code,
    criado_por_admin, pendente_ativacao, created_by_admin_id, observacao
) VALUES (
    gen_random_uuid(),
    'Carlos da Silva Santos',
    'carlos.santos@email.com',
    'cliente_pf',
    '(51) 99887-6655',
    '123.456.789-10',
    'Rua das Flores, 123, Centro',
    'Santa Maria',
    'RS',
    '97010-123',
    true,
    true,
    'ad3deab6-30f5-4612-a1a2-56f18c153599', -- ID do admin
    'Cliente da loja física - sem WhatsApp'
);

-- Cliente PJ criado pelo admin (pendente ativação)
INSERT INTO users (
    id, name, email, user_type, phone, cpf_cnpj,
    address, city, state, zip_code, company_name,
    criado_por_admin, pendente_ativacao, created_by_admin_id, observacao
) VALUES (
    gen_random_uuid(),
    'Maria Fernanda Costa',
    'contato@cafeteriacentral.com',
    'cliente_pj',
    '(51) 3456-7890',
    '12.345.678/0001-90',
    'Av. Principal, 456, Comercial',
    'Porto Alegre',
    'RS',
    '90010-456',
    'Cafeteria Central Ltda',
    true,
    true,
    'ad3deab6-30f5-4612-a1a2-56f18c153599',
    'Parceria comercial - café corporativo'
);
*/

-- Verificar se as alterações foram aplicadas
SELECT 'Estrutura atualizada com sucesso!' as status;

-- Verificar novas colunas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('criado_por_admin', 'pendente_ativacao', 'data_ativacao', 'observacao', 'created_by_admin_id')
ORDER BY column_name; 