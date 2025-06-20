-- =========================================
-- CRIAR USUÁRIO DEMO - SUPABASE
-- =========================================

-- Verificar se usuário já existe
SELECT email FROM auth.users WHERE email = 'cliente@teste.com';

-- Se não existir, criar via interface ou usar este INSERT
-- (Execute este comando APENAS se o SELECT acima retornar vazio)

-- IMPORTANTE: Este método pode não funcionar em todos os casos
-- É mais seguro usar a interface Authentication > Users > Add user

-- Criar usuário demo (método alternativo)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'cliente@teste.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Cliente Demo"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
);

-- Verificar se o usuário foi criado
SELECT id, email, created_at FROM auth.users WHERE email = 'cliente@teste.com'; 