# ☕ Mestres do Café - Frontend

> **Plataforma completa de torrefação artesanal com sistema de gamificação integrado**

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)
![Tests](https://img.shields.io/badge/Tests-121/121_✅-4CAF50?style=for-the-badge)
![Coverage](https://img.shields.io/badge/Coverage-100%25-4CAF50?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)

**[Demo ao Vivo](#) | [Documentação](./docs/) | [API Docs](./server/README.md)**

</div>

## 🚀 **Visão Geral**

O **Mestres do Café** é uma plataforma moderna e completa para torrefação artesanal em Santa Maria/RS. Desenvolvido com React.js e Node.js, oferece uma experiência única de e-commerce com sistema de gamificação avançado, validações brasileiras (CPF/CNPJ) e interface responsiva.

### ✨ **Principais Características**

- 🎮 **Sistema de Gamificação Completo** - Pontos, níveis, leaderboard
- 🛒 **E-commerce Avançado** - Carrinho, checkout, gestão de pedidos
- 👥 **Multi-perfil** - Pessoa Física, Pessoa Jurídica, Administrador
- 📱 **100% Responsivo** - Desktop, tablet e mobile
- 🔐 **Autenticação Segura** - JWT, bcrypt, validações
- 🧪 **100% Testado** - 121 testes automatizados
- 🎨 **UI/UX Moderna** - Design system próprio com Tailwind CSS

## 🏗️ **Arquitetura do Projeto**

```
mestres-do-cafe-frontend/
├── 🎨 src/                    # Frontend React
│   ├── components/            # Componentes reutilizáveis
│   ├── pages/                # Páginas da aplicação
│   ├── contexts/             # Context API (Auth, Cart)
│   ├── lib/                  # Utilitários e APIs
│   └── assets/               # Imagens e recursos
├── 🔧 server/                # Backend Node.js
│   ├── routes/               # Rotas da API
│   ├── middleware/           # Middlewares (auth, cors)
│   ├── database/             # Mock database
│   └── tests/                # Testes do backend
├── 🧪 tests/                 # Testes do frontend
│   ├── frontend/             # Testes de componentes
│   ├── integration/          # Testes de integração
│   └── setup.js              # Configuração de testes
└── 📚 docs/                  # Documentação
```

## 🚀 **Início Rápido**

### **Pré-requisitos**
- Node.js 18+ 
- npm 9+

### **1. Instalação**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend

# Instale as dependências (frontend + backend)
npm run setup
```

### **2. Configuração**
```bash
# Copie o arquivo de exemplo para variáveis de ambiente
cp .env.example .env

# Configure as variáveis (opcional para desenvolvimento)
```

### **3. Executar em Desenvolvimento**
```bash
# Opção 1: Frontend + Backend simultaneamente
npm run full-dev

# Opção 2: Apenas frontend (porta 5173)
npm run dev

# Opção 3: Apenas backend (porta 5000)
npm run server
```

### **4. Executar Testes**
```bash
# Todos os testes (frontend + backend)
npm run test:all

# Apenas frontend
npm run test:run

# Apenas backend  
npm run test:backend

# Com coverage
npm run test:coverage
```

## 🔧 **Scripts Disponíveis**

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia frontend em modo desenvolvimento |
| `npm run server` | Inicia apenas o backend |
| `npm run full-dev` | Inicia frontend + backend simultaneamente |
| `npm run setup` | Instala todas as dependências |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run test:all` | Executa todos os testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Analisa código com ESLint |
| `npm run validate` | Valida projeto completo |

## 🧪 **Sistema de Testes**

### **Estatísticas dos Testes**
- ✅ **Backend**: 49/49 testes (100%)
- ✅ **Frontend**: 72/72 testes (100%)
- ✅ **Total**: 121/121 testes (100%)

### **Cobertura por Módulo**

#### **Backend (Jest + Supertest)**
- 🔐 **Authentication**: 15 testes
- 📦 **Products**: 14 testes  
- 🎮 **Gamification**: 16 testes
- 🏥 **Health**: 4 testes

#### **Frontend (Vitest + Testing Library)**
- 🧪 **Validações**: 37 testes
- 🎯 **Header**: 14 testes
- 📄 **LandingPage**: 21 testes

### **Executar Testes Específicos**
```bash
# Testes de autenticação
npm run test:backend -- tests/auth/auth.test.js

# Testes de componentes
npm run test:run -- tests/frontend/components/

# Testes com watch mode
npm run test:backend:watch
```

## 🎮 **Sistema de Gamificação**

### **Níveis e Pontuação**
| Nível | Pontos Necessários | Benefícios |
|-------|-------------------|------------|
| 🥉 Bronze | 0 - 99 | Acesso básico |
| 🥈 Prata | 100 - 499 | Desconto 5% |
| 🥇 Ouro | 500 - 999 | Desconto 10% |
| 💎 Platina | 1000 - 2499 | Desconto 15% |
| 💠 Diamante | 2500+ | Desconto 25% |

### **Como Ganhar Pontos**
- 💰 **Compras**: 1 ponto/R$ (PF) ou 2 pontos/R$ (PJ)
- ⭐ **Avaliações**: 10 pontos por avaliação
- 🎁 **Bônus**: Compras acima de R$ 100

## 🔐 **Autenticação e Perfis**

### **Tipos de Usuário**
- **👤 Pessoa Física**: CPF, 1 ponto por real gasto
- **🏢 Pessoa Jurídica**: CNPJ, 2 pontos por real gasto  
- **👨‍💼 Administrador**: Acesso ao painel admin

### **Validações Implementadas**
- ✅ CPF/CNPJ brasileiros válidos
- ✅ Email com formato correto
- ✅ Telefone brasileiro (fixo/celular)
- ✅ CEP brasileiro
- ✅ Senhas seguras

## 🛒 **E-commerce Features**

### **Catálogo de Produtos**
- 📦 Cafés especiais com origem certificada
- 🏷️ Filtros por categoria, preço, origem
- ⭐ Sistema de avaliações
- 📱 Design responsivo em grid

### **Carrinho e Checkout**
- 🛒 Persistência em localStorage
- 📊 Cálculo automático de totais
- 🎮 Integração com sistema de pontos
- 💳 Simulação de pagamento

### **Gestão de Pedidos**
- 📋 Histórico completo de pedidos
- 📦 Rastreamento de entregas
- 🔄 Status em tempo real
- 📧 Notificações por email

## 🎨 **Design System**

### **Paleta de Cores**
```css
/* Cores principais */
--coffee-intense: #2B3A42    /* Azul escuro */
--coffee-gold: #C8956D       /* Dourado */
--coffee-white: #FEFEFE      /* Branco */
--coffee-cream: #F5F5DC      /* Creme */
--coffee-gray: #6B7280       /* Cinza */
```

### **Tipografia**
- **Títulos**: Cormorant Garamond (serifada)
- **Corpo**: Montserrat (sem serifa)
- **Interface**: Sistema responsivo em rem

### **Componentes**
- 🎯 Buttons com estados hover/active
- 📱 Cards responsivos
- 🎨 Forms com validação visual
- 🔄 Loading spinners
- 📊 Progress bars

## 📚 **Documentação Adicional**

- 📖 [**Guia de Contribuição**](./CONTRIBUTING.md)
- 🔧 [**API Documentation**](./server/README.md)
- 🧪 [**Guia de Testes**](./tests/README.md)
- 🚀 [**Deploy Guide**](./docs/DEPLOY.md)
- 📝 [**Changelog**](./CHANGELOG.md)

## 🛠️ **Stack Tecnológica**

### **Frontend**
- ⚛️ **React** 18.3.1 - Library principal
- 🎨 **Tailwind CSS** - Styling
- 🧭 **React Router** - Navegação
- 📊 **Context API** - Gerenciamento de estado
- 🧪 **Vitest** - Testes unitários
- 📱 **Lucide Icons** - Ícones

### **Backend**
- 🟢 **Node.js** - Runtime
- 🚀 **Express.js** - Framework web
- 🔐 **JWT** - Autenticação
- 🛡️ **bcrypt** - Hash de senhas
- 🧪 **Jest + Supertest** - Testes
- ✅ **express-validator** - Validações

### **DevTools**
- ⚡ **Vite** - Build tool
- 📏 **ESLint** - Linting
- 🎯 **Testing Library** - Testes de UI
- 📊 **Coverage** - Cobertura de testes

## 🚀 **Deploy**

### **Build de Produção**
```bash
# Build do frontend
npm run build

# Serve arquivos estáticos
npm run preview
```

### **Variáveis de Ambiente**
```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000

# Backend (server/.env)
NODE_ENV=production
PORT=5000
JWT_SECRET=sua-chave-super-secreta
JWT_EXPIRES_IN=15m
```

### **Deploy Platforms**
- ☁️ **Frontend**: Vercel, Netlify
- 🔧 **Backend**: Railway, Heroku, VPS
- 💾 **Database**: PostgreSQL, MongoDB

## 👥 **Contribuição**

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Implemente** as mudanças
5. **Teste** tudo (`npm run validate`)
6. **Commit** seguindo [Conventional Commits](https://conventionalcommits.org/)
7. **Abra** um Pull Request

### **Comandos de Desenvolvimento**
```bash
# Preparar ambiente
npm run setup

# Desenvolvimento com hot reload
npm run full-dev

# Validar antes do commit
npm run validate
```

## 📞 **Suporte**

- 🌐 **Website**: [mestrescafe.com.br](#)
- 📧 **Email**: contato@mestrescafe.com.br
- 📱 **WhatsApp**: (55) 99645-8600
- 📍 **Endereço**: Santa Maria, RS

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

<div align="center">

**Feito com ❤️ por [Kalleby](https://github.com/kalleby) em Santa Maria/RS** 

⭐ **Gostou do projeto? Deixe uma estrela!** ⭐

</div>
