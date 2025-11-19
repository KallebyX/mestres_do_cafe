# 🔒 Documentação de Integração de Segurança - Mestres do Café

## Visão Geral

Este documento descreve a implementação completa dos sistemas de segurança, incluindo:
- ✅ Proteção JWT em 292/336 endpoints (86.9%)
- ✅ Rate Limiting com 9 estratégias configuradas
- ✅ Audit Logging com 25+ ações rastreáveis
- ✅ Runbooks para 3 cenários críticos

---

## 📊 Estatísticas Finais

### Cobertura de Segurança JWT

| Métrica | Valor | Status |
|---------|-------|--------|
| **Total de Endpoints** | 336 | - |
| **Protegidos com JWT** | 292 | ✅ 86.9% |
| **Públicos (intencionais)** | 13 | ✅ Design |
| **Gaps Restantes** | 31 | ⚠️ Em análise |

### Endpoints Críticos Protegidos (Recentemente)

| Arquivo | Endpoint | Proteção Adicionada |
|---------|----------|---------------------|
| `wishlist.py` | `GET /` | @jwt_required() |
| `wishlist.py` | `POST /add` | @jwt_required() |
| `wishlist.py` | `DELETE /remove/<id>` | @jwt_required() |
| `wishlist.py` | `POST /toggle` | @jwt_required() |
| `orders.py` | `PUT /<order_id>/status` | @jwt_required() + admin check |
| `reviews_simple.py` | `POST /add` | @jwt_required() |

---

## 🚦 Rate Limiting

### Configurações por Tipo de Endpoint

#### Autenticação (Alta Segurança)
```python
'auth_login': {
    'requests': 5,
    'window': 60,         # 5 requests por minuto
    'block_duration': 300 # Bloqueio de 5 minutos
}

'auth_register': {
    'requests': 3,
    'window': 3600,       # 3 registros por hora
    'block_duration': 3600
}
```

#### APIs Públicas (Moderado)
```python
'api_public': {
    'requests': 100,
    'window': 60,         # 100 requests por minuto
    'block_duration': 60
}

'api_search': {
    'requests': 30,
    'window': 60,         # 30 buscas por minuto
    'block_duration': 120
}
```

#### APIs Autenticadas (Permissivo)
```python
'api_authenticated': {
    'requests': 300,
    'window': 60,         # 300 requests por minuto
    'block_duration': 30
}

'api_admin': {
    'requests': 1000,
    'window': 60,         # 1000 requests por minuto
    'block_duration': 10
}
```

#### Operações Especiais
```python
'api_shipping_calc': {
    'requests': 20,
    'window': 60,         # 20 cálculos por minuto
    'block_duration': 120
}

'api_upload': {
    'requests': 10,
    'window': 60,         # 10 uploads por minuto
    'block_duration': 300
}

'webhook': {
    'requests': 50,
    'window': 60,         # 50 webhooks por minuto
    'block_duration': 300
}
```

### Como Usar Rate Limiting

#### Método 1: Decorator (Recomendado)

```python
from middleware.rate_limiting import rate_limit

@app.route('/api/auth/login', methods=['POST'])
@rate_limit('auth_login')
def login():
    # Seu código aqui
    pass

@app.route('/api/products/search', methods=['GET'])
@rate_limit('api_search')
def search_products():
    # Seu código aqui
    pass
```

#### Método 2: Verificação Manual

```python
from middleware.rate_limiting import check_rate_limit

@app.route('/api/custom', methods=['GET'])
def custom_endpoint():
    if not check_rate_limit('api_public'):
        return jsonify({'error': 'Rate limit exceeded'}), 429

    # Seu código aqui
    pass
```

#### Headers de Resposta

Todos os endpoints com rate limiting retornam headers informativos:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1637000000
Retry-After: 45  (quando bloqueado)
```

### Resposta de Rate Limit Excedido

```json
{
  "error": "Limite de requisições excedido",
  "retry_after": 60,
  "message": "Você excedeu o limite de 5 requisições por minuto. Tente novamente em 60 segundos."
}
```

**Status Code**: `429 Too Many Requests`

---

## 📝 Audit Logging

### Ações Auditáveis (25+ categorias)

#### Autenticação (5 ações)
| Ação | Categoria | Severidade | Descrição |
|------|-----------|------------|-----------|
| `auth.login` | authentication | info | Login bem-sucedido |
| `auth.logout` | authentication | info | Logout do usuário |
| `auth.register` | authentication | info | Novo registro |
| `auth.password_reset` | authentication | warning | Reset de senha |
| `auth.failed_login` | authentication | warning | Tentativa falhada |

#### Gestão de Usuários (4 ações)
| Ação | Categoria | Severidade | Descrição |
|------|-----------|------------|-----------|
| `admin.user_create` | user_management | warning | Criação de usuário |
| `admin.user_update` | user_management | warning | Atualização de usuário |
| `admin.user_delete` | user_management | critical | Deleção de usuário |
| `admin.role_change` | user_management | critical | Mudança de permissões |

#### Financeiro (3 ações)
| Ação | Categoria | Severidade | Descrição |
|------|-----------|------------|-----------|
| `payment.completed` | financial | info | Pagamento concluído |
| `payment.failed` | financial | warning | Falha no pagamento |
| `payment.refund` | financial | warning | Estorno processado |

#### Acesso a Dados (6 ações)
| Ação | Categoria | Severidade | Descrição |
|------|-----------|------------|-----------|
| `data.export` | data_access | warning | Exportação de dados |
| `data.bulk_delete` | data_access | critical | Deleção em massa |
| `data.sensitive_access` | data_access | warning | Acesso a dados sensíveis |
| `data.pii_access` | data_access | critical | Acesso a PII |
| `data.mass_update` | data_access | critical | Atualização em massa |
| `data.backup_restore` | data_access | critical | Restauração de backup |

E mais 7+ categorias (configuração, produto, pedidos, etc.)

### Como Usar Audit Logging

#### Método 1: Decorator (Recomendado)

```python
from middleware.audit_logging import audit_action

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
@audit_action('admin.user_delete')
def delete_user(user_id):
    # Seu código aqui
    # Auditoria automática ao final (sucesso ou falha)
    return jsonify({'success': True})
```

#### Método 2: Chamada Manual

```python
from middleware.audit_logging import create_audit_log

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        user = authenticate(email, password)

        # Audit log para login bem-sucedido
        create_audit_log('auth.login', details={
            'email': user.email,
            'user_id': str(user.id)
        }, user_id=str(user.id), success=True)

        return jsonify({'success': True})
    except Exception as e:
        # Audit log para login falhado
        create_audit_log('auth.failed_login', details={
            'email': email,
            'reason': str(e)
        }, success=False)
        raise
```

#### Método 3: Funções Auxiliares

```python
from middleware.audit_logging import audit_login, audit_data_access, audit_admin_action

# Login
audit_login(user_id='123', success=True)

# Acesso a dados sensíveis
audit_data_access(user_id='123', resource_type='financial_report',
                  resource_id='report_456', action='read')

# Ação administrativa
audit_admin_action(admin_id='admin_123', action='user_delete',
                   target_id='user_456', details={'reason': 'violação de termos'})
```

### Formato do Log de Auditoria

```json
{
  "action": "admin.user_delete",
  "category": "user_management",
  "severity": "critical",
  "success": true,
  "user_id": "uuid-123",
  "timestamp": "2025-11-18T10:30:45.123456",
  "client_ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "endpoint": "/api/admin/users/uuid-456",
  "method": "DELETE",
  "request_id": "req-789",
  "details": {
    "deleted_user_id": "uuid-456",
    "deleted_user_email": "user@example.com",
    "reason": "violação de termos"
  }
}
```

### Localização dos Logs

```bash
logs/audit/
├── audit.log              # Log principal (rotativo)
├── audit.log.1            # Backup 1
├── audit.log.2            # Backup 2
...
└── audit.log.10           # Backup 10 (máximo)
```

**Configuração de Rotação:**
- Tamanho máximo: 10 MB por arquivo
- Backups mantidos: 10 arquivos
- Total: ~100 MB de logs de auditoria

---

## 🛡️ Proteção JWT

### Decorators Disponíveis

#### @jwt_required()
Proteção básica JWT - verifica se o token é válido.

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    # Seu código aqui
    pass
```

#### @admin_required()
Proteção JWT + verificação de admin (arquivo: `admin.py`).

```python
from controllers.routes.admin import admin_required

@app.route('/api/admin/dashboard', methods=['GET'])
@jwt_required()
@admin_required()
def admin_dashboard():
    # Apenas administradores podem acessar
    pass
```

#### @require_auth (BaseController)
Usado em classes que herdam de BaseController.

```python
class MyController(BaseController):
    @require_auth
    def protected_endpoint(self):
        user = self.current_user
        # Seu código aqui
        pass
```

### Endpoints Intencionalmente Públicos

Os seguintes endpoints **NÃO** têm JWT por design:

#### Autenticação (3 endpoints)
- `POST /api/auth/login` - Login de usuários
- `POST /api/auth/register` - Registro de novos usuários
- `POST /api/auth/forgot-password` - Recuperação de senha

#### Health Checks (3 endpoints)
- `GET /api/health` - Verificação de saúde da API
- `GET /api/ping` - Ping simples
- `GET /api/status` - Status do sistema

#### Catálogo Público (5 endpoints)
- `GET /api/products` - Listagem de produtos
- `GET /api/products/<id>` - Detalhes do produto
- `GET /api/categories` - Categorias de produtos
- `GET /api/blog` - Posts do blog
- `GET /api/reviews` - Reviews de produtos

#### Webhooks (1+ endpoints)
- `POST /api/webhook/*` - Webhooks de integrações externas

#### Utilitários Públicos (2 endpoints)
- `POST /api/checkout/validate-cep` - Validação de CEP
- `GET /api/checkout/payment-methods` - Métodos de pagamento disponíveis

**Total**: 13+ endpoints públicos intencionais

---

## 🔧 Integração no app.py

### Ordem de Inicialização

```python
# apps/api/src/app.py

# 1. Importações
from middleware.rate_limiting import init_rate_limiting
from middleware.audit_logging import init_audit_logging

# 2. Inicialização (ordem importante)
def create_app(config_name=None):
    app = Flask(__name__)

    # ... configurações básicas ...

    # Inicializar middlewares de segurança
    init_security_middleware(app)      # Headers de segurança

    init_rate_limiting(app)            # Rate limiting
    logger.info("✅ Rate limiting inicializado")

    init_audit_logging(app)            # Audit logging
    logger.info("✅ Audit logging inicializado")

    # ... registro de blueprints ...
```

### Verificação de Inicialização

Execute o servidor e verifique os logs:

```bash
cd apps/api
python src/app.py
```

Você deve ver:
```
✅ SQLAlchemy inicializado com sucesso
✅ JWTManager inicializado com sucesso
✅ Rate limiting inicializado com sucesso
✅ Audit logging inicializado com sucesso
```

---

## 📖 Runbooks Criados

### 1. APIDown.md
**Cenário**: API completamente offline
**Severidade**: CRITICAL
**Tempo de resolução esperado**: < 5 minutos

**Diagnósticos inclusos:**
- Verificar status dos containers
- Verificar health check
- Verificar logs de erro
- Verificar conectividade de rede

**Resoluções incluídas:**
- Container parado → Restart
- Erro de inicialização → Fix migrations
- Falta de recursos → Aumentar limites
- Problemas de rede → Verificar portas/firewall

### 2. DatabaseDown.md
**Cenário**: Banco de dados offline ou inacessível
**Severidade**: CRITICAL
**Tempo de resolução esperado**: < 10 minutos

**Diagnósticos inclusos:**
- Verificar container PostgreSQL
- Verificar conectividade
- Verificar corrupção de dados
- Verificar espaço em disco

**Resoluções incluídas:**
- Container parado → Restart
- Corrupção de dados → Restaurar backup
- Disco cheio → Limpeza de logs
- Connection pool esgotado → Restart + ajustes

### 3. HighErrorRate.md
**Cenário**: Taxa de erros > 5%
**Severidade**: WARNING
**Tempo de resolução esperado**: < 15 minutos

**Diagnósticos inclusos:**
- Analisar logs de erros
- Identificar endpoint com problemas
- Verificar uso de recursos
- Verificar dependências externas

**Resoluções incluídas:**
- Timeout de banco → Matar queries lentas
- Memória insuficiente → Restart + otimização
- Bug no código → Rollback
- API externa falhando → Desabilitar temporariamente

**Localização**: `docs/runbooks/*.md`

---

## ✅ Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)

1. **Migrar Rate Limiting para Redis**
   - Atualmente usa memória in-process
   - Redis permite rate limiting distribuído
   - Arquivo: `apps/api/src/middleware/rate_limiting.py`

2. **Integrar Audit Logs com ELK Stack**
   - Centralizar logs de auditoria
   - Criar dashboards de segurança
   - Alertas automáticos para ações críticas

3. **Proteger os 31 Endpoints Restantes**
   - Analisar se são realmente públicos
   - Adicionar JWT ou rate limiting conforme necessário
   - Arquivo de referência: `docs/JWT_AUDIT_REPORT.md`

### Médio Prazo (1 mês)

4. **Implementar Testes Automatizados**
   - Testes de rate limiting (verificar bloqueios)
   - Testes de audit logging (verificar logs gerados)
   - Testes de JWT (verificar proteção)

5. **Configurar Alertas**
   - Alertmanager para alertas críticos
   - Slack/Email para notificações
   - PagerDuty/Opsgenie para on-call

6. **Auditoria Mensal de Segurança**
   - Executar `python scripts/audit-jwt.py` mensalmente
   - Revisar logs de auditoria
   - Atualizar runbooks conforme necessário

### Longo Prazo (3 meses)

7. **Implementar WAF (Web Application Firewall)**
   - Cloudflare ou AWS WAF
   - Proteção contra OWASP Top 10
   - Rate limiting no edge

8. **Implementar SIEM (Security Information and Event Management)**
   - Splunk ou Elastic Security
   - Correlação de eventos de segurança
   - Machine learning para detecção de anomalias

9. **Certificações de Segurança**
   - SOC 2 Type II
   - ISO 27001
   - PCI DSS (se processar cartões)

---

## 🔍 Comandos Úteis

### Auditoria JWT
```bash
# Executar auditoria completa
python scripts/audit-jwt.py

# Ver apenas gaps
python scripts/audit-jwt.py 2>&1 | grep "✗"

# Ver estatísticas
python scripts/audit-jwt.py 2>&1 | grep -A 10 "ESTATÍSTICAS"
```

### Logs de Auditoria
```bash
# Ver últimos 50 logs
tail -50 logs/audit/audit.log

# Ver logs críticos
grep '"severity": "critical"' logs/audit/audit.log

# Ver logs de login
grep '"action": "auth.login"' logs/audit/audit.log

# Contar logins falhados nas últimas 24h
grep '"auth.failed_login"' logs/audit/audit.log | grep "$(date +%Y-%m-%d)" | wc -l
```

### Rate Limiting
```bash
# Ver logs de rate limiting
grep "Rate limit exceeded" logs/app.log

# Ver IPs bloqueados
grep "blocked" logs/app.log | awk '{print $5}' | sort | uniq -c | sort -rn
```

### Monitoramento em Tempo Real
```bash
# Logs em tempo real
tail -f logs/app.log logs/audit/audit.log

# Logs de erro em tempo real
tail -f logs/app.log | grep ERROR

# Audit logs em tempo real
tail -f logs/audit/audit.log | jq .
```

---

## 📞 Suporte e Contato

Para questões de segurança:
- **Email**: security@mestresdocafe.com.br
- **Slack**: #security-incidents
- **On-call**: +55 11 9xxxx-xxxx (PagerDuty)

Para questões técnicas:
- **Email**: dev@mestresdocafe.com.br
- **Slack**: #backend-dev
- **GitHub Issues**: https://github.com/mestresdocafe/mestres_do_cafe/issues

---

## 📚 Referências

- [Flask-JWT-Extended Documentation](https://flask-jwt-extended.readthedocs.io/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DDoS_Prevention_Cheat_Sheet.html)
- [CWE-778: Insufficient Logging](https://cwe.mitre.org/data/definitions/778.html)
- [Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)

---

**Documento criado em**: 2025-11-18
**Última atualização**: 2025-11-18
**Versão**: 1.0.0
**Autor**: Claude Code (Implementação Automatizada)
