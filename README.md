# ☕ Café - Sistema Enterprise

> Sistema completo de e-commerce e ERP para torrefação artesanal de cafés especiais

## 🏗️ Arquitetura Enterprise

Este é um monorepo enterprise que unifica frontend e backend em uma estrutura profissional e escalável.

### 📁 Estrutura do Projeto

```
cafe/
├── apps/                           # Aplicações principais
│   ├── web/                        # Frontend React (Vite)
│   │   ├── src/
│   │   │   ├── components/         # Componentes React
│   │   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── contexts/          # React contexts
│   │   │   ├── services/          # Serviços de API
│   │   │   └── utils/             # Utilitários
│   │   ├── public/                # Assets estáticos
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── api/                        # Backend Flask
│       ├── src/
│       │   ├── controllers/        # Controladores/Routes
│       │   ├── models/            # Modelos do banco
│       │   ├── services/          # Lógica de negócio
│       │   ├── middleware/        # Middlewares
│       │   ├── config/            # Configurações
│       │   └── utils/             # Utilitários
│       ├── migrations/            # Migrações do banco
│       ├── requirements.txt
│       └── app.py
│
├── packages/                       # Pacotes compartilhados
│   ├── shared/                     # Tipos, interfaces, constantes
│   ├── ui/                        # Componentes UI reutilizáveis
│   └── database/                  # Schemas e configurações DB
│
├── tools/                          # Ferramentas e scripts
│   ├── scripts/                   # Scripts de automação
│   └── docker/                    # Configurações Docker
│
├── docs/                          # Documentação
├── tests/                         # Testes
│   ├── unit/                      # Testes unitários
│   ├── integration/               # Testes de integração
│   └── e2e/                       # Testes end-to-end
│
├── package.json                   # Configuração do workspace
├── docker-compose.yml             # Orquestração de containers
├── .env.example                   # Variáveis de ambiente
└── Makefile                       # Comandos de automação
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Python 3.9+
- Docker (opcional)

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/KallebyX/cafe.git
cd cafe

# Instalar dependências do workspace
npm install

# Configurar ambiente
cp .env.example .env

# Iniciar desenvolvimento
make dev
```

### Comandos Principais
```bash
# Desenvolvimento
make dev              # Inicia frontend + backend
make dev-web          # Apenas frontend
make dev-api          # Apenas backend

# Build
make build            # Build completo
make build-web        # Build frontend
make build-api        # Build backend

# Testes
make test             # Todos os testes
make test-unit        # Testes unitários
make test-e2e         # Testes end-to-end

# Deploy
make deploy-staging   # Deploy staging
make deploy-prod      # Deploy produção
```

## 🏛️ Padrões Enterprise

### Arquitetura
- **Monorepo**: Código unificado com workspaces
- **Microservices Ready**: Preparado para escalar
- **Clean Architecture**: Separação clara de responsabilidades
- **Domain Driven Design**: Organização por domínios

### Qualidade
- **TypeScript**: Tipagem estática
- **ESLint + Prettier**: Padronização de código
- **Husky**: Git hooks para qualidade
- **Jest + Cypress**: Testes automatizados
- **SonarQube**: Análise de qualidade

### DevOps
- **Docker**: Containerização
- **CI/CD**: Pipelines automatizados
- **Monitoring**: Logs e métricas
- **Security**: Análise de vulnerabilidades

## 📊 Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** + **Shadcn/UI**
- **React Query** (State management)
- **React Hook Form** (Formulários)

### Backend
- **Flask** + **Python 3.9+**
- **SQLAlchemy** (ORM)
- **Alembic** (Migrações)
- **JWT** (Autenticação)
- **Celery** (Tasks assíncronas)

### Database
- **PostgreSQL** (Produção)
- **SQLite** (Desenvolvimento)
- **Redis** (Cache/Sessions)

### DevOps
- **Docker** + **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Nginx** (Reverse proxy)
- **Gunicorn** (WSGI server)

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```bash
# Database
DATABASE_URL=sqlite:///mestres_cafe.db
REDIS_URL=redis://localhost:6379

# API
API_SECRET_KEY=your-secret-key
API_DEBUG=true
API_PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Mestres do Café
```

### Estrutura de Branches
- `main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes
- `release/*`: Preparação de releases

## 📈 Roadmap

### v1.0 - MVP ✅
- [x] E-commerce básico
- [x] Gestão de produtos
- [x] Sistema de pedidos
- [x] Autenticação

### v1.1 - ERP Core
- [ ] Gestão de estoque
- [ ] Relatórios financeiros
- [ ] CRM básico
- [ ] Dashboard analytics

### v1.2 - Advanced Features
- [ ] Sistema de pontos
- [ ] Programa de fidelidade
- [ ] Blog integrado
- [ ] Marketplace de produtores

### v2.0 - Enterprise
- [ ] Multi-tenant
- [ ] API pública
- [ ] Mobile app
- [ ] IA/ML features

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Time

- **KallebyX**: Desenvolvimento Full Stack e arquitetura

---

**Café Enterprise** - Sistema completo para torrefação artesanal ☕🚀

