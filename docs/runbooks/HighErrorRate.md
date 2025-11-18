# Runbook: High Error Rate

## Informações do Alerta

- **Severidade**: WARNING
- **Alerta**: HighErrorRate
- **Condição**: `rate(http_requests_total{status=~"5.."}[5m]) > 0.05`
- **Duração**: 5 minutos
- **Equipe**: Backend

## Descrição

Taxa de erros 5xx acima de 5% nos últimos 5 minutos. Indica problemas na aplicação que estão afetando usuários.

## Impacto

- ⚠️ **Médio**: Alguns usuários afetados
- 🎯 **UX**: Experiência degradada
- 💡 **Performance**: Possível problema de performance

## Diagnóstico

```bash
# Verificar logs de erro
docker-compose logs --tail=200 api | grep "ERROR\|500\|Exception"

# Top 10 erros
docker-compose logs api | grep ERROR | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

# Verificar uso de recursos
docker stats --no-stream
```

## Causas Comuns

### 1. Timeout de Banco de Dados

**Sintoma**: Erros "connection timeout" ou "too many connections"

```bash
# Verificar conexões ativas
docker-compose exec db psql -U mestres_user -d mestres_cafe -c "SELECT count(*) FROM pg_stat_activity;"

# Matar conexões idle
docker-compose exec db psql -U mestres_user -d mestres_cafe -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < now() - interval '5 minutes';"
```

### 2. Memória Insuficiente

```bash
# Se OOM, reiniciar
docker-compose restart api

# Aumentar memória (docker-compose.yml)
# services:
#   api:
#     mem_limit: 2g
#     mem_reservation: 1g
```

### 3. Bug no Código

```bash
# Identificar endpoint problemático
docker-compose logs api | grep "500" | awk '{print $5}' | sort | uniq -c | sort -rn

# Rollback se necessário
git log --oneline -5
git checkout <commit-anterior>
docker-compose up -d --build api
```

## Ações Imediatas

1. ✅ Identificar endpoint com mais erros
2. ✅ Verificar se é bug conhecido
3. ✅ Escalar para dev responsável
4. ✅ Considerar rollback se > 10% erro

## Monitoramento

```bash
# Watch de erros em tempo real
watch -n 5 'docker-compose logs --tail=50 api | grep ERROR | tail -20'
```

---

**Última atualização**: 2025-01-18
