# Guia de Ferramentas MCP Personalizadas - Mestres do Café

## 📋 Visão Geral

Este guia apresenta todas as ferramentas, recursos e parâmetros personalizados disponíveis nos servidores MCP configurados para o projeto Mestres do Café Enterprise.

## 🔧 Servidores MCP Configurados

### 1. **Filesystem Server** - Operações de Arquivos

#### 🛠️ Ferramentas Básicas
- `read_file` - Ler arquivos do projeto
- `write_file` - Escrever arquivos
- `create_directory` - Criar diretórios
- `list_directory` - Listar conteúdo de diretórios
- `search_files` - Buscar arquivos por padrão
- `move_file` - Mover/renomear arquivos

#### 🎯 Ferramentas Personalizadas
- **`find_react_components`** - Encontrar componentes React
  ```json
  {
    "searchPaths": ["apps/web/src/components", "packages/ui/src/components"],
    "fileExtensions": [".tsx", ".jsx"],
    "includeTests": true
  }
  ```

- **`find_api_routes`** - Encontrar rotas da API Flask
  ```json
  {
    "searchPaths": ["apps/api/src/controllers/routes"],
    "fileExtensions": [".py"],
    "includeDocstrings": true
  }
  ```

- **`find_database_models`** - Encontrar modelos do banco
  ```json
  {
    "searchPaths": ["apps/api/src/models"],
    "fileExtensions": [".py"],
    "includeRelationships": true
  }
  ```

- **`scan_project_structure`** - Análise arquitetural
  ```json
  {
    "includePaths": ["apps", "packages", "tests"],
    "excludePatterns": ["node_modules", "*.log", "*.env*"]
  }
  ```

#### 📁 Recursos Organizados
- **`project_files`** - Arquivos categorizados
  - `components`: Componentes React
  - `pages`: Páginas da aplicação  
  - `api_routes`: Rotas da API
  - `models`: Modelos do banco
  - `services`: Serviços de negócio
  - `tests`: Arquivos de teste

- **`documentation`** - Documentação do projeto
  - Arquivos Markdown
  - READMEs
  - Documentação técnica

### 2. **PostgreSQL Server** - Banco de Dados

#### 🛠️ Ferramentas Básicas
- `query` - Executar consultas SQL
- `list_tables` - Listar tabelas
- `describe_table` - Descrever estrutura de tabela
- `list_schemas` - Listar schemas

#### 📊 Consultas Pré-definidas
- **`get_product_analytics`** - Análise de produtos
  ```sql
  SELECT p.name, p.price, COUNT(oi.id) as sales_count, 
         SUM(oi.quantity * oi.price) as total_revenue 
  FROM products p 
  LEFT JOIN order_items oi ON p.id = oi.product_id 
  GROUP BY p.id ORDER BY total_revenue DESC LIMIT 10
  ```

- **`get_customer_segments`** - Segmentação de clientes
  ```sql
  SELECT customer_id, SUM(total_amount) as total_spent,
         COUNT(*) as order_count,
         CASE 
           WHEN SUM(total_amount) > 1000 THEN 'Premium'
           WHEN SUM(total_amount) > 500 THEN 'Regular'
           ELSE 'Basic'
         END as segment
  FROM orders GROUP BY customer_id
  ```

- **`get_inventory_status`** - Status do estoque
  ```sql
  SELECT p.name, s.current_stock, s.min_stock, s.max_stock,
         CASE 
           WHEN s.current_stock <= s.min_stock THEN 'LOW'
           WHEN s.current_stock >= s.max_stock THEN 'HIGH'
           ELSE 'OK'
         END as status
  FROM products p 
  JOIN stock s ON p.id = s.product_id
  ```

- **`get_sales_trends`** - Tendências de vendas
  ```sql
  SELECT DATE_TRUNC('month', created_at) as month,
         COUNT(*) as order_count,
         SUM(total_amount) as total_revenue
  FROM orders 
  WHERE created_at >= $1 
  GROUP BY month ORDER BY month
  ```

#### ☕ Regras de Negócio Específicas
- **Níveis de Torra**: Light, Medium, Dark, Extra Dark
- **Países de Origem**: Brasil, Colômbia, Etiópia, Guatemala, Jamaica
- **Métodos de Processamento**: Washed, Natural, Honey, Pulped Natural
- **Tamanhos de Moagem**: Whole Bean, Coarse, Medium, Fine, Extra Fine

### 3. **Sequential Thinking Server** - Resolução de Problemas

#### 🧠 Padrões de Pensamento
- **`coffee_business_analysis`** - Análise de negócio de café
  1. Analisar requisitos do negócio
  2. Considerar sazonalidade
  3. Avaliar impacto no estoque
  4. Verificar regulamentações
  5. Analisar experiência do cliente
  6. Sintetizar solução

- **`ecommerce_feature_design`** - Design de features
  1. Identificar necessidades do usuário
  2. Mapear jornada do cliente
  3. Projetar arquitetura
  4. Considerar integrações
  5. Planejar testes
  6. Definir métricas

- **`performance_troubleshooting`** - Resolução de performance
  1. Identificar sintomas
  2. Coletar métricas
  3. Analisar gargalos
  4. Priorizar otimizações
  5. Implementar melhorias
  6. Validar resultados

#### 📋 Templates de Contexto
- **`react_component_review`** - Revisão de componentes
- **`api_endpoint_design`** - Design de endpoints
- **`database_modeling`** - Modelagem de dados

### 4. **Mestres Café Business Server** - Regras de Negócio

#### ☕ Ferramentas Específicas do Café

- **`calculate_roast_profile`** - Cálculo de perfil de torra
  ```javascript
  // Entrada
  {
    "green_weight": 1000,
    "roast_level": "Medium",
    "bean_origin": "Brazil",
    "moisture_content": 12
  }
  
  // Saída
  {
    "roasted_weight": 840,
    "roast_time": 14,
    "temperature_profile": "215°C",
    "loss_percentage": "16.0%"
  }
  ```

- **`optimize_inventory`** - Otimização de estoque
  ```javascript
  // Entrada
  {
    "product_id": "cafe-premium-001",
    "current_stock": 150,
    "season": "winter"
  }
  
  // Saída
  {
    "recommended_stock": 300,
    "reorder_point": 100,
    "status": "OK"
  }
  ```

- **`calculate_pricing`** - Cálculo de preços
  ```javascript
  // Entrada
  {
    "cost_price": 25.00,
    "margin_target": 40,
    "competitor_prices": [35.00, 38.00, 40.00]
  }
  
  // Saída
  {
    "suggested_price": 35.00,
    "competitiveness_score": 95,
    "position": "Competitivo"
  }
  ```

- **`validate_coffee_specs`** - Validação de qualidade
  ```javascript
  // Entrada
  {
    "cupping_score": 85,
    "bean_size": "17",
    "defect_count": 3,
    "moisture_level": 11.5
  }
  
  // Saída
  {
    "quality_grade": "Specialty",
    "price_adjustment": "20.0%",
    "certification_eligible": true
  }
  ```

- **`calculate_shipping_cost`** - Cálculo de frete
  ```javascript
  // Entrada
  {
    "origin_cep": "01310-100",
    "destination_cep": "20040-020",
    "weight": 2.5
  }
  
  // Saída
  {
    "estimated_cost": "R$ 21.25",
    "estimated_delivery_time": "5-7 dias úteis"
  }
  ```

- **`generate_business_report`** - Relatórios de negócio
  ```javascript
  // Entrada
  {
    "report_type": "sales",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
  
  // Saída
  {
    "total_sales": "R$ 125.450,00",
    "orders_count": 342,
    "avg_order_value": "R$ 366,81"
  }
  ```

## 🚀 Como Usar

### 1. **Ativação dos Servidores**
```bash
# Reinicie o VS Code/Cursor
# Abra Command Palette (Cmd+Shift+P)
# Digite: "Kilo: Enable MCP"
```

### 2. **Verificação de Status**
```bash
# Command Palette
# Digite: "Kilo: Show MCP Status"
```

### 3. **Uso das Ferramentas**

#### No Kilo Code:
```
"Encontre todos os componentes React que usam hooks"
"Otimize o estoque do produto cafe-premium-001 para o inverno"
"Calcule o perfil de torra para 2kg de café brasileiro nível Medium"
"Gere um relatório de vendas do último mês"
```

#### Através de Comandos:
```bash
# Testar servidor de filesystem
npx @modelcontextprotocol/server-filesystem /projeto/path

# Testar servidor de PostgreSQL
npx @modelcontextprotocol/server-postgres postgresql://localhost:5432/db

# Testar servidor customizado
node tools/mcp/mestres-cafe-business-server.js
```

### 4. **Comandos Personalizados**

```bash
# Gerar documentação da API
make generate-docs

# Executar testes completos
make test-all

# Análise de qualidade
make lint && make type-check

# Verificação de segurança
make security-check
```

## 🔧 Configuração Avançada

### Adicionando Novas Ferramentas

1. **Edite `.kilocode/mcp.json`**
2. **Adicione na seção `customTools`**:
   ```json
   "nova_ferramenta": {
     "description": "Descrição da ferramenta",
     "parameters": ["param1", "param2"],
     "outputs": ["output1", "output2"]
   }
   ```

### Personalizando Consultas SQL

1. **Edite a seção `customQueries`**:
   ```json
   "nova_consulta": {
     "description": "Descrição da consulta",
     "query": "SELECT * FROM tabela WHERE condicao = $1",
     "parameters": ["parametro"]
   }
   ```

### Criando Padrões de Pensamento

1. **Edite a seção `thinkingPatterns`**:
   ```json
   "novo_padrao": {
     "description": "Descrição do padrão",
     "steps": [
       "Passo 1",
       "Passo 2",
       "Passo 3"
     ]
   }
   ```

## 📊 Métricas e Monitoramento

### KPIs Disponíveis
- **Revenue**: Receita total
- **Orders**: Número de pedidos
- **Customers**: Clientes únicos
- **Inventory Turnover**: Giro de estoque
- **Customer LTV**: Valor vitalício do cliente

### Relatórios Automáticos
- **Sales**: Relatório de vendas
- **Inventory**: Status do estoque
- **Quality**: Métricas de qualidade
- **Financial**: Relatório financeiro

## 🔐 Segurança

### Caminhos Protegidos
- `.env` e `.env.local` - Variáveis de ambiente
- `node_modules` - Dependências
- `.git` - Repositório Git
- `__pycache__` - Cache Python

### Permissões
- **Read Only**: Leitura de arquivos de configuração
- **Write Access**: Escrita em diretórios específicos
- **Query Access**: Consultas controladas ao banco

## 🐛 Troubleshooting

### Problemas Comuns

1. **Servidores não aparecem**
   - Reinicie o VS Code/Cursor
   - Verifique se o PATH inclui `~/.npm-global/bin`
   - Execute: `source ~/.zshrc`

2. **Erro de permissão**
   - Verifique configurações npm: `npm config get prefix`
   - Deve retornar: `/Users/usuario/.npm-global`

3. **Banco de dados não conecta**
   - Verifique se PostgreSQL está rodando
   - Confirme string de conexão
   - Teste conexão manual

### Logs de Debug
```bash
# Logs do VS Code
# Help > Toggle Developer Tools > Console

# Logs do servidor
tail -f ~/.npm-global/lib/node_modules/@modelcontextprotocol/*/logs/*
```

## 📚 Exemplos Práticos

### Exemplo 1: Análise de Vendas
```
"Analise as vendas do café premium no último trimestre e sugira otimizações de estoque"
```

### Exemplo 2: Desenvolvimento de Feature
```
"Implemente um sistema de avaliação de produtos seguindo os padrões do projeto"
```

### Exemplo 3: Otimização de Performance
```
"Identifique gargalos na API de produtos e sugira melhorias"
```

### Exemplo 4: Cálculo de Torra
```
"Calcule o perfil de torra para 5kg de café colombiano nível Dark com 11% de umidade"
```

## 🎯 Próximos Passos

1. **Teste todas as ferramentas** configuradas
2. **Personalize consultas** para suas necessidades
3. **Crie novos padrões** de pensamento
4. **Monitore performance** dos servidores
5. **Adicione novas ferramentas** conforme necessário

---

**Documentação criada para o projeto Mestres do Café Enterprise**  
**Versão 1.0 - Janeiro 2024** 