# 🗄️ Setup do Banco de Dados - Passo a Passo

## Opção 1: Criação Automática (Recomendado para Desenvolvimento)

O sistema cria as tabelas automaticamente quando você iniciar pela primeira vez:

```bash
cd apps/api

# 1. Criar arquivo .env (se ainda não existe)
cp .env.example .env

# 2. Editar .env e configurar (opcional - SQLite funciona sem configuração)
# Para desenvolvimento, pode deixar tudo comentado que usará SQLite

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Iniciar aplicação (cria tabelas automaticamente)
python src/app.py
```

As tabelas serão criadas automaticamente no SQLite (`mestres_cafe_dev.db`).

---

## Opção 2: PostgreSQL Local

Se preferir usar PostgreSQL:

```bash
# 1. Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Criar banco de dados
sudo -u postgres psql
CREATE DATABASE mestres_cafe;
CREATE USER mestres_user WITH PASSWORD 'senha123';
GRANT ALL PRIVILEGES ON DATABASE mestres_cafe TO mestres_user;
\q

# 3. Configurar .env
echo "DATABASE_URL=postgresql://mestres_user:senha123@localhost:5432/mestres_cafe" >> .env

# 4. Executar script de inicialização
python init_database.py
```

---

## Opção 3: Neon Database (Cloud - Recomendado para Produção)

```bash
# 1. Criar conta em https://neon.tech
# 2. Criar projeto
# 3. Copiar connection string

# 4. Configurar .env
echo "NEON_DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" >> .env

# 5. Deploy
# As tabelas serão criadas automaticamente no primeiro deploy
```

---

## ✅ Verificar se Funcionou

```bash
# Testar health do banco
curl http://localhost:5001/api/health

# Deve retornar:
# {
#   "status": "healthy",
#   "database": "PostgreSQL"  # ou "SQLite"
# }
```

---

## 📋 Lista de Tabelas Criadas

### Auth & Users (2 tabelas)
- `users`
- `user_sessions`

### Blog (2 tabelas)
- `blog_posts`
- `blog_comments`

### Gamificação (4 tabelas)
- `gamification_levels`
- `user_points`
- `rewards`
- `reward_redemptions`

### Newsletter (4 tabelas)
- `newsletter_subscribers`
- `newsletter_templates`
- `newsletter_campaigns`
- `campaigns`

### RH (7 tabelas)
- `departments`
- `positions`
- `employees`
- `time_cards`
- `payrolls`
- `benefits`
- `employee_benefits`

### Multi-tenancy (3 tabelas)
- `tenants`
- `tenant_subscriptions`
- `tenant_settings`

### E-commerce (20+ tabelas)
- `products`, `product_categories`, `product_variants`
- `orders`, `order_items`
- `cart`, `cart_items`
- `payments`, `refunds`
- `customers`, `customer_addresses`
- `reviews`, `coupons`
- E muito mais...

**Total: 50+ tabelas**

---

## 🔧 Troubleshooting

### Erro: "No module named 'dotenv'"
```bash
pip install python-dotenv
```

### Erro: "Connection refused"
**PostgreSQL**: Verifique se está rodando: `sudo service postgresql status`

### Erro: "Permission denied"
**SQLite**: Verifique permissões do diretório: `chmod 755 apps/api`

### Tabelas não foram criadas
Execute manualmente:
```python
from src.database import db, init_db
from src.app import create_app

app = create_app()
with app.app_context():
    db.create_all()
```

---

## 📝 Notas Importantes

- **Desenvolvimento**: SQLite é suficiente e funciona out-of-the-box
- **Produção**: Use PostgreSQL (Neon, Render, AWS RDS)
- **Migrations**: Sistema usa `db.create_all()` que cria automaticamente
- **Dados de Teste**: Execute `python insert_sample_products.py` para popular

---

**Pronto!** Seu banco de dados está configurado e pronto para uso.
