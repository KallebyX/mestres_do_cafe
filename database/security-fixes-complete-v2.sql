-- ===============================================
-- 🔒 CORREÇÃO COMPLETA DE SEGURANÇA SUPABASE V2
-- Sistema Mestres do Café - Database Linter Fixes
-- VERSÃO IDEMPOTENTE (pode executar múltiplas vezes)
-- ===============================================

-- ============================================
-- 🔴 ERRO: RLS DISABLED - HABILITAR RLS
-- ============================================

-- Verificar e habilitar RLS apenas se necessário
DO $$
BEGIN
    -- 1. product_reviews
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_reviews') THEN
        ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para product_reviews';
    ELSE
        RAISE NOTICE 'RLS já habilitado para product_reviews';
    END IF;

    -- 2. blog_categories
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_categories') THEN
        IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_categories') THEN
            ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS habilitado para blog_categories';
        ELSE
            RAISE NOTICE 'RLS já habilitado para blog_categories';
        END IF;
    END IF;

    -- 3. discount_coupons
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discount_coupons') THEN
        IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discount_coupons') THEN
            ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS habilitado para discount_coupons';
        ELSE
            RAISE NOTICE 'RLS já habilitado para discount_coupons';
        END IF;
    END IF;

    -- 4. customer_segments
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segments') THEN
        IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segments') THEN
            ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS habilitado para customer_segments';
        ELSE
            RAISE NOTICE 'RLS já habilitado para customer_segments';
        END IF;
    END IF;

    -- 5. customer_segment_assignments
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segment_assignments') THEN
        IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segment_assignments') THEN
            ALTER TABLE public.customer_segment_assignments ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS habilitado para customer_segment_assignments';
        ELSE
            RAISE NOTICE 'RLS já habilitado para customer_segment_assignments';
        END IF;
    END IF;

    -- 6. campaign_metrics
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaign_metrics') THEN
        IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaign_metrics') THEN
            ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS habilitado para campaign_metrics';
        ELSE
            RAISE NOTICE 'RLS já habilitado para campaign_metrics';
        END IF;
    END IF;

    -- 7. gamification_levels
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gamification_levels') THEN
        IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gamification_levels') THEN
            ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS habilitado para gamification_levels';
        ELSE
            RAISE NOTICE 'RLS já habilitado para gamification_levels';
        END IF;
    END IF;
END $$;

-- ============================================
-- 🔐 POLICIES BÁSICAS DE SEGURANÇA
-- (Remover existentes e recriar)
-- ============================================

-- PRODUCT_REVIEWS: Remover policies existentes e recriar
DO $$
BEGIN
    -- Dropar policies existentes
    DROP POLICY IF EXISTS "Public can read product reviews" ON public.product_reviews;
    DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.product_reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;
    DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.product_reviews;
    
    -- Recriar policies
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_reviews') THEN
        CREATE POLICY "Public can read product reviews" ON public.product_reviews
        FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own reviews" ON public.product_reviews
        FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own reviews" ON public.product_reviews
        FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
        FOR DELETE USING (auth.uid() = user_id);
        
        RAISE NOTICE 'Policies criadas para product_reviews';
    END IF;
END $$;

-- BLOG_CATEGORIES
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

-- DISCOUNT_COUPONS
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view active coupons" ON public.discount_coupons;
    DROP POLICY IF EXISTS "Admin can manage coupons" ON public.discount_coupons;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discount_coupons') THEN
        CREATE POLICY "Users can view active coupons" ON public.discount_coupons
        FOR SELECT USING (is_active = true AND expires_at > now());

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

-- CUSTOMER_SEGMENTS
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

-- CUSTOMER_SEGMENT_ASSIGNMENTS
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their segment assignments" ON public.customer_segment_assignments;
    DROP POLICY IF EXISTS "Admin can manage segment assignments" ON public.customer_segment_assignments;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_segment_assignments') THEN
        CREATE POLICY "Users can view their segment assignments" ON public.customer_segment_assignments
        FOR SELECT USING (auth.uid() = customer_id);

        CREATE POLICY "Admin can manage segment assignments" ON public.customer_segment_assignments
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

-- CAMPAIGN_METRICS
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

-- GAMIFICATION_LEVELS
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

-- BLOG_COMMENTS
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read approved comments" ON public.blog_comments;
    DROP POLICY IF EXISTS "Users can insert comments" ON public.blog_comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON public.blog_comments;
    DROP POLICY IF EXISTS "Admin can manage all comments" ON public.blog_comments;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_comments') THEN
        CREATE POLICY "Public can read approved comments" ON public.blog_comments
        FOR SELECT USING (status = 'approved');

        CREATE POLICY "Users can insert comments" ON public.blog_comments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own comments" ON public.blog_comments
        FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Admin can manage all comments" ON public.blog_comments
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

-- COURSES
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read active courses" ON public.courses;
    DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        CREATE POLICY "Public can read active courses" ON public.courses
        FOR SELECT USING (is_active = true);

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

-- MARKETING_CAMPAIGNS
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

-- Função para recriar funções apenas se existirem
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

CREATE OR REPLACE FUNCTION public.update_testimonials_updated_at()
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

CREATE OR REPLACE FUNCTION public.calculate_customer_level(user_points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF user_points >= 10000 THEN
        RETURN 'diamond';
    ELSIF user_points >= 5000 THEN
        RETURN 'gold';
    ELSIF user_points >= 2000 THEN
        RETURN 'silver';
    ELSE
        RETURN 'bronze';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_discount_percentage(level TEXT)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    CASE level
        WHEN 'diamond' THEN RETURN 0.20;
        WHEN 'gold' THEN RETURN 0.15;
        WHEN 'silver' THEN RETURN 0.10;
        WHEN 'bronze' THEN RETURN 0.05;
        ELSE RETURN 0.00;
    END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customer_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.level = calculate_customer_level(NEW.points);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.blog_posts 
    SET views = COALESCE(views, 0) + 1 
    WHERE id = post_id;
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
    rowsecurity as rls_enabled
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

-- ============================================
-- 🎯 RESUMO DAS CORREÇÕES APLICADAS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏆 CORREÇÕES DE SEGURANÇA APLICADAS COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS habilitado em todas as tabelas necessárias';
    RAISE NOTICE '✅ Policies de segurança criadas/atualizadas';
    RAISE NOTICE '✅ Funções com search_path corrigido';
    RAISE NOTICE '✅ Script executado sem erros (idempotente)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Configure Auth settings no Dashboard Supabase';
    RAISE NOTICE '2. Execute Database Linter novamente';
    RAISE NOTICE '3. Teste o sistema para garantir funcionamento';
    RAISE NOTICE '';
END $$; 