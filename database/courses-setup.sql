-- ==========================================
-- MESTRES DO CAFÉ - SETUP CURSOS
-- Tabela e dados iniciais para o sistema de cursos
-- ==========================================

-- Criar tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  duration TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado', 'Todos os Níveis')),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  instructor TEXT NOT NULL,
  max_students INTEGER NOT NULL DEFAULT 12,
  enrolled_students INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  schedule TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can view all courses" ON courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage all courses" ON courses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Inserir cursos iniciais
INSERT INTO courses (title, description, detailed_description, duration, level, price, original_price, instructor, max_students, enrolled_students, rating, image, tags, is_active, is_featured, schedule, location) VALUES
('Barista Profissional - Nível Básico', 
 'Aprenda os fundamentos da arte do café, desde a extração até a apresentação.',
 'Este curso cobre todos os aspectos fundamentais para se tornar um barista profissional. Você aprenderá técnicas de extração, preparo de diferentes bebidas, uso de equipamentos profissionais e muito mais.',
 '8 horas',
 'Iniciante',
 450.00,
 550.00,
 'Carlos Silva',
 12,
 8,
 4.9,
 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
 ARRAY['Barista', 'Espresso', 'Latte Art'],
 true,
 true,
 'Sábados 9h às 17h',
 'Centro de Treinamento - São Paulo'),

('Cupping e Análise Sensorial',
 'Desenvolva seu paladar para identificar notas e qualidades do café.',
 'Curso avançado de análise sensorial onde você aprenderá as técnicas profissionais de cupping, identificação de defeitos, análise de aromas e sabores.',
 '6 horas',
 'Intermediário',
 380.00,
 450.00,
 'Ana Costa',
 8,
 6,
 4.8,
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
 ARRAY['Cupping', 'Análise Sensorial', 'Q-Grader'],
 true,
 false,
 'Domingos 10h às 16h',
 'Laboratório de Cupping - São Paulo'),

('Torra Artesanal - Intermediário',
 'Domine as técnicas de torrefação para criar perfis únicos de sabor.',
 'Aprenda a torrar café como um profissional, controlando temperatura, tempo e perfis de torra para extrair o melhor de cada origem.',
 '12 horas',
 'Intermediário',
 650.00,
 750.00,
 'Roberto Mendes',
 6,
 4,
 4.7,
 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=400',
 ARRAY['Torra', 'Perfis', 'Torrador'],
 true,
 true,
 'Sábado e Domingo 9h às 15h',
 'Torrefação Escola - São Paulo'),

('Gestão de Cafeteria',
 'Aprenda a gerenciar todos os aspectos de uma cafeteria de sucesso.',
 'Curso completo de gestão focado no negócio de cafeteria, cobrindo gestão financeira, atendimento, cardápio, marketing e operações.',
 '16 horas',
 'Avançado',
 850.00,
 950.00,
 'Márcia Oliveira',
 15,
 12,
 4.6,
 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400',
 ARRAY['Gestão', 'Negócios', 'Cafeteria'],
 true,
 false,
 'Fins de semana - 2 módulos',
 'Centro Empresarial - São Paulo')
ON CONFLICT DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_courses_updated_at ON courses;
CREATE TRIGGER trigger_update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_courses_updated_at();

COMMENT ON TABLE courses IS 'Tabela de cursos de especialização em café';
COMMENT ON COLUMN courses.enrolled_students IS 'Número atual de alunos matriculados';
COMMENT ON COLUMN courses.max_students IS 'Número máximo de alunos permitidos';
COMMENT ON COLUMN courses.rating IS 'Avaliação média do curso (0-5)';
COMMENT ON COLUMN courses.tags IS 'Array de tags para categorização e busca'; 