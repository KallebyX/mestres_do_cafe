# TODO - Mestres do Café - Gap Analysis & Roadmap

**Última atualização**: 2025-11-18
**Status**: Em Progresso
**Projeto**: Mestres do Café - E-commerce & ERP System

---

## 📊 Executive Summary

O projeto possui uma arquitetura sólida com 99 arquivos Python no backend, 164 arquivos no frontend e aproximadamente 14.550 linhas de código de rotas. Porém, existem gaps significativos em:

- ❌ **0 testes** no backend e frontend
- ❌ Configurações de infraestrutura faltando (nginx, monitoring)
- ❌ Endpoints de debug expostos (risco de segurança)
- ⚠️ Implementações incompletas em serviços críticos
- ⚠️ Documentação de API ausente

---

## 🔴 CRITICAL PRIORITY (Bloqueia Produção)

### 1. Testing Infrastructure [CRÍTICO]

#### Backend - 0 Testes Escritos
- [ ] Criar estrutura `/apps/api/tests/`
- [ ] Implementar `test_auth.py` - Autenticação e JWT
- [ ] Implementar `test_products.py` - CRUD de produtos
- [ ] Implementar `test_orders.py` - Fluxo de pedidos
- [ ] Implementar `test_payments.py` - Pagamentos e transações
- [ ] Implementar `test_mercado_pago.py` - Integração MercadoPago
- [ ] Implementar `test_cart.py` - Carrinho de compras
- [ ] Implementar `test_checkout.py` - Processo de checkout
- [ ] Implementar `test_notifications.py` - Sistema de notificações
- [ ] Implementar `test_reviews.py` - Sistema de avaliações
- [ ] Configurar coverage mínimo de 80%
- [ ] Integrar pytest no CI/CD

**Impacto**: Sem testes, não há garantia de qualidade ou confiabilidade do sistema.

#### Frontend - 0 Testes Escritos
- [ ] Criar estrutura de testes Vitest
- [ ] Testes de componentes críticos:
  - [ ] `AuthContext.test.jsx` - Autenticação
  - [ ] `CartContext.test.jsx` - Carrinho
  - [ ] `NotificationContext.test.jsx` - Notificações
  - [ ] `Checkout.test.jsx` - Fluxo de checkout
  - [ ] `ProductList.test.jsx` - Listagem de produtos
- [ ] Testes de integração para páginas principais
- [ ] Testes E2E com Playwright
- [ ] Configurar coverage mínimo de 70%

**Impacto**: Frontend sem testes = bugs em produção garantidos.

### 2. Segurança - Debug Endpoints Expostos [CRÍTICO]

**⚠️ RISCO EXTREMO DE SEGURANÇA**

Endpoints que DEVEM ser removidos/protegidos imediatamente:
- [ ] **REMOVER** `/api/debug/env` - expõe variáveis de ambiente
- [ ] **REMOVER** `/api/debug/database` - expõe informações do banco
- [ ] **REMOVER** `/api/auth/debug-database` - debug de autenticação
- [ ] **REMOVER** `/api/products/debug-uuid/<id>` - debug de produtos
- [ ] **REMOVER** `/api/products/debug-search` - debug de busca
- [ ] Implementar proteção por ambiente (apenas dev/staging)
- [ ] Adicionar decorator `@production_safe` para rotas debug

**Impacto**: Exposição de segredos, credenciais e estrutura do banco em produção.

### 3. Arquivo de Modelo Vazio [CRÍTICO]

- [ ] Implementar `/apps/api/src/models/melhor_envio.py` (apenas 1 linha)
  - [ ] Criar modelo `ShippingQuote`
  - [ ] Criar modelo `ShippingLabel`
  - [ ] Criar modelo `ShippingTracking`
  - [ ] Adicionar relacionamentos com `Order`

**Impacto**: Integração com Melhor Envio quebrada, impossível processar envios.

### 4. Infraestrutura Docker Faltando [CRÍTICO]

#### Nginx (Reverse Proxy)
- [ ] Criar diretório `/nginx/`
- [ ] Criar `/nginx/nginx.conf` - Configuração principal
- [ ] Criar `/nginx/conf.d/default.conf` - Configuração do site
- [ ] Configurar SSL/TLS com Let's Encrypt
- [ ] Configurar compressão gzip
- [ ] Configurar cache de assets estáticos
- [ ] Configurar rate limiting no nginx
- [ ] Configurar security headers

**Impacto**: Proxy reverso não funciona no perfil production do Docker Compose.

#### Monitoring Stack
- [ ] Criar diretório `/monitoring/`
- [ ] Criar `/monitoring/prometheus.yml` - Configuração Prometheus
- [ ] Criar `/monitoring/grafana/dashboards/` - Dashboards pré-configurados
  - [ ] Dashboard de API Metrics
  - [ ] Dashboard de Database Performance
  - [ ] Dashboard de User Analytics
  - [ ] Dashboard de System Resources
- [ ] Criar `/monitoring/grafana/datasources/` - Configuração de datasources
- [ ] Configurar alertas críticos (CPU, Memory, Disk, Errors)

**Impacto**: Impossível monitorar o sistema em produção.

### 5. CI/CD Pipeline Ausente [CRÍTICO]

Apenas 1 workflow existe (`neon_workflow.yml` para branching de banco). Faltam:

- [ ] **Workflow de Testes** (`.github/workflows/test.yml`)
  - [ ] Executar pytest no backend
  - [ ] Executar Vitest no frontend
  - [ ] Gerar relatórios de coverage
  - [ ] Falhar build se coverage < threshold

- [ ] **Workflow de Linting** (`.github/workflows/lint.yml`)
  - [ ] ESLint no frontend (max 50 warnings)
  - [ ] Flake8/Black no backend
  - [ ] TypeScript type checking
  - [ ] Verificar formatação

- [ ] **Workflow de Security Scanning** (`.github/workflows/security.yml`)
  - [ ] Snyk para vulnerabilidades
  - [ ] OWASP Dependency Check
  - [ ] Trivy para Docker images
  - [ ] GitGuardian para secrets

- [ ] **Workflow de Build & Deploy** (`.github/workflows/deploy.yml`)
  - [ ] Build Docker images
  - [ ] Push para registry
  - [ ] Deploy automático em staging
  - [ ] Deploy manual em produção

- [ ] **Workflow de Dependabot**
  - [ ] Auto-updates de dependências
  - [ ] Auto-merge de patches de segurança

**Impacto**: Deploy manual = alta chance de erros, sem automação de qualidade.

### 6. Cobertura de Autenticação Incompleta [CRÍTICO]

Apenas 118 usos de `@jwt_required()` encontrados para 29 arquivos de rotas.

- [ ] Auditar TODAS as rotas e identificar endpoints desprotegidos
- [ ] Adicionar `@jwt_required()` em endpoints que manipulam dados sensíveis
- [ ] Implementar RBAC (Role-Based Access Control):
  - [ ] Decorator `@require_role('admin')`
  - [ ] Decorator `@require_role('employee')`
  - [ ] Decorator `@require_permission('can_edit_products')`
- [ ] Implementar sistema de permissões granulares
- [ ] Adicionar MFA (Multi-Factor Authentication) para admins
- [ ] Implementar OAuth2/OpenID Connect para integrações

**Impacto**: Endpoints desprotegidos = acesso não autorizado a dados sensíveis.

---

## 🟠 HIGH PRIORITY (Próximo Sprint)

### 7. Service Implementation - TODOs Pendentes

#### Notification Service (`/apps/api/src/services/notification_service.py`)
- [ ] Linha 172: Implementar envio de SMS (Twilio/AWS SNS)
  - [ ] Configurar Twilio API
  - [ ] Criar template de SMS
  - [ ] Implementar retry logic
- [ ] Linha 189: Implementar push notifications (Firebase Cloud Messaging)
  - [ ] Configurar FCM
  - [ ] Criar sistema de device tokens
  - [ ] Implementar notificações ricas
- [ ] Linha 446: Completar busca de usuário por email
- [ ] Linha 457: Completar busca de usuário por telefone
- [ ] Linha 468: Completar busca de device token

#### Reviews Controller (`/apps/api/src/controllers/reviews.py`)
- [ ] Linha 482: Implementar verificação de permissões company/admin
- [ ] Linha 642: Completar verificação de permissões de moderador

#### Newsletter Routes (`/apps/api/src/controllers/routes/newsletter.py`)
- [ ] Linha 61: Implementar envio de email de verificação
- [ ] Linha 260: Implementar job em background para envio de emails
  - [ ] Configurar Celery/RQ
  - [ ] Criar task de envio em lote
  - [ ] Implementar rate limiting de emails

#### Notifications Routes (`/apps/api/src/controllers/routes/notifications.py`)
- [ ] Linha 291: Implementar query de usuários ativos para broadcast

**Impacto**: Funcionalidades incompletas afetam experiência do usuário.

### 8. API Documentation [HIGH]

- [ ] Configurar Flask-RESTX ou Flasgger para OpenAPI/Swagger
- [ ] Documentar TODOS os 29 arquivos de rotas:
  - [ ] auth.py - Autenticação e registro
  - [ ] products.py - Catálogo de produtos
  - [ ] orders.py - Gestão de pedidos
  - [ ] payments.py - Processamento de pagamentos
  - [ ] cart.py - Carrinho de compras
  - [ ] checkout.py - Fluxo de checkout
  - [ ] mercado_pago.py - Webhooks MercadoPago
  - [ ] melhor_envio.py - Cálculo de frete
  - [ ] notifications.py - Sistema de notificações
  - [ ] reviews.py - Sistema de avaliações
  - [ ] admin.py - Painel administrativo
  - [ ] newsletter.py - Gestão de newsletter
  - [ ] analytics.py - Analytics e métricas
  - [ ] blog.py - Sistema de blog
  - [ ] cms.py - Gestão de conteúdo
  - [ ] courses.py - Cursos online
  - [ ] crm.py - CRM e relacionamento
  - [ ] dashboard.py - Dashboards
  - [ ] erp.py - Funcionalidades ERP
  - [ ] financeiro.py - Gestão financeira
  - [ ] gamification.py - Sistema de gamificação
  - [ ] health.py - Health checks
  - [ ] hr.py - Recursos humanos
  - [ ] inventory.py - Gestão de estoque
  - [ ] loyalty.py - Programa de fidelidade
  - [ ] pdv.py - Ponto de venda
  - [ ] pos.py - Sistema POS
  - [ ] reports.py - Relatórios
  - [ ] settings.py - Configurações
- [ ] Criar coleção Postman
- [ ] Documentar autenticação (JWT flow)
- [ ] Documentar webhooks (MercadoPago, Melhor Envio)
- [ ] Adicionar exemplos de request/response
- [ ] Versionar API (v1, v2)

**Impacto**: Sem docs, integração por terceiros é difícil/impossível.

### 9. Frontend - Error Boundaries [HIGH]

- [ ] Criar componente `ErrorBoundary.jsx`
- [ ] Criar componente `ErrorFallback.jsx` (UI amigável)
- [ ] Integrar Sentry para tracking de erros
  - [ ] Configurar VITE_SENTRY_DSN
  - [ ] Adicionar breadcrumbs de navegação
  - [ ] Capturar erros de API
- [ ] Adicionar Error Boundaries em:
  - [ ] Root App
  - [ ] Páginas principais (Home, Products, Checkout)
  - [ ] Componentes complexos (Dashboard, Admin)
- [ ] Criar página de erro 404 personalizada
- [ ] Criar página de erro 500 personalizada

**Impacto**: Erros sem tratamento = tela branca = usuários perdidos.

### 10. Database Migration System [HIGH]

- [ ] Instalar e configurar Flask-Migrate (Alembic)
- [ ] Inicializar Alembic: `flask db init`
- [ ] Criar migração inicial: `flask db migrate -m "Initial migration"`
- [ ] Criar script de migração para dados existentes
- [ ] Documentar processo de migração
- [ ] Adicionar migrations/ ao controle de versão
- [ ] Criar script de rollback
- [ ] Testar migrations em ambiente de staging

**Impacto**: Sem migrations, mudanças de schema causam quebra de produção.

### 11. Background Job Queue [HIGH]

- [ ] Instalar Celery ou RQ (Redis Queue)
- [ ] Configurar Redis como broker
- [ ] Criar tasks assíncronas:
  - [ ] `send_email_task` - Envio de emails
  - [ ] `process_webhook_task` - Processar webhooks
  - [ ] `generate_report_task` - Gerar relatórios
  - [ ] `send_newsletter_task` - Enviar newsletter
  - [ ] `update_inventory_task` - Atualizar estoque
- [ ] Configurar Flower para monitoramento
- [ ] Implementar retry logic
- [ ] Implementar dead letter queue
- [ ] Documentar criação de novas tasks

**Impacto**: Operações síncronas tornam API lenta, timeout em operações longas.

### 12. Security Hardening [HIGH]

#### Rate Limiting
- [ ] Aplicar rate limiting em TODAS as rotas públicas
- [ ] Configurar Redis-based distributed rate limiting
- [ ] Implementar rate limiting por API key
- [ ] Implementar adaptive rate limiting (throttling)
- [ ] Configurar diferentes limites por endpoint:
  - [ ] Auth: 5 req/min
  - [ ] API pública: 100 req/hour
  - [ ] Admin: 1000 req/hour

#### CSRF Protection
- [ ] Adicionar CSRF tokens em formulários
- [ ] Configurar Flask-WTF CSRF
- [ ] Proteger endpoints POST/PUT/DELETE
- [ ] Documentar exceções (webhooks, API pública)

#### Secrets Management
- [ ] Migrar para AWS Secrets Manager ou HashiCorp Vault
- [ ] Remover secrets de .env em produção
- [ ] Implementar rotação automática de secrets
- [ ] Criptografar secrets em repouso
- [ ] Auditar acesso a secrets

#### Security Headers
- [ ] Revisar CSP (Content Security Policy)
- [ ] Adicionar HSTS preload
- [ ] Configurar X-Frame-Options
- [ ] Configurar X-Content-Type-Options
- [ ] Adicionar Referrer-Policy

**Impacto**: Vulnerabilidades de segurança = risco de ataque, perda de dados.

### 13. Missing Infrastructure Scripts [HIGH]

Criar em `/scripts/`:
- [ ] `backup-database.sh` - Backup automático do PostgreSQL
- [ ] `restore-database.sh` - Restore de backup
- [ ] `deploy-production.sh` - Script de deploy em produção
- [ ] `deploy-staging.sh` - Script de deploy em staging
- [ ] `validate-env.sh` - Validar variáveis de ambiente
- [ ] `warm-cache.sh` - Pré-aquecer cache
- [ ] `migrate-data.sh` - Migrar dados entre ambientes
- [ ] `health-check.sh` - Verificar saúde do sistema
- [ ] `generate-ssl-cert.sh` - Gerar certificados SSL
- [ ] `rotate-logs.sh` - Rotacionar logs

**Impacto**: Operações manuais = erro humano, lentidão operacional.

### 14. Accessibility Audit [HIGH]

- [ ] Instalar axe-core para testes de acessibilidade
- [ ] Adicionar ARIA labels em todos os componentes interativos
- [ ] Testar navegação por teclado (Tab, Enter, Esc)
- [ ] Testar com screen readers (NVDA, JAWS)
- [ ] Validar contraste de cores (WCAG AAA)
- [ ] Adicionar focus indicators visíveis
- [ ] Garantir semântica HTML correta
- [ ] Adicionar skip links
- [ ] Criar documentação de acessibilidade
- [ ] Testar com usuários com deficiência

**Impacto**: Site inacessível exclui ~15% dos usuários, problema legal (LGPD).

---

## 🟡 MEDIUM PRIORITY (Próximo Quarter)

### 15. TypeScript Migration [MEDIUM]

- [ ] Renomear arquivos .jsx para .tsx gradualmente
- [ ] Criar tipos para respostas de API (`/src/types/api.ts`)
- [ ] Criar tipos para modelos (`/src/types/models.ts`)
- [ ] Adicionar tipos para contexts
- [ ] Adicionar tipos para hooks
- [ ] Configurar strict mode no tsconfig.json
- [ ] Eliminar todos os `any` types
- [ ] Adicionar PropTypes como fallback

**Impacto**: Melhora DX, reduz bugs de tipo em runtime.

### 16. Internationalization (i18n) [MEDIUM]

- [ ] Instalar `react-i18next`
- [ ] Criar estrutura de traduções em `/locales/`
  - [ ] `/locales/pt-BR/` - Português
  - [ ] `/locales/en-US/` - Inglês
  - [ ] `/locales/es-ES/` - Espanhol
- [ ] Extrair todos os textos hardcoded
- [ ] Criar hook `useTranslation`
- [ ] Adicionar language switcher no header
- [ ] Configurar detecção de idioma do browser
- [ ] Traduzir todos os textos
- [ ] Traduzir mensagens de erro

**Impacto**: Expande mercado para outros países.

### 17. Performance Optimization [MEDIUM]

#### Backend
- [ ] Adicionar índices no banco de dados
- [ ] Implementar query caching com Redis
- [ ] Otimizar queries N+1
- [ ] Configurar connection pooling
- [ ] Adicionar slow query logging
- [ ] Implementar database read replicas

#### Frontend
- [ ] Configurar code splitting no Vite:
  ```js
  manualChunks: {
    vendor: ['react', 'react-dom', 'react-router-dom'],
    ui: ['@radix-ui/*'],
    utils: ['axios', 'date-fns', 'lodash']
  }
  ```
- [ ] Implementar lazy loading de rotas
- [ ] Adicionar React.lazy() em componentes pesados
- [ ] Configurar image optimization (next/image ou similar)
- [ ] Implementar virtual scrolling em listas longas
- [ ] Adicionar Service Worker para PWA
- [ ] Configurar cache de assets
- [ ] Implementar prefetching de páginas

**Impacto**: Performance ruim = alta taxa de abandono, SEO penalizado.

### 18. Missing Endpoints Implementation [MEDIUM]

Modelos existem mas rotas estão incompletas:

- [ ] `/api/vendors` - CRUD completo para fornecedores
  - [ ] GET /vendors - Listar fornecedores
  - [ ] GET /vendors/:id - Detalhe de fornecedor
  - [ ] POST /vendors - Criar fornecedor
  - [ ] PUT /vendors/:id - Atualizar fornecedor
  - [ ] DELETE /vendors/:id - Deletar fornecedor

- [ ] `/api/suppliers` - Expandir rotas de suppliers
  - [ ] GET /suppliers/:id/orders - Pedidos do supplier
  - [ ] GET /suppliers/:id/products - Produtos do supplier
  - [ ] POST /suppliers/:id/rating - Avaliar supplier

- [ ] `/api/tax` - Gestão de impostos
  - [ ] GET /tax/calculate - Calcular impostos
  - [ ] POST /tax/rules - Criar regra fiscal
  - [ ] GET /tax/rules - Listar regras fiscais

- [ ] `/api/tenancy` - Multi-tenant support
  - [ ] POST /tenancy/switch - Trocar tenant
  - [ ] GET /tenancy/current - Tenant atual
  - [ ] GET /tenancy/available - Tenants disponíveis

- [ ] `/api/media` - Gestão de arquivos
  - [ ] POST /media/upload - Upload de arquivo
  - [ ] GET /media/:id - Download de arquivo
  - [ ] DELETE /media/:id - Deletar arquivo
  - [ ] GET /media - Listar arquivos

**Impacto**: Funcionalidades parciais, UX inconsistente.

### 19. Code Quality Improvements [MEDIUM]

- [ ] Remover todos os `print()` statements, usar `logger`
- [ ] Remover código comentado
- [ ] Padronizar mensagens de erro
- [ ] Implementar structured logging (JSON logs)
- [ ] Configurar log rotation
- [ ] Adicionar docstrings em todas as funções
- [ ] Configurar pre-commit hooks:
  - [ ] Black (formatação Python)
  - [ ] Flake8 (linting Python)
  - [ ] Prettier (formatação JS/JSX)
  - [ ] ESLint (linting JS/JSX)
- [ ] Configurar SonarQube para análise de código

**Impacto**: Código limpo = manutenção mais fácil, onboarding mais rápido.

### 20. Operations Documentation [MEDIUM]

- [ ] Criar `/docs/operations/`
- [ ] Escrever runbook de produção:
  - [ ] Como fazer deploy
  - [ ] Como fazer rollback
  - [ ] Como investigar erros
  - [ ] Como escalar serviços
- [ ] Documentar procedimentos de backup/restore
- [ ] Criar guia de troubleshooting
- [ ] Documentar incident response
- [ ] Criar playbooks de alerta
- [ ] Documentar disaster recovery

**Impacto**: Sem docs operacionais, time fica perdido em incidentes.

### 21. Monitoring Setup [MEDIUM]

- [ ] Configurar Prometheus exporters:
  - [ ] Flask metrics (prometheus_flask_exporter)
  - [ ] PostgreSQL metrics
  - [ ] Redis metrics
  - [ ] Nginx metrics
- [ ] Criar dashboards Grafana:
  - [ ] System Overview
  - [ ] API Performance
  - [ ] Database Performance
  - [ ] User Analytics
  - [ ] Error Tracking
- [ ] Configurar alertas:
  - [ ] CPU > 80%
  - [ ] Memory > 90%
  - [ ] Disk > 85%
  - [ ] Error rate > 5%
  - [ ] Response time > 2s
- [ ] Integrar com PagerDuty/OpsGenie para oncall

**Impacto**: Sem monitoramento, problemas só são descobertos por usuários.

### 22. SEO Enhancements [MEDIUM]

Apenas AboutPage tem SEO component. Expandir:

- [ ] Adicionar meta tags em TODAS as páginas
- [ ] Implementar React Helmet em todas as páginas
- [ ] Gerar sitemap.xml dinâmico
- [ ] Criar robots.txt
- [ ] Adicionar Open Graph tags
- [ ] Adicionar Twitter Cards
- [ ] Implementar JSON-LD structured data:
  - [ ] Product schema
  - [ ] Organization schema
  - [ ] BreadcrumbList schema
  - [ ] Review schema
- [ ] Configurar canonical URLs
- [ ] Implementar hreflang para i18n
- [ ] Otimizar meta descriptions
- [ ] Adicionar alt text em TODAS as imagens

**Impacto**: SEO ruim = baixa visibilidade no Google = menos tráfego orgânico.

---

## 🟢 LOW PRIORITY (Backlog)

### 23. UI/UX Polish [LOW]

- [ ] Criar design system consistente
- [ ] Padronizar estilos de botões
- [ ] Adicionar loading skeletons em TODAS as páginas
- [ ] Criar empty state illustrations
- [ ] Padronizar spacing/margins (usar Tailwind spacing)
- [ ] Auditar mobile responsiveness
- [ ] Adicionar animações de transição
- [ ] Implementar dark mode (ThemeContext já existe)
- [ ] Criar componentes de feedback visual
- [ ] Adicionar tooltips explicativos

**Impacto**: UX melhor = maior engajamento, menor churn.

### 24. Component Library Documentation [LOW]

- [ ] Configurar Storybook
- [ ] Documentar TODOS os componentes UI:
  - [ ] Button
  - [ ] Dialog
  - [ ] Form
  - [ ] Input
  - [ ] Select
  - [ ] Card
  - [ ] Badge
  - [ ] Alert
  - [ ] Toast
- [ ] Adicionar exemplos de uso
- [ ] Documentar props e variantes
- [ ] Criar playground interativo

**Impacto**: Facilita reutilização de componentes, acelera desenvolvimento.

### 25. Advanced Features [LOW]

- [ ] Implementar PWA completo (service worker)
- [ ] Adicionar notificações push no browser
- [ ] Implementar offline mode com IndexedDB
- [ ] Adicionar chat em tempo real (WebSocket)
- [ ] Implementar busca com Elasticsearch
- [ ] Adicionar recomendações de produtos (ML)
- [ ] Implementar A/B testing
- [ ] Adicionar analytics avançados (heatmaps)

**Impacto**: Features avançadas diferenciam o produto, aumentam valor.

### 26. Code Cleanup [LOW]

- [ ] Remover imports não utilizados
- [ ] Remover variáveis não utilizadas
- [ ] Remover arquivos mortos
- [ ] Refatorar duplicação de código
- [ ] Simplificar lógica complexa
- [ ] Melhorar nomenclatura de variáveis
- [ ] Organizar imports (external, internal, relative)

**Impacto**: Código limpo facilita manutenção futura.

---

## 📈 Métricas de Progresso

### Cobertura de Testes
- Backend: **0%** → Meta: **80%**
- Frontend: **0%** → Meta: **70%**

### Segurança
- Vulnerabilidades Críticas: **6** → Meta: **0**
- Endpoints Desprotegidos: **?** → Meta: **0**
- Debug Endpoints: **5** → Meta: **0**

### Infraestrutura
- CI/CD Workflows: **1/6** → Meta: **6/6**
- Documentação API: **0%** → Meta: **100%**
- Monitoramento: **0%** → Meta: **100%**

### Performance
- Lighthouse Score: **?** → Meta: **>90**
- API Response Time (p95): **?** → Meta: **<500ms**
- Bundle Size: **?** → Meta: **<500kb**

---

## 🚀 Roadmap Sugerido

### Semana 1-2: Fundação Crítica
1. ✅ Criar TODO.md (este arquivo)
2. ⏳ Remover debug endpoints
3. ⏳ Implementar melhor_envio.py model
4. ⏳ Criar estrutura de testes backend
5. ⏳ Criar estrutura de testes frontend
6. ⏳ Configurar nginx/
7. ⏳ Configurar monitoring/

### Semana 3-4: Qualidade e Segurança
8. ⏳ Escrever testes críticos (auth, payments, orders)
9. ⏳ Auditar e proteger endpoints com JWT
10. ⏳ Implementar RBAC
11. ⏳ Configurar CI/CD workflows
12. ⏳ Implementar rate limiting global

### Semana 5-6: Completude de Features
13. ⏳ Completar TODOs de services
14. ⏳ Implementar background job queue
15. ⏳ Configurar database migrations
16. ⏳ Gerar API documentation
17. ⏳ Criar scripts de infraestrutura

### Semana 7-8: Observabilidade
18. ⏳ Configurar monitoring completo
19. ⏳ Implementar structured logging
20. ⏳ Criar dashboards Grafana
21. ⏳ Configurar alertas
22. ⏳ Escrever runbooks

### Mês 3: Performance e UX
23. ⏳ Otimizar performance backend
24. ⏳ Otimizar performance frontend
25. ⏳ Implementar SEO completo
26. ⏳ Auditar acessibilidade
27. ⏳ Polish de UI/UX

### Mês 4+: Expansão
28. ⏳ Migração TypeScript
29. ⏳ Internationalization
30. ⏳ Features avançadas
31. ⏳ Otimizações contínuas

---

## 📝 Convenções deste Documento

- [ ] Tarefa pendente
- [⏳] Tarefa em progresso
- [✅] Tarefa completa
- **[CRÍTICO]** - Bloqueia produção
- **[HIGH]** - Alta prioridade
- **[MEDIUM]** - Média prioridade
- **[LOW]** - Baixa prioridade

---

## 🤝 Como Contribuir

1. Escolha um item da lista
2. Marque como [⏳] em progresso
3. Crie uma branch: `feature/todo-item-name`
4. Implemente e teste
5. Abra Pull Request
6. Após merge, marque como [✅]

---

**🎯 Meta Atual**: Estabelecer fundação sólida para produção (Itens CRÍTICOS)

**📅 Próxima Revisão**: A cada sprint (2 semanas)
