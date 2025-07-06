# Exemplos de Prompts Otimizados para Engenharia de Contexto

## Prompts para Code Review

### Análise de Componente React

```
Analise este componente ProductCard considerando o contexto do projeto Mestres do Café:

1. Aderência aos padrões TypeScript rigorosos do projeto
2. Consistência com design system Tailwind CSS
3. Performance e otimizações (memoização, lazy loading)
4. Acessibilidade e UX
5. Integração com React Query para estado
6. Padrões de error handling estabelecidos
7. Testabilidade e cobertura

Componente:
[colar código aqui]

Forneça feedback específico e sugestões de melhoria alinhadas com a arquitetura Clean do projeto.
```

### Análise de API Flask

```
Revise este endpoint da API considerando os padrões enterprise do Mestres do Café:

1. Implementação de Clean Architecture (Controller → Service → Repository)
2. Validação de entrada com Pydantic
3. Type hints e docstrings Google style
4. Tratamento de erros e logging apropriado
5. Segurança (autenticação JWT, sanitização)
6. Performance (queries otimizadas, cache)
7. Testes de integração

Endpoint:
[colar código aqui]

Identifique melhorias alinhadas com padrões DDD e arquitetura enterprise.
```

## Prompts para Implementação de Features

### Nova Funcionalidade E-commerce

```
Implementar sistema de avaliações de produtos para o Mestres do Café:

**Contexto do Projeto:**
- Sistema enterprise de e-commerce para torrefação de café
- Arquitetura: React + TypeScript (frontend) + Flask + Python (backend)
- Padrões: Clean Architecture + Domain Driven Design
- Database: PostgreSQL com SQLAlchemy

**Requisitos:**
- Clientes podem avaliar produtos comprados (1-5 estrelas + comentário)
- Moderação de comentários por admins
- Exibição de média e distribuição de avaliações
- Filtros por nota na listagem de produtos

**Implementação Esperada:**
1. Modelos de dados seguindo padrões SQLAlchemy do projeto
2. APIs REST com validação Pydantic
3. Componentes React com TypeScript rigoroso
4. Testes unitários e de integração
5. Documentação API

Siga os padrões estabelecidos no projeto e considere impactos em performance e UX.
```

### Otimização de Performance

```
Otimizar performance da listagem de produtos no Mestres do Café:

**Problema Atual:**
- Carregamento lento com muitos produtos
- Queries N+1 no backend
- Re-renders desnecessários no frontend

**Contexto Técnico:**
- Backend: Flask + SQLAlchemy + PostgreSQL
- Frontend: React + TypeScript + React Query
- Padrões: Clean Architecture estabelecida

**Otimizações Necessárias:**
1. Eager loading e joins otimizados (SQLAlchemy)
2. Paginação eficiente com cursor-based pagination
3. Cache Redis para dados frequentes
4. Lazy loading de imagens no frontend
5. Memoização de componentes React
6. Virtual scrolling para listas grandes

Implemente seguindo padrões do projeto e mantenha compatibilidade com APIs existentes.
```

## Prompts para Debugging

### Erro de Autenticação

```
Debug problema de autenticação JWT no Mestres do Café:

**Erro:**
- Status 401 "Token inválido" em requests autenticados
- Ocorre esporadicamente, não sempre
- Logs: [colar logs específicos]

**Contexto do Sistema:**
- Autenticação JWT com refresh tokens
- Redis para blacklist de tokens
- Middleware Flask para validação
- Frontend React com interceptors Axios

**Ambiente:**
- Desenvolvimento local com Docker
- PostgreSQL + Redis containers
- Variáveis de ambiente configuradas

**Análise Necessária:**
1. Validação de configuração JWT (secret, expiry)
2. Sincronização de tempo entre containers
3. Estado do Redis e blacklist
4. Logs detalhados do middleware
5. Comportamento do refresh token

Considere arquitetura do projeto e padrões de segurança estabelecidos.
```

### Performance de Database

```
Investigar lentidão em queries de relatórios financeiros:

**Problema:**
- Endpoint /api/reports/financial demora 15+ segundos
- Query complexa com múltiplas JOINs
- Timeout em produção

**Contexto Técnico:**
- PostgreSQL com ~100k pedidos
- SQLAlchemy ORM com relacionamentos
- Relatório mensal de vendas por produto/categoria

**Query Problemática:**
[colar query SQL ou código SQLAlchemy]

**Análise Requerida:**
1. Plano de execução da query (EXPLAIN ANALYZE)
2. Índices necessários
3. Otimização de JOINs
4. Possibilidade de materialização
5. Cache de resultados
6. Paginação de dados

Mantenha consistência com padrões de Repository do projeto.
```

## Prompts para Refatoração

### Modernização de Componente Legacy

```
Refatorar componente ProductList para padrões modernos do Mestres do Café:

**Código Atual:**
[colar componente legacy]

**Objetivos da Refatoração:**
1. Migrar para TypeScript rigoroso
2. Implementar hooks modernos (useQuery, useMemo)
3. Adicionar error boundaries
4. Otimizar performance (virtualização)
5. Melhorar acessibilidade
6. Implementar testes unitários

**Padrões do Projeto:**
- Componentes funcionais com hooks
- Props interfaces explícitas
- Error handling consistente
- Tailwind CSS para styling
- React Query para estado servidor

Mantenha funcionalidade existente e melhore UX/performance.
```

### Reestruturação de Serviço Backend

```
Refatorar ProductService para melhor aderência à Clean Architecture:

**Código Atual:**
[colar código do serviço]

**Problemas Identificados:**
- Lógica de negócio misturada com acesso a dados
- Dependências diretas do SQLAlchemy
- Falta de injeção de dependência
- Testes difíceis de escrever

**Refatoração Esperada:**
1. Separar Repository pattern
2. Implementar interfaces/abstrações
3. Injeção de dependência
4. Validações de negócio centralizadas
5. Error handling estruturado
6. Testes unitários com mocks

Siga padrões DDD e Clean Architecture estabelecidos no projeto.
```

## Prompts para Arquitetura

### Decisão Arquitetural

```
Avaliar implementação de Event Sourcing para auditoria no Mestres do Café:

**Contexto:**
- Sistema enterprise com necessidades de compliance
- Auditoria completa de mudanças em pedidos/pagamentos
- Arquitetura atual: Clean Architecture + DDD

**Considerações:**
1. Complexidade vs benefícios
2. Impacto na performance
3. Compatibilidade com stack atual (Flask + PostgreSQL)
4. Curva de aprendizado da equipe
5. Alternativas (audit logs, triggers DB)

**Análise Requerida:**
- Prós e contras detalhados
- Estratégia de implementação incremental
- Impactos na arquitetura existente
- Estimativa de esforço
- Recomendação final

Considere contexto enterprise e padrões já estabelecidos.
```

### Design de Nova Feature

```
Projetar arquitetura para sistema de notificações no Mestres do Café:

**Requisitos:**
- Notificações em tempo real (pedidos, promoções)
- Múltiplos canais (email, push, in-app)
- Preferências de usuário
- Templates personalizáveis
- Métricas de entrega

**Restrições:**
- Integrar com arquitetura Clean existente
- Usar stack atual (Flask + React + PostgreSQL)
- Considerar escala enterprise
- Manter performance

**Design Esperado:**
1. Modelos de domínio (DDD)
2. Serviços e interfaces
3. Integração com frontend
4. Estratégia de delivery
5. Monitoramento e métricas

Proponha solução alinhada com padrões arquiteturais do projeto.
```

## Prompts para Testes

### Estratégia de Testes

```
Desenvolver estratégia de testes para módulo de pagamentos:

**Contexto:**
- Módulo crítico com integrações externas
- Gateways: Stripe, PayPal, PIX
- Fluxos complexos de autorização/captura

**Tipos de Teste Necessários:**
1. Unitários (lógica de negócio)
2. Integração (APIs externas)
3. E2E (fluxos completos)
4. Performance (carga)
5. Segurança (vulnerabilidades)

**Implementação:**
- Mocks para gateways externos
- Fixtures para cenários diversos
- Testes de falha e recovery
- Validação de compliance PCI

Siga padrões de teste estabelecidos no projeto (pytest + Jest).
```

## Prompts para Documentação

### Documentação de API

```
Gerar documentação OpenAPI para endpoints de produtos:

**Contexto:**
- APIs REST Flask com validação Pydantic
- Autenticação JWT
- Paginação e filtros

**Endpoints:**
- GET /api/products (listagem com filtros)
- GET /api/products/{id} (detalhes)
- POST /api/products (criação - admin)
- PUT /api/products/{id} (atualização - admin)
- DELETE /api/products/{id} (remoção - admin)

**Documentação Necessária:**
1. Schemas de request/response
2. Códigos de status e erros
3. Exemplos de uso
4. Autenticação requerida
5. Rate limiting

Siga padrões de documentação API do projeto.
```

---

**Dica**: Sempre forneça contexto específico do projeto Mestres do Café para obter sugestões mais precisas e alinhadas com a arquitetura estabelecida.

