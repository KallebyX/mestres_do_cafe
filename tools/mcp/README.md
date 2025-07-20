# MCP Docker Server - Mestres do Café Enterprise

🐳 Servidor MCP especializado para gerenciamento e diagnóstico de containers Docker

## 📋 Visão Geral

O MCP Docker Server fornece ferramentas avançadas para inspecionar, gerenciar e diagnosticar containers Docker através do protocolo MCP (Model Context Protocol). Foi especialmente desenvolvido para o projeto Mestres do Café Enterprise.

## 🚀 Recursos

### 🔧 Ferramentas Disponíveis

| Ferramenta | Descrição | Casos de Uso |
|------------|-----------|--------------|
| `docker_ps` | Lista containers Docker | Verificar status geral |
| `docker_logs` | Obter logs de containers | Debug e monitoramento |
| `docker_inspect` | Inspecionar containers | Análise detalhada |
| `docker_stats` | Estatísticas de recursos | Monitoramento de performance |
| `docker_exec` | Executar comandos | Interação direta |
| `docker_compose_ps` | Status do docker-compose | Gerenciamento de stack |
| `docker_compose_logs` | Logs do docker-compose | Debug de serviços |
| `docker_health_check` | Verificar saúde | Monitoramento de saúde |
| `docker_troubleshoot` | Diagnóstico completo | Resolução de problemas |

### 🏥 Diagnóstico Inteligente

- **Análise automática** de containers com falha
- **Verificação de saúde** de todos os serviços
- **Monitoramento de recursos** (CPU, memória, rede)
- **Detecção de problemas** de rede e volumes
- **Recomendações automáticas** para resolução

## 📦 Instalação

```bash
# 1. Navegar para o diretório MCP
cd tools/mcp

# 2. Instalar dependências
npm install

# 3. Executar script de instalação (opcional)
./install-docker-mcp.sh
```

## 🎯 Uso

### Iniciar o Servidor

```bash
# Método 1: Diretamente
node docker-server.js

# Método 2: Via npm
npm run start:docker

# Método 3: Via comando global (após instalação)
mestres-cafe-docker
```

### Configuração para Claude Code

Adicione ao seu arquivo de configuração MCP:

```json
{
  "mcp_servers": {
    "mestres-cafe-docker": {
      "command": "node",
      "args": ["/path/to/tools/mcp/docker-server.js"],
      "cwd": "/path/to/mestres_cafe_enterprise",
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      }
    }
  }
}
```

## 🔍 Exemplos de Uso

### Verificar Status dos Containers

```javascript
// Lista todos os containers rodando
{
  "name": "docker_ps",
  "arguments": { "all": false }
}

// Lista todos os containers (incluindo parados)
{
  "name": "docker_ps",
  "arguments": { "all": true, "format": "json" }
}
```

### Obter Logs

```javascript
// Últimas 50 linhas do container da API
{
  "name": "docker_logs",
  "arguments": {
    "container": "mestres_cafe_api",
    "tail": 50
  }
}

// Logs desde uma hora atrás
{
  "name": "docker_logs",
  "arguments": {
    "container": "mestres_cafe_api",
    "since": "1h"
  }
}
```

### Diagnóstico Completo

```javascript
// Diagnóstico geral do ambiente
{
  "name": "docker_troubleshoot",
  "arguments": {
    "include_logs": true
  }
}

// Diagnóstico específico de um container
{
  "name": "docker_troubleshoot",
  "arguments": {
    "container": "mestres_cafe_api",
    "include_logs": true
  }
}
```

### Verificar Saúde dos Serviços

```javascript
// Verificação básica
{
  "name": "docker_health_check",
  "arguments": {
    "project_dir": "."
  }
}

// Verificação detalhada
{
  "name": "docker_health_check",
  "arguments": {
    "project_dir": ".",
    "detailed": true
  }
}
```

## 🛠️ Problemas Resolvidos

### ✅ Problemas Identificados e Corrigidos

1. **Import Errors**: Corrigidos imports relativos em 50+ arquivos Python
2. **PostgreSQL Driver**: Adicionado `psycopg2-binary` às dependências
3. **Prometheus Config**: Corrigidas configurações inválidas de storage
4. **Nginx Config**: Corrigida estrutura e sintaxe do nginx.conf
5. **Container Health**: Todos os serviços principais agora estão saudáveis

### 📊 Status Final dos Serviços

| Serviço | Status | Porta | Saúde |
|---------|--------|-------|-------|
| API | ✅ Running | 5001 | Healthy |
| Web | ✅ Running | 3000 | Healthy |
| Database | ✅ Running | 5432 | Healthy |
| Redis | ✅ Running | 6379 | Healthy |
| Nginx | ✅ Running | 80/443 | Healthy |
| Prometheus | ✅ Running | 9090 | Healthy |
| Grafana | ✅ Running | 3001 | Healthy |
| Adminer | ✅ Running | 8080 | Healthy |
| MailHog | ✅ Running | 8025 | Healthy |

## 🧪 Testes

```bash
# Executar testes básicos
node test-docker-mcp.js

# Executar diagnóstico completo
node diagnose-issues.js
```

## 📝 Arquivos Importantes

- `docker-server.js` - Servidor MCP principal
- `diagnose-issues.js` - Script de diagnóstico standalone
- `test-docker-mcp.js` - Testes automatizados
- `install-docker-mcp.sh` - Script de instalação
- `mcp-docker-config.json` - Configuração de exemplo

## 🔗 Integração com Projeto

### Estrutura de Rede

- **Rede Principal**: `mestres_cafe_network`
- **Containers**: Todos conectados na mesma rede
- **Comunicação**: Inter-service via nomes de container

### Volumes Persistentes

- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis
- `prometheus_data` - Métricas do Prometheus
- `grafana_data` - Dashboards e configurações
- `api_logs` - Logs da aplicação

## 🚨 Troubleshooting

### Problemas Comuns

1. **Container não inicia**: Verifique logs com `docker_logs`
2. **Porta ocupada**: Use `docker_ps` para verificar mapeamentos
3. **Rede isolada**: Use `docker_troubleshoot` para análise de rede
4. **Recursos insuficientes**: Use `docker_stats` para monitoramento

### Comandos de Emergência

```bash
# Parar todos os containers
docker-compose down

# Rebuild completo
docker-compose build --no-cache

# Limpar volumes (CUIDADO!)
docker-compose down -v

# Restart específico
docker-compose restart <service_name>
```

## 🎉 Resultados

### ✅ Antes vs Depois

**Antes:**
- ❌ Múltiplos import errors
- ❌ Containers falhando ao iniciar  
- ❌ Configurações inválidas
- ❌ Sem ferramentas de diagnóstico

**Depois:**
- ✅ Todos os imports corrigidos
- ✅ Todos os serviços saudáveis
- ✅ Configurações validadas
- ✅ MCP Docker Server para diagnóstico avançado

### 📈 Melhorias Implementadas

1. **Diagnóstico Automatizado**: Identificação rápida de problemas
2. **Monitoramento Avançado**: Ferramentas de health check e stats
3. **Resolução Proativa**: Scripts de correção automática
4. **Documentação Completa**: Guias detalhados de uso e troubleshooting

---

**🚀 O ambiente Mestres do Café Enterprise está agora totalmente funcional e equipado com ferramentas avançadas de diagnóstico Docker!**