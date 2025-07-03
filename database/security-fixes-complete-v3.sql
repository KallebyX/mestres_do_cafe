-- ===============================================
-- 🔒 CORREÇÃO COMPLETA DE SEGURANÇA SUPABASE V3
-- Sistema Mestres do Café - Database Linter Fixes
-- VERSÃO ULTRA ROBUSTA (verifica colunas antes de usar)
-- ===============================================

-- Função auxiliar para verificar se coluna existe
CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$;

-- ============================================
-- 🔴 ERRO: RLS DISABLED - HABILITAR RLS
-- ============================================

-- Verificar e habilitar RLS apenas se necessário
DO $$
DECLARE
    tables_to_enable text[] := ARRAY[
        'product_reviews',
        'blog_categories', 
        'discount_coupons',
        'customer_segments',
        'customer_segment_assignments',
        'campaign_metrics',
        'gamification_levels'
    ];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY tables_to_enable
    LOOP
        -- Verificar se tabela existe
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
            -- Verificar se RLS já está habilitado
            IF NOT (SELECT COALESCE(rowsecurity, false) FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
                EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
                RAISE NOTICE 'RLS habilitado para %', table_name;
            ELSE
                RAISE NOTICE 'RLS já habilitado para %', table_name;
            END IF;
        ELSE
            RAISE NOTICE 'Tabela % não existe - pulando', table_name;
        END IF;
    END LOOP;
END $$;

-- ============================================
-- 🔐 POLICIES BÁSICAS DE SEGURANÇA
-- (Ultra robustas - verificam colunas antes de usar)
-- ============================================

-- PRODUCT_REVIEWS: Policies simples sem verificação de coluna específica
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read product reviews" ON public.product_reviews;
    DROP POLICY IF EXISTS "Users can insert reviews" ON public.product_reviews;
    DROP POLICY IF EXISTS "Admin can manage reviews" ON public.product_reviews;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_reviews') THEN
        -- Policy de leitura pública
        CREATE POLICY "Public can read product reviews" ON public.product_reviews
        FOR SELECT USING (true);

        -- Policy de inserção (se tem user_id)
        IF public.column_exists('product_reviews', 'user_id') THEN
            CREATE POLICY "Users can insert reviews" ON public.product_reviews
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can insert reviews" ON public.product_reviews
            FOR INSERT WITH CHECK (true);
        END IF;

        -- Policy admin geral
        CREATE POLICY "Admin can manage reviews" ON public.product_reviews
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para product_reviews';
    END IF;
END $$;

-- BLOG_CATEGORIES: Policies simples
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read blog categories" ON public.blog_categories;
    DROP POLICY IF EXISTS "Admin can manage blog categories" ON public.blog_categories;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_categories') THEN
        CREATE POLICY "Public can read blog categories" ON public.blog_categories
        FOR SELECT USING (true);

        CREATE POLICY "Admin can manage blog categories" ON public.blog_categories
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para blog_categories';
    END IF;
END $$;

-- DISCOUNT_COUPONS: Verificar colunas antes de usar
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view coupons" ON public.discount_coupons;
    DROP POLICY IF EXISTS "Admin can manage coupons" ON public.discount_coupons;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discount_coupons') THEN
        -- Policy de leitura com verificação de colunas
        IF public.column_exists('discount_coupons', 'is_active') AND public.column_exists('discount_coupons', 'expires_at') THEN
            CREATE POLICY "Users can view coupons" ON public.discount_coupons
            FOR SELECT USING (is_active = true AND expires_at > now());
        ELSE
            CREATE POLICY "Users can view coupons" ON public.discount_coupons
            FOR SELECT USING (true);
        END IF;

        CREATE POLICY "Admin can manage coupons" ON public.discount_coupons
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para discount_coupons';
    END IF;
END $$;

-- CUSTOMER_SEGMENTS: Policy simples admin-only
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin can manage customer segments" ON public.customer_segments;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segments') THEN
        CREATE POLICY "Admin can manage customer segments" ON public.customer_segments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para customer_segments';
    END IF;
END $$;

-- CUSTOMER_SEGMENT_ASSIGNMENTS: Verificar customer_id
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their assignments" ON public.customer_segment_assignments;
    DROP POLICY IF EXISTS "Admin can manage assignments" ON public.customer_segment_assignments;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segment_assignments') THEN
        -- Policy de leitura com verificação de coluna
        IF public.column_exists('customer_segment_assignments', 'customer_id') THEN
            CREATE POLICY "Users can view their assignments" ON public.customer_segment_assignments
            FOR SELECT USING (auth.uid() = customer_id);
        ELSE
            CREATE POLICY "Users can view their assignments" ON public.customer_segment_assignments
            FOR SELECT USING (false); -- Não permitir se não tem customer_id
        END IF;

        CREATE POLICY "Admin can manage assignments" ON public.customer_segment_assignments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para customer_segment_assignments';
    END IF;
END $$;

-- CAMPAIGN_METRICS: Policy simples admin-only
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin can manage campaign metrics" ON public.campaign_metrics;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaign_metrics') THEN
        CREATE POLICY "Admin can manage campaign metrics" ON public.campaign_metrics
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para campaign_metrics';
    END IF;
END $$;

-- GAMIFICATION_LEVELS: Leitura pública, admin gerencia
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read gamification levels" ON public.gamification_levels;
    DROP POLICY IF EXISTS "Admin can manage gamification levels" ON public.gamification_levels;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gamification_levels') THEN
        CREATE POLICY "Public can read gamification levels" ON public.gamification_levels
        FOR SELECT USING (true);

        CREATE POLICY "Admin can manage gamification levels" ON public.gamification_levels
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para gamification_levels';
    END IF;
END $$;

-- ============================================
-- 🔵 INFO: POLICIES PARA TABELAS COM RLS
-- ============================================

-- BLOG_COMMENTS: Verificar colunas status e user_id
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read comments" ON public.blog_comments;
    DROP POLICY IF EXISTS "Users can insert comments" ON public.blog_comments;
    DROP POLICY IF EXISTS "Users can update comments" ON public.blog_comments;
    DROP POLICY IF EXISTS "Admin can manage comments" ON public.blog_comments;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_comments') THEN
        -- Policy de leitura com verificação de coluna status
        IF public.column_exists('blog_comments', 'status') THEN
            CREATE POLICY "Public can read comments" ON public.blog_comments
            FOR SELECT USING (status = 'approved');
        ELSE
            CREATE POLICY "Public can read comments" ON public.blog_comments
            FOR SELECT USING (true);
        END IF;

        -- Policy de inserção com verificação de user_id
        IF public.column_exists('blog_comments', 'user_id') THEN
            CREATE POLICY "Users can insert comments" ON public.blog_comments
            FOR INSERT WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can update comments" ON public.blog_comments
            FOR UPDATE USING (auth.uid() = user_id);
        ELSE
            CREATE POLICY "Users can insert comments" ON public.blog_comments
            FOR INSERT WITH CHECK (true);

            CREATE POLICY "Users can update comments" ON public.blog_comments
            FOR UPDATE USING (true);
        END IF;

        CREATE POLICY "Admin can manage comments" ON public.blog_comments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para blog_comments';
    END IF;
END $$;

-- COURSES: Verificar is_active
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read courses" ON public.courses;
    DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        -- Policy de leitura com verificação de is_active
        IF public.column_exists('courses', 'is_active') THEN
            CREATE POLICY "Public can read courses" ON public.courses
            FOR SELECT USING (is_active = true);
        ELSE
            CREATE POLICY "Public can read courses" ON public.courses
            FOR SELECT USING (true);
        END IF;

        CREATE POLICY "Admin can manage courses" ON public.courses
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para courses';
    END IF;
END $$;

-- MARKETING_CAMPAIGNS: Policy simples admin-only
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin can manage marketing campaigns" ON public.marketing_campaigns;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketing_campaigns') THEN
        CREATE POLICY "Admin can manage marketing campaigns" ON public.marketing_campaigns
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'super_admin')
          )
        );
        
        RAISE NOTICE 'Policies criadas para marketing_campaigns';
    END IF;
END $$;

-- ============================================
-- 🟡 WARN: CORRIGIR SEARCH_PATH DAS FUNÇÕES
-- ============================================

-- Recriar apenas as funções mais essenciais
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, created_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), NEW.created_at)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- ✅ VERIFICAÇÃO DE SEGURANÇA
-- ============================================

-- Verificar RLS habilitado
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    COALESCE(rowsecurity, false) as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'product_reviews', 
    'blog_categories', 
    'discount_coupons',
    'customer_segments',
    'customer_segment_assignments', 
    'campaign_metrics',
    'gamification_levels',
    'blog_comments',
    'courses',
    'marketing_campaigns'
)
ORDER BY tablename;

-- Contar policies criadas
SELECT 
    'Policy Count' as check_type,
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'product_reviews', 
    'blog_categories', 
    'discount_coupons',
    'customer_segments',
    'customer_segment_assignments', 
    'campaign_metrics',
    'gamification_levels',
    'blog_comments',
    'courses',
    'marketing_campaigns'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Listar colunas das tabelas principais para debug
SELECT 
    'Column Check' as check_type,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('product_reviews', 'blog_comments', 'courses', 'discount_coupons')
ORDER BY table_name, ordinal_position;

-- ============================================
-- 🧹 LIMPEZA
-- ============================================

-- Remover função auxiliar
DROP FUNCTION IF EXISTS public.column_exists(text, text);

-- ============================================
-- 🎯 RESUMO DAS CORREÇÕES APLICADAS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏆 CORREÇÕES DE SEGURANÇA V3 APLICADAS COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS habilitado em todas as tabelas existentes';
    RAISE NOTICE '✅ Policies robustas criadas (verificam colunas)';
    RAISE NOTICE '✅ Funções essenciais com search_path corrigido';
    RAISE NOTICE '✅ Script ultra robusto executado sem erros';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Verifique os resultados das queries acima';
    RAISE NOTICE '2. Configure Auth settings no Dashboard Supabase';
    RAISE NOTICE '3. Execute Database Linter novamente';
    RAISE NOTICE '';
END $$; 