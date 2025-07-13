# Mestres do Café - Enterprise API

Sistema completo de e-commerce e ERP para torrefação artesanal com funcionalidades avançadas de gestão empresarial.

## 🚀 Funcionalidades

### 🛒 E-commerce Core
- **Produtos**: Catálogo completo com variações, estoque e preços
- **Pedidos**: Gestão completa do ciclo de vendas
- **Pagamentos**: Integração com múltiplos métodos de pagamento
- **Clientes**: CRM completo com histórico e preferências
- **Carrinho**: Carrinho de compras com persistência
- **Cupons**: Sistema avançado de descontos e promoções

### 🎯 Marketing & Vendas
- **Leads**: Gestão de prospects e funil de vendas
- **Newsletter**: Sistema de email marketing
- **Blog**: Plataforma de conteúdo integrada
- **Gamificação**: Sistema de pontos, badges e recompensas
- **Notificações**: Sistema de comunicação multicanal

### 💼 Gestão Empresarial
- **Financeiro**: Controle de receitas, despesas e fluxo de caixa
- **RH**: Gestão de funcionários, folha de pagamento e benefícios
- **Mídia**: Gerenciamento de arquivos e assets
- **Relatórios**: Dashboards e análises empresariais

## 🏗️ Arquitetura

### Stack Tecnológico
- **Backend**: Flask + SQLAlchemy + PostgreSQL
- **ORM**: SQLAlchemy com modelos relacionais
- **Database**: PostgreSQL com schema otimizado
- **API**: RESTful com Blueprint modular
- **Autenticação**: JWT tokens

### Estrutura de Diretórios
```
apps/api/src/
├── models/           # Modelos SQLAlchemy
├── controllers/      # Controladores e rotas
├── database.py      # Configuração do banco
├── app.py           # Aplicação Flask principal
└── config.py        # Configurações

scripts/
└── migrate_database.py  # Script de migração

models.psql          # Schema PostgreSQL completo
```

## 📦 Instalação

### Pré-requisitos
- Python 3.8+
- PostgreSQL 12+
- pip

### Configuração do Ambiente
1. Clone o repositório
2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute a migração do banco:
```bash
python scripts/migrate_database.py
```

5. Inicie o servidor:
```bash
python -m apps.api.src.app
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Banco de Dados
DATABASE_URL=postgresql://user:pass@localhost:5432/mestres_cafe_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mestres_cafe_db
DB_USER=username
DB_PASSWORD=password

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key
API_PORT=5001

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

## 📚 API Documentation

### Endpoints Principais

#### 🔐 Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/refresh` - Renovar token JWT
- `POST /api/auth/logout` - Logout do usuário

#### 🛍️ Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Obter produto específico
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

#### 👥 Clientes
- `GET /api/customers` - Listar clientes
- `GET /api/customers/:id` - Obter cliente específico
- `POST /api/customers` - Criar cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `GET /api/customers/:id/orders` - Histórico de pedidos

#### 📦 Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Obter pedido específico
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id/status` - Atualizar status
- `GET /api/orders/:id/tracking` - Rastreamento

#### 💳 Pagamentos
- `GET /api/payments` - Listar pagamentos
- `POST /api/payments` - Processar pagamento
- `GET /api/payments/:id` - Status do pagamento
- `POST /api/payments/:id/refund` - Estornar pagamento

#### 🎟️ Cupons
- `GET /api/coupons` - Listar cupons
- `POST /api/coupons` - Criar cupom
- `POST /api/coupons/validate` - Validar cupom
- `GET /api/coupons/:code` - Obter cupom por código

#### 📊 Leads
- `GET /api/leads` - Listar leads
- `POST /api/leads` - Criar lead
- `PUT /api/leads/:id` - Atualizar lead
- `POST /api/leads/:id/convert` - Converter em cliente

#### 🎮 Gamificação
- `GET /api/gamification/profile/:user_id` - Perfil do usuário
- `POST /api/gamification/points` - Adicionar pontos
- `GET /api/gamification/badges` - Listar badges
- `POST /api/gamification/achievements` - Registrar conquista

#### 📝 Blog
- `GET /api/blog/posts` - Listar posts
- `GET /api/blog/posts/:id` - Obter post específico
- `POST /api/blog/posts` - Criar post
- `PUT /api/blog/posts/:id` - Atualizar post

#### 📧 Newsletter
- `GET /api/newsletter/subscribers` - Listar inscritos
- `POST /api/newsletter/subscribe` - Inscrever email
- `POST /api/newsletter/campaigns` - Criar campanha
- `POST /api/newsletter/send` - Enviar campanha

#### 🔔 Notificações
- `GET /api/notifications` - Listar notificações
- `POST /api/notifications` - Criar notificação
- `PUT /api/notifications/:id/read` - Marcar como lida
- `GET /api/notifications/unread` - Não lidas

#### 📁 Mídia
- `GET /api/media/files` - Listar arquivos
- `POST /api/media/upload` - Upload de arquivo
- `GET /api/media/files/:id` - Obter arquivo
- `DELETE /api/media/files/:id` - Deletar arquivo

#### 💰 Financeiro
- `GET /api/financial/accounts` - Contas financeiras
- `GET /api/financial/transactions` - Transações
- `POST /api/financial/transactions` - Nova transação
- `GET /api/financial/reports` - Relatórios

#### 👨‍💼 RH
- `GET /api/hr/employees` - Listar funcionários
- `POST /api/hr/employees` - Criar funcionário
- `GET /api/hr/payroll` - Folha de pagamento
- `POST /api/hr/payroll` - Processar pagamento

### Parâmetros de Consulta Comuns
- `page` - Número da página (padrão: 1)
- `per_page` - Items por página (padrão: 10)
- `search` - Busca por texto
- `sort` - Campo para ordenação
- `order` - Direção da ordenação (asc/desc)

### Códigos de Status HTTP
- `200` - Sucesso
- `201` - Criado
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `500` - Erro interno

## 🗄️ Banco de Dados

### Principais Tabelas
- `users` - Usuários do sistema
- `customers` - Clientes
- `products` - Produtos
- `orders` - Pedidos
- `payments` - Pagamentos
- `coupons` - Cupons de desconto
- `leads` - Leads de vendas
- `blog_posts` - Posts do blog
- `newsletter_subscribers` - Inscritos newsletter
- `notifications` - Notificações
- `media_files` - Arquivos de mídia
- `financial_accounts` - Contas financeiras
- `employees` - Funcionários

### Relacionamentos
- Cliente → Pedidos (1:N)
- Pedido → Items (1:N)
- Produto → Variações (1:N)
- Usuário → Gamificação (1:1)
- Funcionário → Folha de Pagamento (1:N)

## 🚀 Deployment

### Desenvolvimento
```bash
python -m apps.api.src.app
```

### Produção
```bash
gunicorn --bind 0.0.0.0:5001 apps.api.src.app:app
```

### Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "apps.api.src.app:app"]
```

## 🔍 Monitoramento

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Logs
- Logs da aplicação em `logs/app.log`
- Logs de erro em `logs/error.log`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para dúvidas e suporte:
- Email: suporte@mestresdocafe.com.br
- Documentação: https://docs.mestresdocafe.com.br
- Issues: https://github.com/mestresdocafe/enterprise/issues

---

**Mestres do Café Enterprise** - Sistema completo de e-commerce e ERP
