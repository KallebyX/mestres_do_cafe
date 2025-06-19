# ☕ Mestres do Café - Plataforma Digital

> **Torrefação Artesanal Premium em Santa Maria/RS**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.19.2-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./docs/LICENSE)

## 🎯 Sobre o Projeto

A **Mestres do Café** é uma plataforma digital completa para torrefação artesanal, desenvolvida especialmente para conectar produtores, torrefadores e apaixonados por café de qualidade. O projeto combina um marketplace premium com sistema de gamificação único e ferramentas de gestão avançadas.

### 🏆 Diferenciais Únicos

- **🎮 Sistema de Gamificação**: 5 níveis de progressão com descontos de até 25%
- **🏢 Programa Corporativo**: Parcerias PJ com benefícios exclusivos
- **🗺️ Mapa Interativo**: Localização de produtores e pontos de venda
- **🤖 Automação WhatsApp**: Atendimento automatizado 24/7
- **📊 Dashboard Avançado**: Analytics e gestão completa

## 🚀 Quick Start

### Pré-requisitos
- **Node.js** 16+ 
- **npm** 8+
- **Git**

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend

# Instalar dependências de frontend e backend
npm run setup

# Executar frontend + backend simultaneamente
npm run full-dev
```

### URLs de Acesso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Estrutura do Projeto

```
mestres-do-cafe-frontend/
├── 📂 src/                      # Frontend React
│   ├── 📂 components/           # Componentes reutilizáveis
│   │   ├── 📂 ui/              # Componentes UI (shadcn/ui)
│   │   ├── Header.jsx          # Cabeçalho principal
│   │   ├── Footer.jsx          # Rodapé
│   │   └── LoadingSpinner.jsx  # Loading spinner
│   ├── 📂 pages/               # Páginas da aplicação
│   │   ├── LandingPage.jsx     # Página inicial
│   │   ├── MarketplacePage.jsx # Marketplace de cafés
│   │   ├── ProductPage.jsx     # Página do produto
│   │   ├── GamificationPage.jsx # Sistema de gamificação
│   │   ├── AdminDashboard.jsx  # Dashboard administrativo
│   │   └── ...                 # Outras páginas
│   ├── 📂 contexts/            # Contextos React
│   │   ├── AuthContext.jsx     # Autenticação
│   │   └── CartContext.jsx     # Carrinho de compras
│   ├── 📂 lib/                 # Utilitários e configurações
│   │   ├── api.js              # Cliente API
│   │   ├── utils.js            # Funções utilitárias
│   │   └── validation.js       # Validações (CPF, CNPJ, etc.)
│   └── 📂 hooks/               # Custom hooks
├── 📂 server/                   # Backend Node.js/Express
│   ├── 📂 routes/              # Rotas da API
│   │   ├── auth.js             # Autenticação
│   │   ├── products.js         # Produtos
│   │   ├── admin.js            # Administração
│   │   └── orders.js           # Pedidos
│   ├── 📂 middleware/          # Middlewares
│   │   └── auth.js             # Middleware de autenticação
│   ├── 📂 database/            # Scripts de banco
│   │   └── init.js             # Inicialização
│   ├── 📂 scripts/             # Scripts utilitários
│   │   └── seedData.js         # Dados de exemplo
│   ├── server.js               # Servidor principal
│   └── package.json            # Dependências do backend
├── 📂 docs/                    # Documentação
│   ├── CONTRIBUTING.md         # Guia de contribuição
│   ├── ROADMAP.md              # Roadmap do projeto
│   ├── ESPECIFICACOES_TECNICAS.md # Especificações técnicas
│   └── ...                     # Outros documentos
├── 📂 public/                  # Assets estáticos
├── package.json                # Dependências do frontend
└── README.md                   # Este arquivo
```

## 🛠️ Scripts Disponíveis

### Frontend
```bash
npm run dev          # Executar frontend em desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
```

### Backend
```bash
npm run server       # Executar backend em desenvolvimento
npm run server:start # Executar backend em produção
npm run server:install # Instalar dependências do backend
```

### Ambiente Completo
```bash
npm run full-dev     # Frontend + Backend simultaneamente
npm run setup        # Instalação completa (frontend + backend)
```

## 🎮 Sistema de Gamificação

### Níveis de Progressão
| Nível | Nome | Pontos Necessários | Desconto |
|-------|------|-------------------|----------|
| 1 | 🌱 Aprendiz | 0 - 499 | 5% |
| 2 | ☕ Conhecedor | 500 - 1.499 | 10% |
| 3 | 🔥 Especialista | 1.500 - 3.999 | 15% |
| 4 | 👑 Mestre | 4.000 - 9.999 | 20% |
| 5 | 🏆 Lenda | 10.000+ | 25% |

### Como Ganhar Pontos
- **💰 Compras**: 10 pontos por R$ 10 gastos
- **⭐ Avaliações**: 50 pontos por avaliação
- **📱 Compartilhamentos**: 25 pontos por compartilhamento
- **👥 Indicações**: 200 pontos por amigo indicado
- **📅 Check-in Diário**: 10 pontos por dia
- **🎯 Desafios**: 100-500 pontos por desafio
- **📝 Reviews Detalhadas**: 100 pontos por review
- **🎂 Bônus de Aniversário**: 500 pontos

## 🔑 Funcionalidades Principais

### 🛒 Marketplace
- Catálogo completo de cafés especiais
- Filtros avançados (origem, torra, notas)
- Sistema de avaliações e reviews
- Carrinho de compras otimizado
- Checkout seguro

### 👤 Sistema de Usuários
- Cadastro PF/PJ com validação de CPF/CNPJ
- Perfis personalizados
- Histórico de compras
- Sistema de pontos e recompensas

### 🎯 Gamificação
- Níveis de progressão
- Sistema de pontos
- Desafios e conquistas
- Leaderboard
- Programa corporativo

### 📊 Dashboard Admin
- Gestão de produtos
- Relatórios de vendas
- Controle de usuários
- Analytics avançados

## 🔧 Tecnologias Utilizadas

### Frontend
- **React** 18.3.1 - Biblioteca principal
- **Vite** 6.0.1 - Build tool
- **React Router** 6.28.0 - Roteamento
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas

### Backend
- **Node.js** 16+ - Runtime
- **Express** 4.19.2 - Framework web
- **JWT** 9.0.2 - Autenticação
- **bcryptjs** 3.0.2 - Hash de senhas
- **CORS** 2.8.5 - Cross-origin requests

### Desenvolvimento
- **ESLint** - Linting
- **Concurrently** - Execução simultânea
- **Nodemon** - Hot reload backend

## 🌟 Próximas Funcionalidades

- [ ] 🗺️ **Mapa Interativo**: Localização de produtores
- [ ] 🤖 **Automação WhatsApp**: Atendimento automatizado
- [ ] 🏢 **Sistema PJ Avançado**: Gestão corporativa
- [ ] 📊 **Integração Egestor**: ERP integrado
- [ ] 💳 **Gateway de Pagamento**: PIX, cartões, boleto
- [ ] 📱 **App Mobile**: React Native
- [ ] 🔔 **Sistema de Notificações**: Push notifications
- [ ] 📈 **Analytics Avançado**: Dashboard detalhado

## 👨‍💻 Desenvolvimento

### Configuração do Ambiente
```bash
# Clonar repositório
git clone https://github.com/usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend

# Instalar dependências
npm run setup

# Configurar variáveis de ambiente (opcional)
cp .env.example .env
```

### Comandos Úteis
```bash
# Instalar nova dependência no frontend
npm install package-name

# Instalar nova dependência no backend
cd server && npm install package-name

# Executar apenas frontend
npm run dev

# Executar apenas backend
npm run server

# Build para produção
npm run build
```

## 📞 Contato e Suporte

**Cliente**: Daniel do Nascimento  
**Telefone**: (55) 99645-8600  
**Email**: mestres@cafe.com.br  
**Localização**: Santa Maria/RS

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](./docs/LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de contribuição.

---

<div align="center">

**☕ Feito com amor e muito café pela equipe Mestres do Café ☕**

</div>
