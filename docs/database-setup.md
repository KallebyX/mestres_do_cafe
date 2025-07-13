# 🗄️ Configuração do Banco de Dados - Mestres do Café

## 📋 Visão Geral

O sistema Mestres do Café foi projetado com portabilidade de banco de dados em mente:

- **Desenvolvimento**: SQLite (simples, sem instalação)
- **Produção**: PostgreSQL (robusto, escalável)
- **Migrações**: Alembic (versionamento de schema)
- **ORM**: SQLAlchemy (abstração de banco)

## 🚀 Quick Start

### 1. Configuração Inicial (Desenvolvimento)

```bash
# Verificar status do banco
make db-status

# Criar/atualizar schema
alembic upgrade head

# Popular com dados de exemplo
python scripts/seed_simple.py

# Verificar dados
python scripts/test_db.py
```

### 2. Comandos Úteis do Makefile

```bash
make db-status      # Ver status atual do banco
make db-migrate     # Criar nova migração
make db-upgrade     # Aplicar migrações pendentes
make db-downgrade   # Reverter última migração
make db-seed        # Popular com dados de exemplo
make db-reset       # Reset completo (CUIDADO!)
```

## 📁 Estrutura de Arquivos

```
mestres_cafe_enterprise/
├── apps/api/
│   ├── mestres_cafe.db          # Banco SQLite (desenvolvimento)
│   ├── migrations/              # Migrações Alembic
│   │   ├── alembic.ini         # Configuração Alembic
│   │   ├── env.py              # Script de ambiente
│   │   └── versions/           # Arquivos de migração
│   └── src/
│       └── models/             # Modelos SQLAlchemy
├── scripts/
│   ├── seed_simple.py          # Seed básico
│   ├── test_db.py              # Teste de conexão
│   └── test_db_portability.py  # Teste de portabilidade
└── docs/
    └── database-setup.md       # Esta documentação
```

## 🔧 Configuração por Ambiente

### Desenvolvimento (SQLite)

```python
# .env.development
DATABASE_URL=sqlite:///apps/api/mestres_cafe.db
```

### Produção (PostgreSQL)

```python
# .env.production
DATABASE_URL=postgresql://user:password@localhost:5432/mestres_cafe_prod
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mestres_cafe_prod
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

## 📊 Schema do Banco

### Tabelas Principais

1. **users** - Usuários do sistema
   - Administradores
   - Clientes
   - Vendedores

2. **categories** - Categorias de produtos
   - Cafés Especiais
   - Cafés Gourmet
   - Cafés Orgânicos
   - Acessórios
   - Máquinas

3. **products** - Produtos
   - Informações básicas
   - Scores SCA (para cafés)
   - Notas de sabor (JSON)
   - Estoque

4. **orders** - Pedidos
   - Status do pedido
   - Valores e custos
   - Endereço de entrega

5. **reviews** - Avaliações
   - Rating e comentários
   - Verificação de compra
   - Sistema de helpful/not helpful

### Tabelas de Suporte

- **order_items** - Itens dos pedidos
- **cart** / **cart_items** - Carrinho de compras
- **wishlists** / **wishlist_items** - Lista de desejos
- **shipping_addresses** - Endereços de entrega
- **payments** - Pagamentos
- **product_images** - Imagens dos produtos

## 🔄 Migrações com Alembic

### Criar Nova Migração

```bash
# Automática (detecta mudanças nos modelos)
alembic revision --autogenerate -m "Descrição da mudança"

# Manual
alembic revision -m "Descrição da mudança"
```

### Aplicar Migrações

```bash
# Aplicar todas as pendentes
alembic upgrade head

# Aplicar uma específica
alembic upgrade +1

# Ver histórico
alembic history
```

### Reverter Migrações

```bash
# Reverter uma
alembic downgrade -1

# Reverter para versão específica
alembic downgrade 1402e858cf04
```

## 🔍 Verificação e Testes

### Teste de Conexão

```bash
python scripts/test_db.py
```

Saída esperada:
```
🔍 Verificando banco de dados...
✅ Arquivo de banco encontrado
📊 Tabelas encontradas: 63
   - categories: 5 registros
   - products: 7 registros
   - users: 2 registros
   - orders: 1 registros
   - reviews: 7 registros
```

### Teste de Portabilidade

```bash
python scripts/test_db_portability.py
```

Verifica:
- ✅ Consultas básicas
- ✅ JOINs e agregações
- ✅ Subconsultas
- ✅ Campos JSON
- ✅ Compatibilidade SQL

## 🚀 Migração SQLite → PostgreSQL

### Opção 1: pgloader (Recomendado)

```bash
# Instalar pgloader
brew install pgloader  # macOS
apt-get install pgloader  # Ubuntu

# Migrar dados
pgloader sqlite:///path/to/mestres_cafe.db \
         postgresql://user:pass@localhost/mestres_cafe_prod
```

### Opção 2: Alembic + Scripts

```bash
# 1. Criar banco PostgreSQL
createdb mestres_cafe_prod

# 2. Aplicar schema
DATABASE_URL=postgresql://... alembic upgrade head

# 3. Migrar dados com script customizado
python scripts/migrate_to_postgres.py
```

## ⚠️ Cuidados com Portabilidade

### Evitar no Código

```python
# ❌ EVITAR - Específico SQLite
cursor.execute("PRAGMA foreign_keys = ON")
cursor.execute("SELECT datetime('now')")

# ✅ PREFERIR - Compatível
# Use configurações do SQLAlchemy
# Use func.now() ou datetime.now()
```

### Usar com Cuidado

1. **Concatenação de strings**
   - SQLite: `||`
   - PostgreSQL: `||` ou `CONCAT()`
   
2. **Campos JSON**
   - SQLite: TEXT com JSON
   - PostgreSQL: Tipo JSON nativo

3. **Auto-increment**
   - SQLite: AUTOINCREMENT
   - PostgreSQL: SERIAL ou IDENTITY

## 📝 Dados de Acesso Padrão

### Usuário Admin
- Email: `admin@mestrescafe.com`
- Senha: `admin123`

### Usuários de Teste (após seed)
- Cliente 1: `cliente1@example.com` / `senha123`
- Cliente 2: `cliente2@example.com` / `senha123`
- Vendedor: `vendedor@mestrescafe.com` / `vendedor123`

## 🛠️ Troubleshooting

### Erro: "No such table"
```bash
# Verificar migrações
alembic current

# Aplicar se necessário
alembic upgrade head
```

### Erro: "Database is locked" (SQLite)
- Fechar outras conexões
- Verificar processos: `lsof | grep mestres_cafe.db`

### Erro: "psycopg2 not installed"
```bash
pip install psycopg2-binary
```

### Reset Completo
```bash
# CUIDADO: Remove todos os dados!
rm apps/api/mestres_cafe.db
alembic upgrade head
python scripts/seed_simple.py
```

## 📚 Referências

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [PostgreSQL vs SQLite](https://www.postgresql.org/docs/current/different-reqs.html)
- [pgloader Documentation](https://pgloader.io/)

---

**Última atualização**: Janeiro 2025
**Versão do Schema**: 1402e858cf04 (Alembic)