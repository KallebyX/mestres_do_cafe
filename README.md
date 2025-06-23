# 🏆 Mestres do Café - Plataforma E-commerce Premium

[![Status](https://img.shields.io/badge/Status-v1.0.0%20Release-brightgreen)](https://github.com/seu-usuario/mestres-do-cafe-frontend)
[![Testes](https://img.shields.io/badge/Testes-200%2B%20Automatizados-success)](#testes)
[![Stack](https://img.shields.io/badge/Stack-React%20+%20Supabase%20+%20PostgreSQL-blue)](#tecnologias)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **🚀 Plataforma completa de e-commerce para cafés especiais com CRM avançado, sistema de gamificação e dashboard administrativo integrado ao Supabase.**

## ✨ **Funcionalidades Principais**

### 🛒 **E-commerce Completo**
- **Marketplace responsivo** com catálogo de cafés especiais
- **Sistema de carrinho persistente** com localStorage
- **Filtros avançados** por categoria, preço, origem e torra
- **Busca em tempo real** com resultados instantâneos
- **Checkout integrado** com cálculo automático de pontos

### 🎮 **Sistema de Gamificação**
- **5 níveis progressivos**: Aprendiz → Conhecedor → Especialista → Mestre → Lenda
- **Pontuação diferenciada**: PF (1 ponto/R$) | PJ (2 pontos/R$)
- **Descontos progressivos**: 5% → 10% → 15% → 20% → 25%
- **Leaderboard global** e histórico completo de pontos
- **Bônus especiais** para compras acima de R$ 100

### 👥 **Multi-perfil de Usuários**
- **👤 Pessoa Física**: CPF, gamificação individual
- **🏢 Pessoa Jurídica**: CNPJ, pontuação dobrada
- **👨‍💼 Administrador**: Acesso total ao CRM e dashboard
- **🔐 Autenticação segura**: JWT + Google OAuth + Supabase Auth

### 📊 **CRM Avançado e Dashboard Administrativo**
- **Dashboard executivo** com métricas em tempo real
- **Gestão completa de clientes** com 6 abas funcionais
- **Sistema de tarefas** com prioridades e alertas
- **Histórico de interações** e comunicações
- **Analytics detalhados** com gráficos interativos
- **Reset de senhas** e controle de permissões
- **Gestão de produtos, cursos e blog** integrada

## 🏗️ **Arquitetura do Sistema**

### **Frontend (React + Vite + Tailwind CSS)**
```
src/
├── components/           # 35+ componentes reutilizáveis
│   ├── ui/              # Design system com shadcn/ui
│   ├── Header.jsx       # Header único e responsivo
│   └── Footer.jsx       # Footer elegante
├── pages/               # 15+ páginas implementadas
│   ├── LandingPage.jsx  # Homepage com gamificação
│   ├── MarketplacePage.jsx # E-commerce completo
│   ├── AdminDashboard.jsx  # Dashboard administrativo
│   ├── AdminCRMDashboard.jsx # CRM avançado
│   └── CustomerDetailView.jsx # Detalhes do cliente
├── contexts/            # Gerenciamento de estado
│   ├── AuthContext.jsx  # Autenticação global
│   └── SupabaseAuthContext.jsx # Supabase Auth
├── lib/                 # APIs e utilitários
│   ├── supabase.js      # Cliente Supabase
│   ├── supabase-admin-api.js # APIs CRM
│   └── validation.js    # Validações brasileiras
└── hooks/              # Custom hooks
```

### **Backend (Supabase + PostgreSQL)**
```
database/
├── setup-completo.sql  # Schema completo
├── supabase-setup.sql  # Configuração inicial
├── crm-advanced-setup.sql # CRM avançado
└── courses-setup.sql   # Sistema de cursos
```

## 🚀 **Como Executar**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)

### **Instalação Rápida**
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp env.example .env
# Edite o .env com suas chaves do Supabase

# 4. Execute o projeto
npm run dev
```

### **Configuração do Supabase**
1. Crie um projeto gratuito em [supabase.com](https://supabase.com)
2. Execute os scripts SQL em `database/setup-completo.sql`
3. Configure as políticas RLS (Row Level Security)
4. Adicione as chaves no arquivo `.env`

### **Scripts Disponíveis**
```bash
npm run dev          # Desenvolvimento (frontend)
npm run build        # Build para produção
npm run preview      # Preview do build
npm test             # Executar testes
npm run test:coverage # Testes com cobertura
npm run lint         # Linting do código
```

## 🧪 **Testes e Qualidade**

### **Cobertura de Testes**
- ✅ **200+ testes automatizados** (frontend + backend)
- ✅ **Componentes React** testados com Testing Library
- ✅ **APIs** testadas com Jest/Supertest
- ✅ **Validações** brasileiras (CPF, CNPJ, CEP)
- ✅ **Fluxos de integração** completos

### **Qualidade do Código**
- ✅ **ESLint** configurado com regras React
- ✅ **Prettier** para formatação consistente
- ✅ **Husky** para pre-commit hooks
- ✅ **TypeScript** em componentes críticos

## 💻 **Tecnologias Utilizadas**

### **Frontend**
- **React 18** - Framework principal
- **Vite 6** - Build tool moderna e rápida
- **Tailwind CSS 3** - Framework CSS utilitário
- **Supabase JS** - Cliente para backend
- **React Router 6** - Roteamento SPA
- **Radix UI** - Componentes acessíveis
- **Lucide Icons** - Ícones modernos
- **Charts.js** - Gráficos interativos

### **Backend & Banco**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança granular
- **Real-time subscriptions** - Atualizações em tempo real
- **Edge Functions** - Processamento serverless

### **Validações & Segurança**
- **JWT** - Autenticação segura
- **Google OAuth** - Login social
- **Validações brasileiras** - CPF, CNPJ, CEP
- **bcrypt** - Hash de senhas
- **CORS** - Configuração de segurança

## 📊 **Dashboard e CRM**

### **Dashboard Executivo**
- 📈 **KPIs em tempo real**: vendas, usuários, pedidos
- 📊 **Gráficos interativos** de performance
- 💰 **Métricas financeiras** e relatórios
- 🎯 **Insights automáticos** de negócio

### **CRM Completo (10 Funcionalidades)**
1. **Gestão de Clientes** - Cadastro PF/PJ unificado
2. **Histórico de Interações** - Timeline completa
3. **Sistema de Tarefas** - Prioridades e alertas
4. **Analytics de Cliente** - Métricas individuais
5. **Histórico de Compras** - Pedidos detalhados
6. **Segmentação Automática** - VIP, Novos, Inativos
7. **Comunicação Integrada** - Notas e histórico
8. **Reset de Senhas** - Controle administrativo
9. **Relatórios Avançados** - Insights de comportamento
10. **Gamificação Integrada** - Gestão de pontos

## 🎨 **Design System**

### **Paleta de Cores (Manual de Marca)**
- **Primary**: `#101820` (Brand Dark)
- **Secondary**: `#b58150` (Brand Brown)
- **Light**: `#f7fcff` (Brand Light)
- **Accent**: Gradientes personalizados

### **Tipografia**
- **Carena Regular** (Crimson Text) - Títulos elegantes
- **All Round Gothic** (Open Sans) - Texto corpo
- **Monospace** - Códigos e dados técnicos

### **Componentes**
- **Design responsivo** mobile-first
- **Animações suaves** com Framer Motion
- **Acessibilidade** seguindo WCAG 2.1
- **Dark mode** (planejado para v1.1)

## 📈 **Métricas do Projeto**

### **Estatísticas do Código**
- 📁 **15+ páginas** implementadas
- 🧩 **35+ componentes** reutilizáveis
- 🔗 **30+ endpoints** de API
- 📊 **15+ tabelas** no banco
- 🎮 **200+ pontos** de gamificação
- 🧪 **200+ testes** automatizados

### **Performance**
- ⚡ **Build time**: < 30 segundos
- 📱 **100% responsivo** (mobile-first)
- 🚀 **Lighthouse Score**: 90+ em todas as métricas
- 💾 **Bundle size**: Otimizado com tree-shaking

## 🚀 **Deploy em Produção**

### **Opções de Deploy**
1. **Vercel** (Recomendado para frontend)
2. **Netlify** (Alternativa para frontend)
3. **Supabase** (Backend já hospedado)

### **Configuração de Produção**
```bash
# Build otimizado
npm run build

# Preview local
npm run preview

# Deploy Vercel
npx vercel --prod
```

### **Variáveis de Ambiente**
```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica

# Google OAuth
VITE_GOOGLE_CLIENT_ID=seu_client_id
```

## 📚 **Documentação Adicional**

- 📖 [Especificações Técnicas](./docs/ESPECIFICACOES_TECNICAS.md)
- 🚀 [Guia de Deploy](./docs/DEPLOY.md)
- 🧪 [Como Testar](./docs/COMO_TESTAR.md)
- 🗺️ [Roadmap do Projeto](./docs/ROADMAP.md)
- 🔧 [Configuração do Supabase](./docs/SUPABASE_SETUP.md)
- 📊 [APIs Disponíveis](./docs/APIS_COMPLETAS_GRATUITAS.md)

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### **Padrões de Desenvolvimento**
- Utilize **Conventional Commits**
- Mantenha **cobertura de testes** > 80%
- Siga as **regras do ESLint**
- **Documente** novas funcionalidades

## 🎯 **Roadmap Futuro**

### **v1.1 - Em Desenvolvimento**
- [ ] 💳 Integração Mercado Pago/Stripe
- [ ] 📧 Sistema de notificações por email
- [ ] 🎁 Cupons de desconto automáticos
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🌙 Modo escuro

### **v1.2 - Planejado**
- [ ] 🚚 Rastreamento de entregas
- [ ] ⭐ Sistema de avaliações
- [ ] 💼 Programa de afiliados
- [ ] 📞 Integração com WhatsApp
- [ ] 🤖 Chatbot inteligente

### **v2.0 - Visão de Longo Prazo**
- [ ] 🏪 Marketplace multi-vendedor
- [ ] 🤖 IA para recomendações
- [ ] 🔗 Blockchain para certificação
- [ ] 🌍 Expansão internacional

## 👨‍💻 **Autor & Licença**

**Desenvolvido por**: [Kalleby Evangelho](https://github.com/seu-usuario)  
**Cliente**: Daniel - Mestres do Café - Santa Maria/RS  
**Licença**: MIT - veja [LICENSE](LICENSE) para detalhes

## 🏆 **Agradecimentos**

- **Supabase** pela infraestrutura backend gratuita
- **Vercel** pela hospedagem frontend
- **shadcn/ui** pelos componentes de alta qualidade
- **Tailwind CSS** pelo framework CSS utilitário
- **Comunidade React** pelo suporte e inspiração

---

<div align="center">

**🚀 Mestres do Café v1.0.0 - Sistema Production Ready**

[![Deploy](https://img.shields.io/badge/Deploy-Live-success)](https://mestres-do-cafe.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Projeto-blue?logo=github)](https://github.com/seu-usuario/mestres-do-cafe-frontend)

*Feito com ❤️ e muito ☕ em Santa Maria/RS*

**[🌐 Demo Live](https://mestres-do-cafe.vercel.app) | [📚 Documentação](./docs/) | [🚀 Deploy Guide](./docs/DEPLOY.md)**

</div>
