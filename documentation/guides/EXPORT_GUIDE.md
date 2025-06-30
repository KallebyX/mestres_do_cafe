# 📊 **Guia de Export Supabase - Mestres do Café**

> **Script para exportar todas as tabelas do Supabase para arquivo JSON**

## 🎯 **O que o Script Faz**

O `export-all.js` é uma ferramenta que:

1. **Conecta ao Supabase** usando Service Role Key (admin)
2. **Lista automaticamente** todas as tabelas do schema `public`
3. **Exporta todos os dados** de cada tabela
4. **Salva em JSON** com metadados completos
5. **Relatório detalhado** do processo

## 🚀 **Como Usar**

### **1. Configurar Variáveis de Ambiente**

Copie o arquivo de exemplo:
```bash
cp env.example .env
```

As variáveis já estão configuradas no `.env.example`:
```env
# ✅ Configurações Supabase (já preenchidas)
SUPABASE_URL=https://uicpqeruwwbnqbykymaj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpY3BxZXJ1d3dibnFieWt5bWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzODM3NjksImV4cCI6MjA2NTk1OTc2OX0.hn-R8WzjKEqnusblaIWKZjCbm-nDqfBP5VQKymshMsM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpY3BxZXJ1d3dibnFieWt5bWFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM4Mzc2OSwiZXhwIjoyMDY1OTU5NzY5fQ.fDLZ-i1XJL0DGOP9FY2pjiIJSTbFBu7lyu7eoz2ZVtc
```

### **2. Instalar Dependências**

```bash
# Se ainda não instalou
npm install

# Instalar dependência específica (se necessário)
npm install dotenv
```

### **3. Executar Export**

Você tem 3 opções:

#### **Opção A: Script NPM (Recomendado)**
```bash
npm run export:supabase
```

#### **Opção B: Script de Backup Completo**
```bash
npm run backup:full
```

#### **Opção C: Comando Direto**
```bash
node export-all.js
```

## 📁 **Resultado do Export**

### **Arquivo Gerado: `supabase-full-export.json`**

```json
{
  "_metadata": {
    "export_timestamp": "2024-01-20T10:30:45.123Z",
    "export_date": "20/01/2024",
    "export_time": "10:30:45",
    "supabase_url": "https://uicpqeruwwbnqbykymaj.supabase.co",
    "total_tables": 6,
    "successful_exports": 6,
    "failed_exports": 0,
    "total_records": 150,
    "tables_exported": ["users", "products", "orders", "order_items", "blog_posts", "cart_items"]
  },
  "users": [
    { "id": "123", "name": "João", "email": "joao@email.com", ... },
    { "id": "456", "name": "Maria", "email": "maria@email.com", ... }
  ],
  "products": [
    { "id": "prod1", "name": "Café Bourbon", "price": 45.90, ... },
    { "id": "prod2", "name": "Café Geisha", "price": 89.90, ... }
  ],
  "orders": [...],
  "order_items": [...],
  "blog_posts": [...],
  "cart_items": [...]
}
```

## 📊 **Exemplo de Saída no Console**

```bash
🔌 Conectando ao Supabase...
📡 URL: https://uicpqeruwwbnqbykymaj.supabase.co
🚀 Iniciando export completo do Supabase...
==================================================
📋 Listando tabelas do schema public...
📊 Tabelas encontradas: 6
📋 Lista: users, products, orders, order_items, blog_posts, cart_items
==================================================
📦 Exportando tabela: users
✅ users: 25 registros exportados
📦 Exportando tabela: products
✅ products: 12 registros exportados
📦 Exportando tabela: orders
✅ orders: 8 registros exportados
📦 Exportando tabela: order_items
✅ order_items: 15 registros exportados
📦 Exportando tabela: blog_posts
✅ blog_posts: 5 registros exportados
📦 Exportando tabela: cart_items
✅ cart_items: 3 registros exportados
==================================================
🎉 EXPORT CONCLUÍDO COM SUCESSO!
==================================================
📁 Arquivo: supabase-full-export.json
📊 Tabelas exportadas: 6/6
📈 Total de registros: 68
⏰ Data/Hora: 20/01/2024 às 10:30:45
==================================================
Export concluído em supabase-full-export.json
```

## 🔧 **Funcionalidades Avançadas**

### **Fallbacks Inteligentes**

O script possui 3 níveis de fallback:

1. **RPC Function**: Tenta usar função personalizada no Supabase
2. **Information Schema**: Consulta direta ao catálogo do PostgreSQL
3. **Lista Manual**: Usa tabelas conhecidas como fallback

### **Tratamento de Erros**

- ✅ Conexão com timeout
- ✅ Tabelas sem permissão são ignoradas
- ✅ Metadados de erro são registrados
- ✅ Processo continua mesmo com falhas

### **Metadados Completos**

Cada export inclui:
- 📅 Timestamp completo
- 📊 Estatísticas de sucesso/erro
- 📋 Lista de tabelas processadas
- 🔢 Total de registros exportados

## 🛡️ **Segurança**

### **⚠️ Service Role Key**

- A `SUPABASE_SERVICE_ROLE_KEY` tem **acesso total** ao banco
- Use apenas em **scripts locais** ou **servidores seguros**
- **NUNCA** exponha em frontend ou repositórios públicos
- Mantenha o arquivo `.env` no `.gitignore`

### **🔒 Melhores Práticas**

```bash
# ✅ BOM: Arquivo .env local
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui

# ❌ RUIM: Hard-coded no código
const key = "sua_chave_aqui" // NUNCA faça isso!

# ✅ BOM: Variável de ambiente no servidor
export SUPABASE_SERVICE_ROLE_KEY=sua_chave
```

## 🎯 **Casos de Uso**

### **1. Backup Regular**
```bash
# Backup diário
npm run backup:full
```

### **2. Migração de Dados**
```bash
# Export para migração
npm run export:supabase
# Usar JSON para importar em outro sistema
```

### **3. Análise de Dados**
```bash
# Export para análise
npm run export:data
# Carregar JSON em ferramentas de BI
```

### **4. Debug e Desenvolvimento**
```bash
# Snapshot dos dados atuais
node export-all.js
# Analisar estrutura e conteúdo
```

## 🚀 **Scripts NPM Disponíveis**

```bash
npm run export:supabase  # Export simples
npm run export:data      # Alias para export
npm run backup:full      # Backup + mensagem de confirmação
```

## 🔍 **Troubleshooting**

### **Erro: "SUPABASE_SERVICE_ROLE_KEY é obrigatória"**
- Verifique se o arquivo `.env` existe
- Confirme se a variável está definida
- Copie novamente do `env.example`

### **Erro: "Failed to fetch"**
- Verifique a conexão com internet
- Confirme se a URL do Supabase está correta
- Teste se o projeto Supabase está ativo

### **Erro: "Insufficient permissions"**
- Confirme se a Service Role Key está correta
- Verifique se as políticas RLS permitem acesso
- Teste com uma consulta simples no Supabase Dashboard

### **Tabelas Vazias no Export**
- Algumas tabelas podem estar realmente vazias
- Verifique no Supabase Dashboard se há dados
- Confirme se as políticas RLS não estão bloqueando

## 🎉 **Resultado Final**

Após executar com sucesso, você terá:

- ✅ **Arquivo JSON completo** com todos os dados
- ✅ **Metadados detalhados** do processo
- ✅ **Backup confiável** para restauração
- ✅ **Dados estruturados** para análise

---

## 📞 **Suporte**

Se encontrar problemas:

1. Verifique se todas as variáveis estão configuradas
2. Teste a conexão com o Supabase Dashboard
3. Execute com `node export-all.js` para ver erros detalhados
4. Consulte a documentação do Supabase sobre Service Role Keys

**🎯 Export concluído em supabase-full-export.json** 