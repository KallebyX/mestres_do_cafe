# ☕ Mestres do Café Enterprise

**Plataforma completa de e-commerce e ERP para o mercado de café artesanal brasileiro**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 **VISÃO GERAL**

O Mestres do Café Enterprise é uma solução completa que combina e-commerce moderno com funcionalidades ERP avançadas, desenvolvida especificamente para torrefações e cafeterias artesanais que buscam escalar seus negócios.

### **✨ Principais Diferenciadores**
- 🏪 **Multi-tenancy** para franquias independentes
- 🤖 **Gamificação** avançada ("Clube dos Mestres")
- 🛒 **Marketplace** com gestão de vendedores
- 💳 **Sistema de escrow** para transações seguras
- 📊 **Analytics** em tempo real
- ☕ **Especialização** em produtos de café

---

## 🚀 **INÍCIO RÁPIDO**

### **Opção 1: Docker (Recomendado)**
```bash
# 1. Clone o repositório
git clone https://github.com/KallebyX/mestres_cafe_enterprise.git
cd mestres_cafe_enterprise

# 2. Configure o ambiente
cp .env.docker.example .env
# Edite o .env conforme necessário

# 3. Execute com Docker
docker-compose up -d

# 4. Acesse a aplicação
# Frontend: http://localhost:3000
# API: http://localhost:5001
```

### **Opção 2: Desenvolvimento Local**
```bash
# Backend
cd apps/api
pip install -r requirements.txt
python src/app.py

# Frontend (em outro terminal)
cd apps/web
npm install
npm run dev
```

---

## 🏗️ **ARQUITETURA DO SISTEMA**

### **Stack Tecnológico**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Flask 3.0 + SQLAlchemy 2.0 + Python 3.11
- **Database**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **Cache**: Redis
- **Infraestrutura**: Docker + Nginx + GitHub Actions

### **Arquitetura Monorepo**
```
mestres_cafe_enterprise/
├── apps/
│   ├── api/          # Backend Flask
│   └── web/          # Frontend React
├── docs/             # Documentação
├── tools/            # Ferramentas e scripts
└── docker-compose.yml
```

---

## 📊 **FUNCIONALIDADES PRINCIPAIS**

### 🛒 **E-commerce Completo**
- Catálogo de produtos com filtros avançados
- Carrinho de compras e checkout otimizado
- Sistema de reviews e avaliações
- Gestão de favoritos (wishlist)
- Cálculo de frete em tempo real

### 🏢 **ERP Enterprise**
- **Estoque**: Controle avançado com códigos de barras
- **Financeiro**: Contabilidade e relatórios completos
- **RH**: Gestão de funcionários e folha de pagamento
- **CRM**: Gestão completa de clientes e leads
- **Fornecedores**: Controle de compras e relacionamento

### 🏪 **Multi-tenancy (Franquias)**
- Isolamento completo de dados por tenant
- Configurações personalizadas por franquia
- Billing e gestão de assinaturas
- Dashboard independente por loja

### 🎮 **Gamificação "Clube dos Mestres"**
- Sistema de pontos baseado em compras
- 5 níveis de progressão (Aprendiz → Lenda)
- Descontos progressivos por nível
- Sistema de conquistas e badges
- Ranking e competições

### 🛒 **Marketplace Multi-vendor**
- Registro e gestão de vendedores
- Sistema de comissões automático
- Escrow para pagamentos seguros
- Dashboard dedicado para vendedores

### 💳 **Integrações Nativas**
- **Mercado Pago**: Pagamentos via PIX, cartão e boleto
- **Melhor Envio**: Cálculo e tracking de frete
- **ViaCEP**: Validação de endereços

---

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente Essenciais**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mestres_cafe

# Segurança (ALTERE EM PRODUÇÃO!)
SECRET_KEY=sua-chave-super-secreta-de-32-chars-ou-mais
JWT_SECRET_KEY=sua-chave-jwt-super-secreta-de-32-chars

# APIs Externas
MERCADO_PAGO_ACCESS_TOKEN=seu-token-mp
MELHOR_ENVIO_API_KEY=seu-token-melhor-envio

# Cache (opcional)
REDIS_URL=redis://localhost:6379/0
```

### **APIs Necessárias**
- 🏦 **Mercado Pago**: Para processamento de pagamentos
- 📦 **Melhor Envio**: Para cálculo e rastreamento de fretes

---

## 🐳 **DOCKER**

### **Desenvolvimento Completo**
```bash
# Serviços principais
docker-compose up -d

# Com ferramentas de desenvolvimento
docker-compose --profile tools up -d

# Com monitoramento
docker-compose --profile monitoring up -d
```

### **Serviços Disponíveis**
| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface React |
| **API** | http://localhost:5001 | Backend Flask |
| **Adminer** | http://localhost:8080 | Admin PostgreSQL |
| **Redis Commander** | http://localhost:8081 | Admin Redis |
| **Grafana** | http://localhost:3001 | Dashboards |

---

## 📚 **DOCUMENTAÇÃO**

### **Essencial para Desenvolvedores**
- 📋 **[Instalação](docs/installation.md)** - Setup detalhado
- 🏗️ **[Arquitetura](docs/architecture.md)** - Visão técnica
- 📡 **[API Reference](docs/api-reference.md)** - Endpoints completos
- 🎨 **[Frontend](docs/frontend.md)** - Guia React
- 🗄️ **[Database](docs/database.md)** - Modelos e relacionamentos
- 🐳 **[Docker](docs/docker.md)** - Containerização
- 🤝 **[Contributing](docs/contributing.md)** - Como contribuir

### **Guias Específicos**
- 🐳 **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Guia completo Docker
- 📦 **[MELHOR_ENVIO_SETUP.md](MELHOR_ENVIO_SETUP.md)** - Integração frete
- 💳 **[MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md)** - Integração pagamentos
- ⚙️ **[GUIA_CONFIGURACAO_COMPLETO.md](GUIA_CONFIGURACAO_COMPLETO.md)** - Setup completo

---

## 🧪 **TESTES E QUALIDADE**

```bash
# Testes do backend
cd apps/api && python -m pytest

# Testes do frontend
cd apps/web && npm run test

# Linting e formatação
npm run lint
npm run format
```

---

## 🚀 **DEPLOY**

### **Desenvolvimento**
```bash
docker-compose up -d
```

### **Produção**
```bash
# Build otimizado
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### **Plataformas Suportadas**
- 🚀 **Render.com** (configuração incluída)
- 🐳 **Docker** (qualquer provedor)
- ☁️ **AWS, GCP, Azure** (via Docker)

---

## 📊 **MONITORAMENTO**

### **Health Checks**
- **API**: http://localhost:5001/api/health
- **Frontend**: http://localhost:3000
- **Database**: Verificação automática via health checks

### **Métricas (com profile monitoring)**
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

---

## 🏆 **DIFERENCIAÇÃO NO MERCADO**

### **Para o Mercado de Café**
- ☕ **Atributos específicos**: Origem, torra, SCA score, notas sensoriais
- 📦 **Gestão de lotes**: Rastreabilidade completa do grão
- 🏅 **Sistema de cupping**: Avaliação sensorial integrada
- 📊 **Analytics específicos**: Métricas do mercado de café especial

### **Tecnologia Enterprise**
- 🏗️ **Arquitetura escalável**: Multi-tenant preparada para crescimento
- 🔒 **Segurança**: Práticas enterprise com auditoria completa
- 📈 **Performance**: Cache otimizado e queries eficientes
- 🔄 **CI/CD**: Deploy automatizado e testes contínuos

---

## 🤝 **CONTRIBUINDO**

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

Veja [CONTRIBUTING.md](docs/contributing.md) para mais detalhes.

---

## 📄 **LICENÇA**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🎯 **STATUS DO PROJETO**

- ✅ **MVP Completo**: Todas as funcionalidades core implementadas
- ✅ **Testes**: Cobertura abrangente de testes
- ✅ **Documentação**: Guias completos para desenvolvedores
- ✅ **Deploy**: Pronto para produção
- ✅ **Performance**: Otimizado para alta demanda

**🚀 O sistema está pronto para o mercado!** ☕

---

*Desenvolvido com ❤️ para a comunidade brasileira de café especial*