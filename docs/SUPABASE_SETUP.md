# 🚀 Configuração Supabase - Mestres do Café

## 🎯 Por que Supabase?

O sistema JSON atual tem limitações que causam os erros de login. Supabase oferece:

- ✅ **Banco PostgreSQL real** (muito mais confiável)
- ✅ **Autenticação nativa** (sem bugs de senha)
- ✅ **Dashboard visual** (fácil de gerenciar)
- ✅ **APIs automáticas** (REST + GraphQL)
- ✅ **Gratuito** para desenvolvimento
- ✅ **Deploy automático** (sem configuração extra)

## 📋 Passo a Passo - Configuração

### **1. Criar Conta Supabase**
1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub (recomendado)

### **2. Criar Novo Projeto**
1. Clique em **"New Project"**
2. Configure:
   - **Name:** `mestres-do-cafe`
   - **Database Password:** Crie uma senha forte
   - **Region:** South America (mais próximo)
   - **Pricing Plan:** Free (suficiente)
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos para o projeto ser criado

### **3. Configurar Banco de Dados**

No dashboard do Supabase, vá em **SQL Editor** e execute este SQL:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'cliente_pf',
  phone TEXT,
  cpf_cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  company_name TEXT,
  company_segment TEXT,
  points INTEGER DEFAULT 100,
  level TEXT DEFAULT 'aprendiz',
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT DEFAULT 'cafe',
  origin TEXT,
  sca_score INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for new users" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para produtos (todos podem ver)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.user_type = 'admin'
  )
);

-- Inserir produtos demo
INSERT INTO products (name, description, price, original_price, origin, sca_score, is_featured, is_active, stock_quantity, images) VALUES
('Café Bourbon Amarelo Premium', 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo.', 45.90, 52.90, 'Montanhas de Minas', 86, true, true, 50, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400']),
('Café Geisha Especial', 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.', 89.90, 105.90, 'Fazenda São Benedito', 92, true, true, 30, ARRAY['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400']),
('Blend Signature', 'Blend especial da casa com equilíbrio perfeito entre doçura e acidez.', 67.90, 75.90, 'Seleção Especial', 88, true, true, 40, ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400']);

-- Criar usuário demo
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'cliente@teste.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

### **4. Obter Credenciais**

1. No dashboard, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (algo como: `https://xyz.supabase.co`)
   - **anon public** key (chave longa)

### **5. Configurar Variáveis de Ambiente**

Crie arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**⚠️ IMPORTANTE:** Substitua pelos valores reais do seu projeto!

### **6. Ativar Supabase no Código**

No arquivo `src/App.jsx`, substitua o AuthProvider pelo SupabaseAuthProvider:

```jsx
// ANTES (sistema antigo com bugs)
import { AuthProvider } from './contexts/AuthContext';

// DEPOIS (sistema novo com Supabase)
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';

// E substitua:
<AuthProvider>  →  <SupabaseAuthProvider>
```

## 🎮 **Credenciais de Teste**

Após configurar, você pode usar:

```
📧 Email: cliente@teste.com
🔑 Senha: 123456
```

Ou criar novas contas diretamente no formulário de registro!

## 🔍 **Verificar se Funcionou**

1. **Teste conexão:** Abra http://localhost:5173
2. **Teste login:** Use as credenciais demo
3. **Teste cadastro:** Crie uma conta nova
4. **Dashboard Supabase:** Veja os dados sendo criados

## 🆘 **Resolução de Problemas**

### **❌ "Invalid login credentials"**
- Verifique se o usuário demo foi criado no SQL
- Confira se as credenciais estão corretas

### **❌ "Failed to connect"**
- Verifique VITE_SUPABASE_URL no .env
- Confirme se o projeto Supabase está ativo

### **❌ "Unauthorized"**
- Verifique VITE_SUPABASE_ANON_KEY no .env
- Confira se a chave está correta no dashboard

### **❌ "Row Level Security"**
- Verifique se as políticas RLS foram criadas
- Execute novamente o SQL de configuração

## 🎉 **Vantagens do Novo Sistema**

### **Antes (JSON):**
- ❌ Arquivo local (instável)
- ❌ Senhas podem não bater
- ❌ Sem validação robusta
- ❌ Difícil de debugar

### **Agora (Supabase):**
- ✅ Banco real (PostgreSQL)
- ✅ Autenticação nativa
- ✅ Dashboard visual
- ✅ Logs detalhados
- ✅ Backup automático
- ✅ Deploy sem configuração

## 📈 **Próximos Passos**

Após configurar Supabase:

1. ✅ **Login/cadastro funcionando**
2. ✅ **Sistema de pontos**
3. ✅ **Produtos do banco real**
4. ✅ **Deploy automático**
5. 🚀 **Recursos avançados:**
   - Reset de senha por email
   - Login social (Google, GitHub)
   - Notificações em tempo real
   - Analytics de usuários

---

**🎯 Resultado:** Sistema de autenticação 100% confiável e profissional!

**⏱️ Tempo estimado:** 15-20 minutos  
**💰 Custo:** Gratuito (plano Free)  
**🔧 Dificuldade:** Fácil (copy/paste) 