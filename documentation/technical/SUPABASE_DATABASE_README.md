# 🗄️ **BANCO DE DADOS SUPABASE - MESTRES DO CAFÉ**

> **Documentação completa da estrutura do banco PostgreSQL no Supabase**

## 📊 **RESUMO EXECUTIVO**

**Exportado em:** 30/06/2025 às 07:43:50  
**URL Supabase:** https://uicpqeruwwbnqbykymaj.supabase.co  
**Total de Tabelas:** 8 (7 funcionais + 1 inexistente)  
**Total de Registros:** 17 registros  

### **✅ Tabelas Ativas**
- `users` (3 registros) - Usuários e perfis
- `products` (8 registros) - Catálogo de cafés especiais  
- `blog_posts` (6 registros) - Sistema de blog
- `orders` (0 registros) - Pedidos realizados
- `order_items` (0 registros) - Itens dos pedidos
- `cart_items` (0 registros) - Carrinho de compras
- `points_history` (0 registros) - Histórico de pontuação

### **❌ Tabelas com Problemas**
- `user_stats` - **NÃO EXISTE** (relation "public.user_stats" does not exist)

---

## 📋 **ESTRUTURA DAS TABELAS**

## 1. 👥 **TABELA: `users`**

### **Descrição**
Tabela principal de usuários com sistema de gamificação integrado.

### **Estrutura de Campos**
```sql
users (3 registros)
├── id                   UUID PRIMARY KEY         # ID único do usuário
├── name                 TEXT NOT NULL           # Nome completo
├── email                TEXT NOT NULL           # Email (único)
├── user_type            TEXT DEFAULT 'cliente_pf' # Tipo: cliente_pf, cliente_pj, admin
├── phone                TEXT                    # Telefone de contato
├── cpf_cnpj            TEXT                    # CPF ou CNPJ
├── address             TEXT                    # Endereço completo
├── city                TEXT                    # Cidade
├── state               TEXT                    # Estado/UF
├── zip_code            TEXT                    # CEP
├── company_name        TEXT                    # Nome da empresa (PJ)
├── company_segment     TEXT                    # Segmento da empresa (PJ)
├── points              INTEGER DEFAULT 100     # Pontos de gamificação
├── level               TEXT DEFAULT 'Aprendiz do Café' # Nível do usuário
├── role                TEXT DEFAULT 'customer' # Papel: customer, admin, super_admin
├── permissions         TEXT[] DEFAULT ['read'] # Array de permissões
├── total_spent         DECIMAL DEFAULT 0       # Total gasto em compras
├── orders_count        INTEGER DEFAULT 0       # Número de pedidos
├── last_order_date     TIMESTAMP WITH TIME ZONE # Data do último pedido
├── created_at          TIMESTAMP WITH TIME ZONE # Data de criação
├── updated_at          TIMESTAMP WITH TIME ZONE # Última atualização
├── birthday            DATE                    # Data de nascimento
├── last_login          TIMESTAMP WITH TIME ZONE # Último login
├── preferences         JSONB DEFAULT {}        # Preferências do usuário
├── tags                TEXT[]                  # Tags de classificação
├── customer_since      TIMESTAMP WITH TIME ZONE # Cliente desde
└── discount_percentage INTEGER DEFAULT 5       # Percentual de desconto
```

### **Dados Existentes**
1. **Administrador Sistema** (super_admin)
   - Email: admin@mestrescafe.com
   - Role: super_admin
   - Points: 100, Level: "Aprendiz do Café"

2. **Kalleby Evangelho Mota** (customer)  
   - Email: kallebyevangelho03@gmail.com
   - Phone: 55991255935
   - Points: 100, Level: "Aprendiz do Café"

3. **Kalleby** (customer)
   - Email: kallebygamerbrxd@gmail.com  
   - Points: 100, Level: "Aprendiz do Café"

### **Sistema de Gamificação**
- **Pontos Inicial:** 100 pontos para todos
- **Nível Padrão:** "Aprendiz do Café"
- **Desconto Base:** 5% para todos os usuários
- **Customer Since:** 22/06/2025 para todos

---

## 2. ☕ **TABELA: `products`**

### **Descrição**
Catálogo completo de cafés especiais com informações detalhadas.

### **Estrutura de Campos**
```sql
products (8 registros)
├── id                   UUID PRIMARY KEY         # ID único do produto
├── name                 TEXT NOT NULL           # Nome do café
├── description          TEXT                    # Descrição curta
├── detailed_description TEXT                    # Descrição detalhada
├── price                DECIMAL NOT NULL        # Preço atual
├── original_price       DECIMAL                 # Preço original (para desconto)
├── category             TEXT DEFAULT 'cafe'     # Categoria do produto
├── origin               TEXT                    # Origem geográfica
├── roast_level          TEXT DEFAULT 'medium'   # Nível de torra
├── flavor_notes         TEXT[]                  # Array de notas de sabor
├── sca_score           INTEGER DEFAULT 80      # Pontuação SCA (80-100)
├── is_featured         BOOLEAN DEFAULT false   # Produto em destaque
├── is_active           BOOLEAN DEFAULT true    # Produto ativo
├── stock               INTEGER DEFAULT 0       # Estoque disponível
├── images              TEXT[]                  # Array de URLs de imagens
├── weight              TEXT DEFAULT '500g'     # Peso do produto
├── altitude            TEXT                    # Altitude de cultivo
├── process             TEXT                    # Processo de beneficiamento
├── variety             TEXT                    # Variedade do café
├── farm                TEXT                    # Nome da fazenda
├── farmer              TEXT                    # Nome do produtor
├── harvest_year        TEXT                    # Ano da safra
├── certification       TEXT[]                  # Certificações (UTZ, etc)
├── brewing_methods     TEXT[]                  # Métodos de preparo recomendados
├── tasting_notes       TEXT                    # Notas de degustação
├── created_at          TIMESTAMP WITH TIME ZONE # Data de criação
├── updated_at          TIMESTAMP WITH TIME ZONE # Última atualização
└── certifications      TEXT[]                  # Certificações adicionais
```

### **Categorias de Produtos**
- **especiais** (3 produtos) - Cafés especiais premium
- **premium** (2 produtos) - Linha premium exclusiva
- **blends** (1 produto) - Blends especiais
- **espresso** (1 produto) - Específico para espresso
- **decaf** (1 produto) - Descafeinado
- **especial** (1 produto) - Categoria alternativa

### **Níveis de Torra**
- **light** (2 produtos) - Torra clara
- **medium** (4 produtos) - Torra média
- **medium-dark** (1 produto) - Torra média-escura
- **dark** (1 produto) - Torra escura

### **Faixas de Preço**
- **Econômico:** R$ 36,90 - R$ 42,90
- **Médio:** R$ 45,90 - R$ 48,90
- **Premium:** R$ 89,90

### **Produtos em Destaque (is_featured: true)**
1. **Bourbon Amarelo Premium** - R$ 45,90 (SCA 87)
2. **Geisha Especial** - R$ 89,90 (SCA 92)  
3. **Café Bourbon Amarelo Premium** - R$ 45,90 (SCA 86)
4. **Café Geisha Especial** - R$ 89,90 (SCA 92)

### **Estoque Total:** 415 unidades
- Maior estoque: Blend Signature (100 unidades)
- Menor estoque: Geisha Especial (25 unidades)

---

## 3. 📝 **TABELA: `blog_posts`**

### **Descrição**
Sistema de blog com artigos educacionais sobre café.

### **Estrutura de Campos**
```sql
blog_posts (6 registros)
├── id               UUID PRIMARY KEY         # ID único do post
├── title            TEXT NOT NULL           # Título do artigo
├── slug             TEXT UNIQUE NOT NULL    # Slug para URL
├── excerpt          TEXT                    # Resumo do artigo
├── content          TEXT NOT NULL           # Conteúdo completo (Markdown)
├── featured_image   TEXT                    # URL da imagem destacada
├── category         TEXT DEFAULT 'geral'    # Categoria do post
├── tags             TEXT[]                  # Array de tags
├── author_name      TEXT DEFAULT 'Mestres do Café' # Nome do autor
├── status           TEXT DEFAULT 'draft'    # Status: draft, published
├── is_featured      BOOLEAN DEFAULT false   # Post em destaque
├── views_count      INTEGER DEFAULT 0       # Número de visualizações
├── seo_title        TEXT                    # Título para SEO
├── seo_description  TEXT                    # Descrição para SEO
├── published_at     TIMESTAMP WITH TIME ZONE # Data de publicação
├── created_at       TIMESTAMP WITH TIME ZONE # Data de criação
├── updated_at       TIMESTAMP WITH TIME ZONE # Última atualização
├── likes_count      INTEGER DEFAULT 0       # Número de curtidas
└── comments_count   INTEGER DEFAULT 0       # Número de comentários
```

### **Categorias de Posts**
- **Processos** (1 post) - Sobre torra e processamento
- **Educação** (3 posts) - Artigos educacionais
- **Preparo** (1 post) - Métodos de extração  
- **Equipamentos** (1 post) - Sobre moagem
- **Origem** (1 post) - Variedades de café

### **Posts Publicados (status: 'published')**
1. **"Os Segredos da Torra Perfeita"** (Destaque)
   - Categoria: Processos
   - Tags: torra, técnicas, sabor
   - Views: 0

2. **"Café Especial: Do Grão à Xícara"** (Destaque)
   - Categoria: Educação  
   - Tags: café especial, qualidade, origem
   - Views: 0

3. **"Métodos de Extração: Guia Completo"**
   - Categoria: Preparo
   - Tags: métodos, extração, preparo
   - Views: 0

4. **"5 Mitos sobre o Café Especial Desvendados"** (Destaque)
   - Categoria: Educação
   - Views: 342, Likes: 28, Comments: 12

5. **"Guia Completo de Moagem: Do Grosso ao Pó"**
   - Categoria: Equipamentos
   - Views: 156, Likes: 19, Comments: 8

6. **"Catuaí vs Bourbon: Batalha das Variedades"** (Destaque)
   - Categoria: Origem
   - Views: 289, Likes: 34, Comments: 15

### **Estatísticas do Blog**
- **Total de Views:** 787 visualizações
- **Total de Likes:** 81 curtidas  
- **Total de Comments:** 35 comentários
- **Posts em Destaque:** 4 de 6 posts

---

## 4. 🛒 **TABELA: `orders`**

### **Descrição**
Tabela de pedidos realizados pelos clientes.

### **Status:** ⚠️ **VAZIA** (0 registros)

### **Estrutura Esperada**
```sql
orders (0 registros)
├── id               UUID PRIMARY KEY         # ID único do pedido
├── user_id          UUID REFERENCES users(id) # FK para usuário
├── status           TEXT DEFAULT 'pending'   # Status do pedido
├── total_amount     DECIMAL NOT NULL        # Valor total
├── subtotal         DECIMAL NOT NULL        # Subtotal
├── shipping_cost    DECIMAL DEFAULT 0       # Custo do frete
├── discount_amount  DECIMAL DEFAULT 0       # Valor do desconto
├── payment_method   TEXT                    # Método de pagamento
├── payment_status   TEXT DEFAULT 'pending'  # Status do pagamento
├── shipping_address JSONB                   # Endereço de entrega
├── tracking_code    TEXT                    # Código de rastreamento
├── notes            TEXT                    # Observações
├── delivered_at     TIMESTAMP WITH TIME ZONE # Data de entrega
├── created_at       TIMESTAMP WITH TIME ZONE # Data de criação
└── updated_at       TIMESTAMP WITH TIME ZONE # Última atualização
```

---

## 5. 📦 **TABELA: `order_items`**

### **Descrição**
Itens individuais de cada pedido.

### **Status:** ⚠️ **VAZIA** (0 registros)

### **Estrutura Esperada**
```sql
order_items (0 registros)
├── id               UUID PRIMARY KEY         # ID único do item
├── order_id         UUID REFERENCES orders(id) # FK para pedido
├── product_id       UUID REFERENCES products(id) # FK para produto
├── quantity         INTEGER NOT NULL        # Quantidade
├── unit_price       DECIMAL NOT NULL        # Preço unitário
├── total_price      DECIMAL NOT NULL        # Preço total do item
├── product_snapshot JSONB                   # Snapshot do produto
└── created_at       TIMESTAMP WITH TIME ZONE # Data de criação
```

---

## 6. 🛍️ **TABELA: `cart_items`**

### **Descrição**
Itens no carrinho de compras dos usuários.

### **Status:** ⚠️ **VAZIA** (0 registros)

### **Estrutura Esperada**
```sql
cart_items (0 registros)
├── id          UUID PRIMARY KEY         # ID único do item
├── user_id     UUID REFERENCES users(id) # FK para usuário
├── product_id  UUID REFERENCES products(id) # FK para produto
├── quantity    INTEGER NOT NULL DEFAULT 1 # Quantidade
├── created_at  TIMESTAMP WITH TIME ZONE # Data de criação
├── updated_at  TIMESTAMP WITH TIME ZONE # Última atualização
└── UNIQUE(user_id, product_id)         # Constraint única
```

---

## 7. 🏆 **TABELA: `points_history`**

### **Descrição**
Histórico de pontuação do sistema de gamificação.

### **Status:** ⚠️ **VAZIA** (0 registros)

### **Estrutura Esperada**
```sql
points_history (0 registros)
├── id         UUID PRIMARY KEY         # ID único do registro
├── user_id    UUID REFERENCES users(id) # FK para usuário
├── points     INTEGER NOT NULL        # Pontos ganhos/perdidos
├── reason     TEXT                    # Motivo da pontuação
├── created_at TIMESTAMP WITH TIME ZONE # Data do evento
└── metadata   JSONB                   # Dados adicionais
```

---

## 8. ❌ **TABELA: `user_stats`**

### **Status:** 🚫 **NÃO EXISTE**

**Erro:** `relation "public.user_stats" does not exist`

### **Ação Necessária**
Esta tabela precisa ser criada se for necessária para o sistema de estatísticas dos usuários.

---

## 🔗 **RELACIONAMENTOS ENTRE TABELAS**

### **Diagrama de Relacionamentos**
```
users (1) ─────── (N) orders
  │                  │
  │                  └── (1) ─────── (N) order_items ─────── (1) products
  │
  ├── (1) ─────── (N) cart_items ─────── (1) products
  │
  └── (1) ─────── (N) points_history
```

### **Chaves Estrangeiras**
- `orders.user_id` → `users.id`
- `order_items.order_id` → `orders.id`
- `order_items.product_id` → `products.id`
- `cart_items.user_id` → `users.id`
- `cart_items.product_id` → `products.id`
- `points_history.user_id` → `users.id`

---

## 📈 **ANÁLISE DE DADOS**

### **Usuários**
- **Total:** 3 usuários cadastrados
- **Roles:** 1 super_admin, 2 customers
- **Pontos Médios:** 100 pontos (todos iguais)
- **Status:** Todos ativos com 5% de desconto

### **Produtos**
- **Total:** 8 produtos ativos
- **Estoque Total:** 415 unidades
- **Valor Médio:** R$ 54,59
- **SCA Médio:** 86,4 pontos
- **Produtos em Destaque:** 50% (4 de 8)

### **Blog**
- **Total:** 6 artigos publicados
- **Engajamento:** 787 views, 81 likes, 35 comments
- **Post Mais Popular:** "Catuaí vs Bourbon" (289 views)
- **Categorias Ativas:** 5 categorias diferentes

### **Sistema de Vendas**
- **Pedidos:** 🚫 Nenhum pedido realizado ainda
- **Carrinho:** 🚫 Nenhum item no carrinho
- **Histórico de Pontos:** 🚫 Nenhuma atividade registrada

---

## 🔐 **CONFIGURAÇÕES DE SEGURANÇA**

### **Row Level Security (RLS)**
O Supabase utiliza políticas RLS para controlar o acesso aos dados:

- **users:** Usuários podem ver/editar apenas seu próprio perfil
- **products:** Produtos ativos são públicos
- **orders:** Usuários veem apenas seus pedidos
- **blog_posts:** Posts publicados são públicos
- **cart_items:** Usuários controlam apenas seu carrinho

### **Permissões por Role**
- **customer:** ['read'] - Acesso básico
- **admin:** ['read', 'write', 'admin'] - Controle administrativo
- **super_admin:** Acesso total ao sistema

---

## 🚀 **STATUS DO SISTEMA**

### **✅ Funcionalidades Ativas**
- Sistema de usuários com gamificação
- Catálogo de produtos completo
- Blog com conteúdo educacional
- Estrutura de e-commerce preparada

### **⚠️ Funcionalidades Pendentes**
- Nenhum pedido foi realizado ainda
- Sistema de carrinho não está sendo usado
- Histórico de pontos está vazio
- Tabela user_stats não existe

### **🎯 Próximos Passos Sugeridos**
1. Criar a tabela `user_stats` se necessária
2. Implementar fluxo de compras para gerar pedidos
3. Ativar sistema de pontuação automática
4. Adicionar mais produtos ao catálogo
5. Implementar sistema de avaliações

---

## 📞 **INFORMAÇÕES TÉCNICAS**

### **Conexão**
- **URL:** https://uicpqeruwwbnqbykymaj.supabase.co
- **Schema:** public
- **Timezone:** UTC
- **Encoding:** UTF-8

### **Backup e Export**
- **Último Export:** 30/06/2025 às 07:43:50
- **Script:** `export-all.js`
- **Comando:** `npm run export:supabase`
- **Arquivo:** `supabase-full-export.json`

### **Monitoramento**
- **Tabelas Monitoradas:** 7 de 8 tabelas ativas
- **Registros Totais:** 17 registros
- **Status Geral:** ✅ Operacional

---

**📊 Banco de dados analisado e documentado completamente!**  
*Última atualização: 30/06/2025* 