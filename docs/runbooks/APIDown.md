# Runbook: API Down

## Informações do Alerta

- **Severidade**: CRITICAL
- **Alerta**: APIDown
- **Condição**: `up{job="api"} == 0`
- **Duração**: 1 minuto
- **Equipe**: Backend

## Descrição

A API principal do Mestres do Café está offline e não responde a health checks. Isso significa que os usuários não conseguem acessar a aplicação.

## Impacto

- ❌ **Alto**: Aplicação completamente inacessível
- 💰 **Perda de receita**: Vendas interrompidas
- 👥 **Experiência do usuário**: Serviço indisponível
- ⏱️ **SLA**: Afeta SLA de uptime

## Diagnóstico

### 1. Verificar Status dos Containers

```bash
# Conectar ao servidor
ssh deploy@production-server

# Verificar containers
cd /opt/mestres-do-cafe
docker-compose ps

# Verificar logs da API
docker-compose logs --tail=100 api
```

**O que procurar:**
- Container da API está rodando?
- Erros de inicialização nos logs?
- Problemas de conexão com banco/redis?

### 2. Verificar Health Check

```bash
# Teste local no servidor
curl http://localhost:5001/api/health

# Se não responder, verificar porta
netstat -tlnp | grep 5001

# Verificar processo
ps aux | grep gunicorn
```

### 3. Verificar Recursos do Sistema

```bash
# CPU e memória
top

# Espaço em disco
df -h

# Verificar logs do sistema
dmesg | tail
journalctl -u docker -n 50
```

## Resolução

### Cenário 1: Container Parado

**Problema**: Container não está rodando

```bash
# Verificar por que parou
docker-compose logs --tail=200 api

# Reiniciar container
docker-compose up -d api

# Aguardar 30 segundos
sleep 30

# Verificar health
curl http://localhost:5001/api/health
```

### Cenário 2: Erro de Inicialização

**Problema**: Container inicia mas fecha imediatamente

```bash
# Ver logs completos
docker-compose logs api

# Problemas comuns:
# - Variáveis de ambiente faltando
# - Erro de conexão com banco de dados
# - Erro de sintaxe no código

# Verificar .env
cat .env | grep -v PASSWORD

# Verificar banco de dados
docker-compose exec db psql -U mestres_user -d mestres_cafe -c "SELECT 1;"
```

**Ação**:
```bash
# Se problema com migrations
docker-compose exec api flask db upgrade

# Se problema com dependências
docker-compose build --no-cache api
docker-compose up -d api
```

### Cenário 3: Falta de Recursos

**Problema**: Servidor sem recursos (memória/disco)

```bash
# Verificar memória
free -h

# Se pouca memória, reiniciar containers desnecessários
docker-compose down redis
docker-compose up -d redis

# Verificar disco
df -h

# Se disco cheio, limpar logs antigos
find /var/log -name "*.log" -mtime +7 -delete
docker system prune -a -f
```

### Cenário 4: Problema de Rede

**Problema**: Nginx não consegue alcançar a API

```bash
# Verificar nginx
docker-compose ps nginx

# Verificar configuração
docker-compose exec nginx nginx -t

# Verificar rede Docker
docker network inspect mestres-do-cafe_default

# Testar conectividade interna
docker-compose exec nginx curl http://api:5001/api/health
```

**Ação**:
```bash
# Reiniciar nginx
docker-compose restart nginx
```

## Rollback

Se a API não voltar após as tentativas acima:

```bash
# Fazer rollback para versão anterior
cd /opt/mestres-do-cafe
git log --oneline -5  # Ver últimos commits
git checkout <commit-anterior>
docker-compose down
docker-compose up -d --build

# Ou usar imagem anterior do registry
docker-compose pull  # Remove para usar cache
docker-compose up -d api
```

## Escalonamento

Se o problema persistir após 10 minutos:

1. **Notificar Tech Lead**: +55 11 99999-9999
2. **Acionar On-Call**: via PagerDuty
3. **Comunicar ao time**: Canal #incidents no Slack
4. **Status Page**: Atualizar status.mestres-do-cafe.com

## Pós-Incidente

Após resolver:

1. ✅ Documentar causa raiz
2. ✅ Atualizar runbook se necessário
3. ✅ Criar issue para prevenir recorrência
4. ✅ Revisar logs e métricas
5. ✅ Realizar post-mortem se downtime > 15min

## Comandos Rápidos

```bash
# Status geral
./scripts/health-check.sh

# Restart rápido
docker-compose restart api

# Logs em tempo real
docker-compose logs -f api

# Health check
curl http://localhost:5001/api/health
```

## Contatos

- **Tech Lead**: João Silva - +55 11 99999-9999
- **DevOps**: Maria Santos - +55 11 88888-8888
- **On-Call**: PagerDuty +1-XXX-XXX-XXXX

## Histórico de Incidentes

| Data | Duração | Causa Raiz | Ação Tomada |
|------|---------|------------|-------------|
| 2025-01-15 | 5min | OOM Killer | Aumentado memória do container |
| 2025-01-10 | 12min | Disco cheio | Limpeza de logs + alerta proativo |

## Prevenção

- ✅ Configurar alertas de memória/disco antes de crítico
- ✅ Implementar auto-scaling
- ✅ Configurar health checks mais robustos
- ✅ Manter backups automáticos

---

**Última atualização**: 2025-01-18
**Versão**: 1.0.0
**Responsável**: DevOps Team
