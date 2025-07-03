-- ===============================================
-- 🌟 TABELA DE TESTIMONIALS (DEPOIMENTOS)
-- Sistema dos Mestres do Café
-- ===============================================

-- Criar tabela de testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
    comment TEXT NOT NULL,
    location VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir testimonials de exemplo
INSERT INTO public.testimonials (name, role, avatar_url, rating, comment, location, is_featured, is_active) VALUES
('Maria Silva', 'Empresária', '/images/avatars/maria.jpg', 5, 'A qualidade dos cafés é excepcional. O sistema de pontos me incentiva a experimentar novos sabores sempre. Já indiquei para várias amigas!', 'Santa Maria, RS', true, true),
('João Santos', 'Chef de Cozinha', '/images/avatars/joao.jpg', 5, 'Como chef, posso dizer que estes são os melhores cafés especiais que já provei. A origem é impecável e a torra artesanal faz toda a diferença.', 'Porto Alegre, RS', true, true),
('Ana Costa', 'Barista Profissional', '/images/avatars/ana.jpg', 5, 'Trabalho com café há 15 anos e a Mestres do Café tem os grãos mais consistentes e frescos do mercado. Qualidade excepcional!', 'São Paulo, SP', true, true),
('Carlos Eduardo', 'Engenheiro', NULL, 4, 'Descobri os cafés através de um amigo e me tornei cliente fiel. A entrega é sempre pontual e o atendimento nota 10!', 'Santa Maria, RS', false, true),
('Fernanda Lima', 'Arquiteta', NULL, 5, 'O café chegou fresquinho, bem embalado e com um aroma incrível. Já virou meu ritual matinal favorito!', 'Rio de Janeiro, RJ', false, true),
('Roberto Pereira', 'Professor', NULL, 5, 'Como apreciador de cafés especiais, posso afirmar que encontrei aqui a qualidade que procurava. Recomendo a todos!', 'Belo Horizonte, MG', false, true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials(rating);

-- RLS (Row Level Security)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (todos podem ler testimonials ativos)
CREATE POLICY "Testimonials são públicos para leitura" ON public.testimonials
    FOR SELECT USING (is_active = true);

-- Política para admin (apenas admin pode modificar)
CREATE POLICY "Apenas admin pode modificar testimonials" ON public.testimonials
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_testimonials_timestamp
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();

-- Comentários da tabela
COMMENT ON TABLE public.testimonials IS 'Tabela de depoimentos/testimonials dos clientes';
COMMENT ON COLUMN public.testimonials.name IS 'Nome do cliente que fez o depoimento';
COMMENT ON COLUMN public.testimonials.role IS 'Profissão ou cargo do cliente';
COMMENT ON COLUMN public.testimonials.avatar_url IS 'URL da foto do cliente (opcional)';
COMMENT ON COLUMN public.testimonials.rating IS 'Avaliação de 1 a 5 estrelas';
COMMENT ON COLUMN public.testimonials.comment IS 'Texto do depoimento';
COMMENT ON COLUMN public.testimonials.location IS 'Localização do cliente (cidade, estado)';
COMMENT ON COLUMN public.testimonials.is_featured IS 'Se deve aparecer em destaque na landing page';
COMMENT ON COLUMN public.testimonials.is_active IS 'Se o testimonial está ativo/visível';

-- Verificar se a tabela foi criada com sucesso
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar testimonials inseridos
SELECT 
    id,
    name,
    role,
    rating,
    is_featured,
    is_active,
    LEFT(comment, 50) || '...' as comment_preview
FROM public.testimonials 
ORDER BY is_featured DESC, created_at DESC; 