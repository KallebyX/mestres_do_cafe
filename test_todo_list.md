# 🧪 Lista de Testes E2E - Mestres do Café

## 📋 Todo List de Testes Completos

### 1. Testes de Cadastro e Autenticação
- [ ] Testar cadastro de Pessoa Física
  - [ ] Acessar página de cadastro
  - [ ] Preencher dados pessoais (nome, CPF, email, senha)
  - [ ] Validar CPF
  - [ ] Confirmar criação da conta
- [ ] Testar cadastro de Pessoa Jurídica  
  - [ ] Acessar página de cadastro
  - [ ] Selecionar tipo "Empresa"
  - [ ] Preencher dados empresariais (razão social, CNPJ, email, senha)
  - [ ] Validar CNPJ
  - [ ] Confirmar criação da conta
- [ ] Testar login com conta PF
- [ ] Testar login com conta PJ
- [ ] Testar logout
- [ ] Testar recuperação de senha

### 2. Testes de Navegação e Catálogo
- [ ] Navegar pela home sem estar logado
- [ ] Visualizar lista de produtos
- [ ] Usar filtros de categoria
- [ ] Usar busca de produtos
- [ ] Visualizar detalhes de um produto
- [ ] Verificar avaliações do produto

### 3. Testes de Carrinho
- [ ] Adicionar produto ao carrinho (logado)
- [ ] Adicionar produto ao carrinho (não logado)
- [ ] Alterar quantidade no carrinho
- [ ] Remover item do carrinho
- [ ] Aplicar cupom de desconto
- [ ] Calcular frete

### 4. Testes de Checkout
- [ ] Preencher endereço de entrega
- [ ] Selecionar método de envio
- [ ] Preencher dados de pagamento
- [ ] Revisar pedido antes de confirmar
- [ ] Confirmar pedido

### 5. Testes de Pagamento
- [ ] Testar pagamento com cartão de crédito (sandbox)
- [ ] Testar pagamento com PIX (sandbox)
- [ ] Testar pagamento com boleto (sandbox)
- [ ] Verificar webhook de confirmação
- [ ] Verificar email de confirmação

### 6. Testes Pós-Venda
- [ ] Verificar pedido no painel do usuário
- [ ] Acompanhar status do pedido
- [ ] Verificar histórico de pedidos
- [ ] Avaliar produto comprado
- [ ] Solicitar suporte

### 7. Testes do Painel Admin
- [ ] Login como administrador
- [ ] Visualizar dashboard com métricas
- [ ] Listar pedidos recentes
- [ ] Atualizar status de pedido
- [ ] Gerenciar estoque de produtos
- [ ] Adicionar novo produto
- [ ] Editar produto existente
- [ ] Gerenciar clientes
- [ ] Visualizar relatórios

### 8. Validações Técnicas
- [ ] Verificar atualização de estoque após venda
- [ ] Validar cálculo de impostos
- [ ] Confirmar integração com Mercado Pago
- [ ] Testar responsividade mobile
- [ ] Verificar performance de carregamento

### 9. Testes de Banco de Dados SQLite
- [ ] Verificar integridade do banco SQLite único
- [ ] Validar funcionamento correto dos UUIDs como TEXT
- [ ] Testar relacionamentos entre tabelas com UUIDs
- [ ] Verificar performance de queries com UUIDs
- [ ] Validar backup e restore do banco SQLite
- [ ] Testar migrações e alterações de schema
- [ ] Verificar segurança dos UUIDs (anti-enumeration)
- [ ] Validar transações e rollbacks
- [ ] Testar concurrent access ao SQLite
- [ ] Verificar otimizações SQLite (WAL, cache, etc.)
- [ ] Validar consistência de dados após operações CRUD

### 10. Testes de Diagnóstico Técnico
- [ ] Analisar possíveis fontes de problemas nos testes E2E
- [ ] Verificar conectividade Frontend → API
- [ ] Verificar estado do banco de dados e dados de teste
- [ ] Implementar logs de diagnóstico
- [ ] Confirmar diagnóstico com o usuário
- [ ] Validar sistema JWT completo
- [ ] Testar inicialização do JWTManager no app.py
- [ ] Confirmar consistência SQLite vs PostgreSQL
- [ ] Verificar configuração de CORS
- [ ] Testar endpoints de health check
- [ ] Validar configurações de ambiente (.env)
- [ ] Verificar logs de erro da aplicação

### 11. Testes Avançados de Funcionalidades
- [ ] Testar sistema de cadastro (Pessoa Física) completo
- [ ] Validar sistema de login com credenciais corretas
- [ ] Testar criação de usuário no banco correto
- [ ] Validar login com credenciais válidas após criação
- [ ] Testar rotas protegidas (carrinho) após login
- [ ] Testar dropdown "Segmento de Atuação"
- [ ] Completar teste de cadastro Pessoa Jurídica
- [ ] Testar sistema completo de preços por peso
- [ ] Validar navegação no catálogo de produtos
- [ ] Testar visualização detalhada de produtos
- [ ] Testar adição de produtos ao carrinho
- [ ] Validar persistência de dados do carrinho
- [ ] Testar remoção de produtos do carrinho
- [ ] Testar incremento/decremento de quantidades
- [ ] Validar cálculo correto de totais do carrinho
- [ ] Testar sistema de autenticação com diferentes roles
- [ ] Validar sistema de notificações do frontend

### 12. Testes de Integração Final
- [ ] Testar atualização manual de quantidades no carrinho
- [ ] Testar processo de checkout completo
- [ ] Testar finalização de pedido
- [ ] Testar visualização do histórico de pedidos
- [ ] Testar gerenciamento de perfil do usuário
- [ ] Testar sistema de logout
- [ ] Testar navegação geral e responsividade
- [ ] Validar remoção de logs de diagnóstico
- [ ] Testar fluxo completo E2E (cadastro → compra → pagamento)
- [ ] Validar integração completa Frontend ↔ Backend ↔ Database
- [ ] Testar recuperação de sessão após reload da página
- [ ] Validar funcionamento em diferentes navegadores
- [ ] Testar comportamento offline/online
- [ ] Validar performance sob carga simulada

### 13. Testes de Migração PostgreSQL
- [ ] Validar instalação e configuração PostgreSQL local
- [ ] Testar conexão com database PostgreSQL
- [ ] Executar migração de dados SQLite → PostgreSQL
- [ ] Validar integridade dos dados migrados
- [ ] Testar UUIDs nativos funcionando corretamente
- [ ] Validar relacionamentos entre tabelas com UUIDs
- [ ] Testar performance PostgreSQL vs SQLite anterior
- [ ] Validar backup e restore PostgreSQL
- [ ] Testar transações e rollbacks
- [ ] Configurar conexões para produção
- [ ] Validar pool de conexões otimizado
- [ ] Testar queries complexas otimizadas para PostgreSQL
- [ ] Verificar extensões PostgreSQL necessárias (uuid-ossp)
- [ ] Validar indexes e otimizações
- [ ] Testar concurrent access e locks

### 14. Testes Pós-Migração Sistema Completo
- [ ] Re-executar todos os testes de autenticação
- [ ] Re-validar sistema de carrinho com PostgreSQL
- [ ] Testar checkout completo com dados reais PostgreSQL
- [ ] Validar persistência de dados em PostgreSQL
- [ ] Testar sistema de pedidos e histórico
- [ ] Re-validar painel administrativo completo
- [ ] Testar relatórios e analytics
- [ ] Validar sistema de produtos e estoque
- [ ] Testar integrações externas (Mercado Pago)
- [ ] Validar sistema de notificações
- [ ] Testar sistema de usuários e permissões
- [ ] Validar cálculos de preços e impostos
- [ ] Testar sistema de cupons e descontos
- [ ] Verificar logs e monitoramento
- [ ] Validar sistema de avaliações e reviews

---

## 🚀 Prompt para Nova Tarefa

```bash
Preciso testar o fluxo completo do e-commerce Mestres do Café seguindo a lista de testes em test_todo_list.md. 

O sistema foi migrado para PostgreSQL único com UUIDs nativos. Executar testes em ordem:

1. TESTES DE MIGRAÇÃO POSTGRESQL (Seção 13):
   - Verificar instalação e configuração PostgreSQL
   - Validar migração de dados SQLite → PostgreSQL
   - Testar UUIDs nativos e relacionamentos
   - Verificar performance e otimizações

2. TESTES PÓS-MIGRAÇÃO (Seção 14):
   - Re-executar todos os testes de sistema
   - Validar funcionalidades com PostgreSQL
   - Verificar integridade dos dados migrados
   - Confirmar performance equivalente ou superior

3. TESTES DE BANCO DE DADOS (Seção 9):
   - Verificar integridade do PostgreSQL
   - Validar funcionamento dos UUIDs nativos
   - Testar relacionamentos e performance

4. TESTES DE DIAGNÓSTICO (Seção 10):
   - Confirmar conectividade Frontend → API → PostgreSQL
   - Validar sistema JWT completo
   - Verificar consistência do banco

5. TESTES BÁSICOS (Seções 1-8):
   - Cadastro PF/PJ com validação
   - Login e autenticação
   - Navegação e catálogo
   - Carrinho e checkout
   - Pagamentos e pós-venda
   - Painel admin

6. TESTES AVANÇADOS (Seção 11):
   - Sistema completo de preços por peso
   - Funcionalidades já validadas anteriormente
   - Novos recursos implementados

7. TESTES DE INTEGRAÇÃO FINAL (Seção 12):
   - Fluxo E2E completo
   - Performance e responsividade
   - Validação final do sistema

O sistema está rodando em:
- Frontend: http://localhost:3000
- API: http://localhost:5001
- Database: PostgreSQL (mestres_cafe_production)

IMPORTANTE: Consultar MIGRATION_POSTGRESQL.md para procedimentos de migração.

Executar cada teste sistematicamente reportando sucesso/falha e documentando problemas.
```