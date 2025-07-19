# 📚 Documentação Técnica - Mestres do Café Enterprise

Documentação completa para desenvolvedores, administradores e contribuidores do projeto.

---

## 📖 **ÍNDICE DA DOCUMENTAÇÃO**

### 🚀 **Setup e Instalação**
- **[📋 Installation](./installation.md)** - Guia completo de instalação
- **[🔧 Configuration](./configuration.md)** - Configurações avançadas
- **[🗄️ Database Setup](./database-setup.md)** - Configuração do banco de dados

### 🏗️ **Arquitetura e Desenvolvimento**
- **[🏗️ Architecture](./architecture.md)** - Visão geral da arquitetura
- **[📡 API Reference](./api-reference.md)** - Documentação completa da API
- **[🎨 Frontend](./frontend.md)** - Guia de desenvolvimento React
- **[🗄️ Database](./database.md)** - Modelos e relacionamentos

### 🐳 **Deploy e Infraestrutura**
- **[🐳 Docker](./docker.md)** - Guia de containerização
- **[🚀 Deployment](./deployment.md)** - Deploy em produção

### 🧪 **Qualidade e Contribuição**
- **[🧪 Testing](./testing.md)** - Guias de teste
- **[🤝 Contributing](./contributing.md)** - Como contribuir
- **[❓ FAQ](./faq.md)** - Perguntas frequentes

---

## 🎯 **VISÃO GERAL DO SISTEMA**

### **🏢 Para que serve?**
O Mestres do Café Enterprise é uma plataforma completa que combina:
- **E-commerce moderno** para venda online de café
- **ERP robusto** para gestão empresarial
- **Multi-tenancy** para franquias independentes
- **Gamificação** para engajamento de clientes

### **☕ Especialização em Café**
- Catálogo otimizado para produtos de café especial
- Atributos específicos: origem, torra, SCA score, notas sensoriais
- Sistema de cupping integrado
- Gestão de lotes e rastreabilidade

---

## 🏗️ **ARQUITETURA TÉCNICA**

### **Stack Principal**
```
Frontend (React 18)
├── TypeScript + Vite
├── Tailwind CSS + Shadcn/ui
├── React Router v6
└── Axios + React Query

Backend (Flask 3.0)
├── SQLAlchemy 2.0 + Alembic
├── PostgreSQL / SQLite
├── Redis (cache)
└── JWT Authentication

Infraestrutura
├── Docker + Docker Compose
├── Nginx (reverse proxy)
├── Prometheus + Grafana
└── GitHub Actions (CI/CD)
```

### **Arquitetura Monorepo**
```
📁 mestres_cafe_enterprise/
├── 📁 apps/
│   ├── 📁 api/              # Backend Flask
│   │   ├── 📁 src/          # Código fonte
│   │   │   ├── 📁 models/   # Modelos SQLAlchemy
│   │   │   ├── 📁 controllers/ # Rotas e lógica
│   │   │   └── 📁 services/ # Serviços externos
│   │   └── 📄 requirements.txt
│   └── 📁 web/              # Frontend React
│       ├── 📁 src/          # Código fonte
│       │   ├── 📁 components/ # Componentes React
│       │   ├── 📁 pages/    # Páginas/Views
│       │   └── 📁 hooks/    # Custom hooks
│       └── 📄 package.json
├── 📁 docs/                 # Esta documentação
├── 📁 tools/                # Scripts e ferramentas
└── 📄 docker-compose.yml
```

---

## 📊 **FUNCIONALIDADES IMPLEMENTADAS**

### **🛒 E-commerce Core** 
- [x] Catálogo de produtos com filtros
- [x] Carrinho de compras persistente
- [x] Sistema de checkout (6 etapas)
- [x] Reviews e avaliações
- [x] Wishlist (favoritos)
- [x] Cálculo de frete integrado

### **🏢 ERP Enterprise**
- [x] **Estoque**: Controle com códigos de barras
- [x] **Financeiro**: Contabilidade completa
- [x] **RH**: Gestão de funcionários
- [x] **CRM**: Leads e clientes
- [x] **Fornecedores**: Compras e relacionamento

### **🏪 Multi-tenancy**
- [x] Isolamento de dados por tenant
- [x] Configurações personalizadas
- [x] Billing e assinaturas
- [x] Dashboard independente

### **🎮 Gamificação**
- [x] Sistema de pontos
- [x] 5 níveis de progressão
- [x] Badges e conquistas
- [x] Ranking e competições

### **🛒 Marketplace**
- [x] Gestão de vendedores
- [x] Sistema de comissões
- [x] Escrow para pagamentos
- [x] Dashboard vendedores

### **💳 Integrações**
- [x] Mercado Pago (PIX, cartão, boleto)
- [x] Melhor Envio (frete e tracking)
- [x] ViaCEP (validação endereços)

---

## 🚀 **INÍCIO RÁPIDO PARA DESENVOLVEDORES**

### **1. Clone e Configure**
```bash
git clone https://github.com/KallebyX/mestres_cafe_enterprise.git
cd mestres_cafe_enterprise
cp .env.docker.example .env
```

### **2. Execute com Docker**
```bash
# Desenvolvimento completo
docker-compose --profile tools --profile monitoring up -d

# URLs principais:
# Frontend: http://localhost:3000
# API: http://localhost:5001
# Adminer: http://localhost:8080
# Grafana: http://localhost:3001
```

### **3. Desenvolvimento Local**
```bash
# Backend
cd apps/api
pip install -r requirements.txt
python src/app.py

# Frontend (novo terminal)
cd apps/web
npm install
npm run dev
```

---

## 🔧 **CONFIGURAÇÃO ESSENCIAL**

### **Variáveis de Ambiente**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mestres_cafe

# Segurança (GERE CHAVES FORTES!)
SECRET_KEY=sua-chave-super-secreta-de-32-chars-ou-mais
JWT_SECRET_KEY=sua-chave-jwt-super-secreta-de-32-chars

# APIs Externas (obrigatórias)
MERCADO_PAGO_ACCESS_TOKEN=seu-token-mercado-pago
MELHOR_ENVIO_API_KEY=seu-token-melhor-envio

# Cache (opcional)
REDIS_URL=redis://localhost:6379/0
```

### **APIs Necessárias**
1. **Mercado Pago**: Conta vendedor + credenciais de produção
2. **Melhor Envio**: Conta + token de API

---

## 🧪 **TESTES E QUALIDADE**

### **Executar Testes**
```bash
# Backend
cd apps/api && python -m pytest

# Frontend  
cd apps/web && npm run test

# Linting
npm run lint && npm run format
```

### **Cobertura de Testes**
- ✅ **Autenticação**: Login, registro, JWT
- ✅ **E-commerce**: Produtos, carrinho, checkout
- ✅ **Gamificação**: Pontos, níveis, badges
- ✅ **Multi-tenancy**: Isolamento de dados
- ✅ **Integrações**: APIs externas

---

## 📈 **PERFORMANCE E MONITORAMENTO**

### **Otimizações Implementadas**
- **Cache Redis** para queries frequentes
- **Lazy loading** de componentes React
- **Bundle splitting** para carregamento otimizado
- **Indexes** estratégicos no banco de dados
- **Connection pooling** PostgreSQL

### **Monitoramento (Profile: monitoring)**
- **Prometheus**: Coleta de métricas
- **Grafana**: Dashboards visuais
- **Health checks**: Verificações automáticas
- **Logs estruturados**: Para debug e auditoria

---

## 🔒 **SEGURANÇA**

### **Medidas Implementadas**
- **Usuários não-root** em todos os containers
- **JWT** com refresh tokens
- **Rate limiting** por endpoint
- **Validação de entrada** contra SQL injection/XSS
- **CORS** configurado corretamente
- **Headers de segurança** em produção

### **Auditoria**
- **Logs de ações** de usuários
- **Trilha de auditoria** completa
- **Monitoramento** de tentativas de acesso

---

## 🤝 **CONTRIBUINDO**

### **Processo de Contribuição**
1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch feature: `git checkout -b feature/nova-funcionalidade`
4. **Desenvolva** com testes
5. **Commit** com mensagens claras
6. **Push** para seu fork
7. **Abra** um Pull Request

### **Padrões de Código**
- **Backend**: Black + Flake8 + isort
- **Frontend**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Documentação**: Sempre atualizar

---

## 📞 **SUPORTE E COMUNIDADE**

### **Canais de Suporte**
- **Issues**: Para bugs e feature requests
- **Discussions**: Para dúvidas e ideias
- **FAQ**: Para perguntas comuns

### **Recursos Úteis**
- **[Changelog](../CHANGELOG.md)**: Histórico de versões
- **[Roadmap](../ROADMAP.md)**: Próximas funcionalidades
- **[Contributing](./contributing.md)**: Guia detalhado

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Leia** a [documentação de instalação](./installation.md)
2. **Configure** o ambiente de desenvolvimento
3. **Explore** a [arquitetura](./architecture.md) do sistema
4. **Veja** os [exemplos da API](./api-reference.md)
5. **Contribua** com melhorias

---

*Esta documentação é mantida pela comunidade. Contribuições são bem-vindas!* 📚✨