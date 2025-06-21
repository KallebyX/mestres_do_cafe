-- =========================================
-- SCRIPT FINAL CORRETO - COM NAME
-- UUID: ad3deab6-30f5-4612-a1a2-56f18c153599
-- =========================================

-- VERSÃO CORRETA (com name obrigatório)
INSERT INTO public.users (id, name, email, role) 
VALUES (
  'ad3deab6-30f5-4612-a1a2-56f18c153599',
  'Administrador Sistema',
  'admin@mestrescafe.com',
  'super_admin'
);

-- Se der erro de duplicata, use esta versão:
-- INSERT INTO public.users (id, name, email, role) 
-- VALUES (
--   'ad3deab6-30f5-4612-a1a2-56f18c153599',
--   'Administrador Sistema',
--   'admin@mestrescafe.com',
--   'super_admin'
-- )
-- ON CONFLICT (id) DO UPDATE SET 
--   role = 'super_admin',
--   name = 'Administrador Sistema';

-- =========================================
-- VERIFICAR SE FUNCIONOU
-- =========================================

SELECT id, name, email, role FROM public.users 
WHERE email = 'admin@mestrescafe.com'; 