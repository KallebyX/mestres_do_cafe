-- =============================================
-- MESTRES DO CAFÉ - CRM AVANÇADO
-- Estruturas de tabelas para funcionalidades avançadas de CRM
-- =============================================

-- 1. Tabela de Notas dos Clientes
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Interações com Clientes
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'support', 'admin_action', 'other')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Tarefas relacionadas aos Clientes
CREATE TABLE IF NOT EXISTS customer_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Histórico de Pontos (para gamificação)
CREATE TABLE IF NOT EXISTS points_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    admin_action BOOLEAN DEFAULT FALSE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Alertas Automáticos
CREATE TABLE IF NOT EXISTS customer_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('inactive_customer', 'high_value', 'birthday', 'anniversary', 'payment_due', 'custom')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    trigger_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Segmentação de Clientes
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    criteria JSONB NOT NULL, -- Critérios de segmentação em formato JSON
    color VARCHAR(7) DEFAULT '#6B7280', -- Cor hexadecimal para identificação visual
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Relacionamento Cliente-Segmento
CREATE TABLE IF NOT EXISTS customer_segment_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(customer_id, segment_id)
);

-- 8. Adicionar colunas extras na tabela users para CRM
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT 'Bronze',
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS cpf_cnpj VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array de tags para categorização
ADD COLUMN IF NOT EXISTS customer_since TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 9. Tabela de Campanhas de Marketing
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'push', 'discount', 'loyalty')),
    target_segment UUID[] DEFAULT '{}', -- Array de IDs de segmentos
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    budget DECIMAL(10,2),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Métricas de Campanha
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('sent', 'opened', 'clicked', 'converted', 'unsubscribed')),
    value DECIMAL(10,2), -- Valor da conversão, se aplicável
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para customer_notes
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_admin_id ON customer_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes(created_at DESC);

-- Índices para customer_interactions
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_admin_id ON customer_interactions(admin_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions(type);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at ON customer_interactions(created_at DESC);

-- Índices para customer_tasks
CREATE INDEX IF NOT EXISTS idx_customer_tasks_customer_id ON customer_tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tasks_admin_id ON customer_tasks(admin_id);
CREATE INDEX IF NOT EXISTS idx_customer_tasks_status ON customer_tasks(status);
CREATE INDEX IF NOT EXISTS idx_customer_tasks_priority ON customer_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_customer_tasks_due_date ON customer_tasks(due_date);

-- Índices para points_history
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);

-- Índices para customer_alerts
CREATE INDEX IF NOT EXISTS idx_customer_alerts_customer_id ON customer_alerts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_alerts_status ON customer_alerts(status);
CREATE INDEX IF NOT EXISTS idx_customer_alerts_priority ON customer_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_customer_alerts_alert_type ON customer_alerts(alert_type);

-- Índices para users (colunas novas)
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_users_tags ON users USING GIN(tags);

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para customer_notes
CREATE POLICY "Admins podem ver todas as notas" ON customer_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins podem inserir notas" ON customer_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Políticas similares para as outras tabelas
CREATE POLICY "Admins podem ver todas as interações" ON customer_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins podem inserir interações" ON customer_interactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins podem ver todas as tarefas" ON customer_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins podem ver histórico de pontos" ON points_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Usuários podem ver seu próprio histórico de pontos" ON points_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todos os alertas" ON customer_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para calcular nível do cliente baseado em pontos
CREATE OR REPLACE FUNCTION calculate_customer_level(points INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    CASE 
        WHEN points >= 10000 THEN RETURN 'Diamante';
        WHEN points >= 5000 THEN RETURN 'Ouro';
        WHEN points >= 2000 THEN RETURN 'Prata';
        ELSE RETURN 'Bronze';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar automaticamente o nível quando os pontos mudam
CREATE OR REPLACE FUNCTION update_customer_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level = calculate_customer_level(NEW.points);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar nível automaticamente
DROP TRIGGER IF EXISTS trigger_update_customer_level ON users;
CREATE TRIGGER trigger_update_customer_level
    BEFORE UPDATE OF points ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_level();

-- Função para criar alertas automáticos
CREATE OR REPLACE FUNCTION create_customer_alert(
    p_customer_id UUID,
    p_alert_type VARCHAR(50),
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_priority VARCHAR(20) DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO customer_alerts (customer_id, alert_type, title, description, priority)
    VALUES (p_customer_id, p_alert_type, p_title, p_description, p_priority)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir segmentos padrão
INSERT INTO customer_segments (name, description, criteria, color) VALUES
('Clientes VIP', 'Clientes com alto valor de compra', '{"min_total_spent": 2000, "min_orders": 10}', '#8B5CF6'),
('Novos Clientes', 'Clientes cadastrados recentemente', '{"days_since_registration": 30}', '#10B981'),
('Clientes Inativos', 'Clientes sem compras há mais de 90 dias', '{"days_since_last_order": 90}', '#EF4444'),
('Compradores Frequentes', 'Clientes com alta frequência de compra', '{"min_orders": 5, "avg_days_between_orders": 30}', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE customer_notes IS 'Notas administrativas sobre clientes';
COMMENT ON TABLE customer_interactions IS 'Histórico de interações com clientes';
COMMENT ON TABLE customer_tasks IS 'Tarefas relacionadas ao atendimento de clientes';
COMMENT ON TABLE points_history IS 'Histórico de pontos de gamificação dos clientes';
COMMENT ON TABLE customer_alerts IS 'Alertas automáticos sobre clientes';
COMMENT ON TABLE customer_segments IS 'Segmentos de clientes para campanhas direcionadas';
COMMENT ON TABLE marketing_campaigns IS 'Campanhas de marketing';
COMMENT ON TABLE campaign_metrics IS 'Métricas de performance das campanhas'; 