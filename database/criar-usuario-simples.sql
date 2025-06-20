-- =========================================
-- MÉTODO SIMPLES - CRIAR USUÁRIO DEMO
-- =========================================

-- 1. Primeiro, verificar se usuário já existe
SELECT email FROM auth.users WHERE email = 'cliente@teste.com';

-- 2. Se não existe, copie e cole apenas ESTA linha:
SELECT auth.create_user('{"email": "cliente@teste.com", "password": "123456", "email_confirm": true}');

-- 3. Verificar se foi criado
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'cliente@teste.com';

-- 4. Se não funcionou, use a interface:
-- Authentication > Users > Add user
-- Email: cliente@teste.com
-- Password: 123456
-- Auto Confirm: SIM 