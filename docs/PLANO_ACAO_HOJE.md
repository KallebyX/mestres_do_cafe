# 🚀 PLANO DE AÇÃO - HOJE (10/06/2025)

> **Objetivo**: Iniciar o desenvolvimento do backend e preparar a base para os próximos 30 dias

## ⏰ CRONOGRAMA DO DIA

### **MANHÃ (09:00 - 12:00)**

#### **1. Setup do Backend (09:00 - 10:30)**
- [ ] Criar repositório backend separado
- [ ] Configurar Node.js + Express.js
- [ ] Instalar dependências essenciais
- [ ] Configurar estrutura de pastas

#### **2. Configuração do Banco (10:30 - 12:00)**
- [ ] Configurar PostgreSQL no Supabase
- [ ] Criar schema inicial
- [ ] Configurar variáveis de ambiente
- [ ] Testar conexão

### **TARDE (13:00 - 18:00)**

#### **3. APIs Básicas (13:00 - 15:30)**
- [ ] Implementar autenticação JWT
- [ ] Criar endpoints de login/registro
- [ ] Configurar middleware de segurança
- [ ] Implementar validações

#### **4. Integração Frontend (15:30 - 18:00)**
- [ ] Atualizar API do frontend
- [ ] Testar autenticação real
- [ ] Validar funcionamento
- [ ] Documentar mudanças

---

## 📋 CHECKLIST DETALHADO

### **Setup Backend**

```bash
# 1. Criar novo repositório
mkdir mestres-do-cafe-backend
cd mestres-do-cafe-backend
npm init -y

# 2. Instalar dependências
npm install express cors helmet morgan bcryptjs jsonwebtoken
npm install dotenv express-rate-limit express-validator
npm install pg
npm install -D nodemon

# 3. Estrutura de pastas
mkdir src src/controllers src/models src/services
mkdir src/middleware src/routes src/utils
mkdir config database
```

### **Configuração do Banco**

```sql
-- Schema inicial (Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) CHECK (tipo IN ('pessoa_fisica', 'pessoa_juridica', 'admin')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- PF
    nome_completo VARCHAR(255),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    
    -- PJ  
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    responsavel_nome VARCHAR(255),
    
    -- Sistema de pontos
    pontos_totais INTEGER DEFAULT 0,
    nivel VARCHAR(20) DEFAULT 'bronze',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos básicos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    
    -- Características do café
    origin VARCHAR(255),
    roast_level VARCHAR(50),
    flavor_notes TEXT,
    acidity VARCHAR(20),
    bitterness VARCHAR(20),
    
    -- Gestão
    stock_quantity INTEGER DEFAULT 0,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados de teste
INSERT INTO users (tipo, email, password_hash, nome_completo) VALUES 
('admin', 'admin@mestrescafe.com.br', '$2b$10$hashed_password', 'Administrador');

INSERT INTO products (name, price, origin, roast_level, flavor_notes, stock_quantity, is_featured) VALUES 
('Café Bourbon Amarelo Premium', 45.90, 'Cerrado Mineiro, MG', 'Médio', 'Chocolate, Caramelo, Nozes', 50, true),
('Café Geisha Especial', 89.90, 'Sul de Minas, MG', 'Claro', 'Floral, Cítrico, Bergamota', 25, true);
```

### **Variáveis de Ambiente**

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### **Estrutura do Server.js**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

---

## 🎯 ENDPOINTS PRIORITÁRIOS HOJE

### **1. Autenticação**
```javascript
POST /api/auth/register
POST /api/auth/login  
GET  /api/auth/profile
POST /api/auth/refresh
```

### **2. Produtos**
```javascript
GET /api/products
GET /api/products/:id
```

### **3. Health Check**
```javascript
GET /api/health
```

---

## 🔧 COMANDOS PARA EXECUTAR

### **Backend**
```bash
# Depois de criar o backend
cd mestres-do-cafe-backend
npm install
npm run dev  # nodemon server.js
```

### **Frontend** (atualizar API)
```bash
# No diretório atual
npm run dev
```

### **Teste de Integração**
```bash
# Testar se backend está funcionando
curl http://localhost:5000/api/health

# Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mestrescafe.com.br","password":"admin123"}'
```

---

## 📝 ALTERAÇÕES NO FRONTEND

### **src/lib/api.js** - Substituir mock por chamadas reais

```javascript
// Remover todo o código mock e implementar:
const API_BASE_URL = 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = authUtils.getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Implementar todas as APIs usando apiRequest
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // ... outras APIs
};
```

---

## ✅ CRITÉRIOS DE SUCESSO DO DIA

- [ ] Backend rodando em `localhost:5000`
- [ ] Banco de dados configurado e populado
- [ ] Endpoints de auth funcionando
- [ ] Frontend conectado ao backend real
- [ ] Login/registro funcionando sem mock
- [ ] Produtos sendo carregados do banco real

---

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **Problema**: Erro de CORS
**Solução**: Verificar configuração do CORS no backend

### **Problema**: Banco não conecta
**Solução**: Verificar variáveis de ambiente e URL do Supabase

### **Problema**: JWT não funciona
**Solução**: Verificar se o secret está configurado corretamente

### **Problema**: Frontend não carrega dados
**Solução**: Verificar se a URL da API está correta e servidor rodando

---

## 📞 PRÓXIMOS PASSOS (AMANHÃ)

1. **Expandir APIs**
   - Carrinho de compras
   - Gestão de pedidos
   - CRUD de produtos (admin)

2. **Implementar Validações**
   - Validação de CPF/CNPJ
   - Sanitização de dados
   - Rate limiting específico

3. **Configurar Deploy**
   - Backend no Render
   - Configurar variáveis de produção
   - Testar em ambiente online

---

*Vamos começar! 🚀*

**Desenvolvedor**: Kalleby Evangelho Mota  
**Cliente**: Daniel do Nascimento  
**Data**: 10/06/2025 