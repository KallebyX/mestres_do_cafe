# Runbook: Database Down

## Informações do Alerta

- **Severidade**: CRITICAL
- **Alerta**: DatabaseDown
- **Condição**: `up{job="postgres"} == 0`
- **Duração**: 1 minuto
- **Equipe**: DBA / Backend

## Descrição

O banco de dados PostgreSQL está offline. A aplicação não consegue processar nenhuma operação que dependa de dados.

## Impacto

- ❌ **Crítico**: Aplicação não funcional
- 💾 **Dados**: Risco de perda de dados se não houver backup recente
- 👥 **Usuários**: Todos os serviços afetados

## Diagnóstico Rápido

```bash
ssh deploy@production-server
cd /opt/mestres-do-cafe

# Status do container
docker-compose ps db

# Logs
docker-compose logs --tail=100 db

# Tentar conectar
docker-compose exec db psql -U mestres_user -d mestres_cafe -c "SELECT 1;"
```

## Resolução

### 1. Container Parado

```bash
# Verificar por que parou
docker-compose logs db

# Restart
docker-compose up -d db
sleep 10

# Testar
docker-compose exec db psql -U mestres_user -d mestres_cafe -c "SELECT version();"
```

### 2. Corrupção de Dados

```bash
# Verificar logs
docker-compose logs db | grep -i "corrupt\|error"

# Se corrupto, restaurar último backup
./scripts/restore-database.sh /opt/mestres-do-cafe/backups/backup_latest.sql.gz
```

### 3. Disco Cheio

```bash
df -h
# Se < 10% livre, limpar

# Limpar logs antigos do Postgres
docker-compose exec db sh -c "find /var/lib/postgresql/data/log -name '*.log' -mtime +7 -delete"

# Vacuum full (cuidado em produção)
docker-compose exec db psql -U mestres_user -d mestres_cafe -c "VACUUM FULL;"
```

## Rollback

```bash
# Restaurar backup mais recente
ls -lht /opt/mestres-do-cafe/backups/

# Restaurar
./scripts/restore-database.sh /opt/mestres-do-cafe/backups/backup_YYYYMMDD_HHMMSS.sql.gz --force
```

## Contatos

- **DBA**: Pedro Costa - +55 11 77777-7777
- **Backend Lead**: Ana Lima - +55 11 66666-6666

---

**Última atualização**: 2025-01-18
