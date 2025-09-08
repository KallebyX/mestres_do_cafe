# 🚀 PROMPT COMPLETO PARA KILO CODE - MESTRES DO CAFÉ

## 📋 CONTEXTO DO PROJETO

Você é um especialista em desenvolvimento full-stack e precisa resolver completamente o sistema **Mestres do Café**, uma plataforma e-commerce enterprise de cafés especiais com ERP integrado.

## 🎯 OBJETIVO PRINCIPAL

**Tornar o sistema 100% funcional, estável e production-ready** com foco em:
- E-commerce completo funcionando
- ERP enterprise integrado
- Performance otimizada
- Segurança máxima
- UX/UI profissional

## 🏗️ ARQUITETURA ATUAL

### Stack Tecnológico:
- **Frontend**: React 18 + Vite 5 + Tailwind CSS
- **Backend**: Python Flask + SQLAlchemy
- **Banco**: Neon PostgreSQL (migrado do Render)
- **Deploy**: Render.com
- **Cache**: Redis
- **Pagamentos**: Mercado Pago
- **Frete**: Melhor Envio

### Estrutura do Projeto:
```
/Users/kalleby/Downloads/mestres_do_cafe-2/
├── apps/
│   ├── api/          # Backend Flask
│   └── web/          # Frontend React
├── .github/workflows/ # GitHub Actions
└── render.yaml       # Configuração Render
```

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **FRONTEND NÃO CARREGANDO DADOS**
- **Sintoma**: Frontend carrega mas não exibe produtos
- **Causa**: URL da API duplicada (`/api/api/products`)
- **Status**: ✅ CORRIGIDO - mas precisa verificar se está funcionando

### 2. **IMAGENS 404**
- **Sintoma**: Logos e imagens não carregam
- **Causa**: Referências para arquivos PNG/JPG inexistentes
- **Status**: ✅ CORRIGIDO - criados SVGs placeholder

### 3. **BANCO DE DADOS VAZIO**
- **Sintoma**: API retorna 0 produtos
- **Causa**: Banco Neon não populado
- **Status**: ✅ CORRIGIDO - 5 produtos inseridos

### 4. **CONFIGURAÇÕES DE DEPLOY**
- **Sintoma**: Variáveis de ambiente incorretas
- **Causa**: Configuração Render inadequada
- **Status**: ✅ CORRIGIDO - mas precisa validação

## 🔧 TAREFAS ESPECÍFICAS

### TAREFA 1: VALIDAR FUNCIONAMENTO COMPLETO
```bash
# 1. Testar API
curl -s "https://mestres-cafe-api.onrender.com/api/products" | jq '.products | length'
# Deve retornar: 5

# 2. Testar Frontend
curl -s "https://mestres-cafe-web.onrender.com/" | grep -E "script.*src"
# Deve mostrar: index-XXXXX.js (novo hash)

# 3. Testar Imagens
curl -I "https://mestres-cafe-web.onrender.com/logo-para-fundo-branco.svg"
# Deve retornar: HTTP/2 200
```

### TAREFA 2: VERIFICAR LOGS DO CONSOLE
Acesse: https://mestres-cafe-web.onrender.com/
- Abra F12 → Console
- Verifique se há erros em vermelho
- Confirme se produtos estão carregando
- Verifique se imagens estão exibindo

### TAREFA 3: TESTAR FUNCIONALIDADES CORE
1. **Marketplace**: Produtos devem aparecer
2. **Carrinho**: Deve funcionar
3. **Checkout**: Deve processar
4. **Admin**: Deve acessar dashboard
5. **Analytics**: Deve rastrear eventos

### TAREFA 4: OTIMIZAR PERFORMANCE
```bash
# Verificar tempo de resposta da API
curl -w "@curl-format.txt" -o /dev/null -s "https://mestres-cafe-api.onrender.com/api/products"

# Verificar tempo de carregamento do frontend
curl -w "@curl-format.txt" -o /dev/null -s "https://mestres-cafe-web.onrender.com/"
```

### TAREFA 5: VALIDAR SEGURANÇA
1. **CORS**: Verificar headers corretos
2. **HTTPS**: Confirmar SSL
3. **Headers**: Verificar segurança
4. **RLS**: Confirmar políticas do banco

## 🚨 PROBLEMAS CRÍTICOS A RESOLVER

### CRÍTICO 1: FRONTEND NÃO CONECTA COM API
**Sintoma**: Console mostra erros de API
**Solução**:
```javascript
// Verificar em apps/web/src/config/api.js
export const API_BASE_URL = 'https://mestres-cafe-api.onrender.com/api';
// NÃO deve ter /api duplicado
```

### CRÍTICO 2: BANCO SEM DADOS
**Sintoma**: API retorna array vazio
**Solução**:
```python
# Executar script de população
python3 populate_neon_correct.py
# Deve inserir 5 produtos + 3 categorias
```

### CRÍTICO 3: IMAGENS 404
**Sintoma**: Logos não aparecem
**Solução**:
```bash
# Verificar se SVGs existem
ls -la apps/web/public/*.svg
# Deve mostrar: logo-para-fundo-branco.svg, etc.
```

## 📊 MÉTRICAS DE SUCESSO

### ✅ CRITÉRIOS DE ACEITAÇÃO:
1. **API Health**: `/api/health` retorna 200
2. **Produtos**: `/api/products` retorna 5 produtos
3. **Frontend**: Carrega sem erros no console
4. **Imagens**: Logos exibem corretamente
5. **Performance**: < 3s tempo de carregamento
6. **Segurança**: Headers de segurança presentes

### 📈 KPIs TÉCNICOS:
- **Uptime**: > 99.9%
- **Response Time**: < 500ms API
- **Error Rate**: < 0.1%
- **Core Web Vitals**: Todos verdes

## 🔍 COMANDOS DE DIAGNÓSTICO

### Verificar Status Geral:
```bash
# 1. API Health
curl -s "https://mestres-cafe-api.onrender.com/api/health" | jq

# 2. Produtos
curl -s "https://mestres-cafe-api.onrender.com/api/products" | jq '.products | length'

# 3. Frontend
curl -I "https://mestres-cafe-web.onrender.com/"

# 4. Imagens
curl -I "https://mestres-cafe-web.onrender.com/logo-para-fundo-branco.svg"
```

### Verificar Logs:
```bash
# 1. Verificar deploy mais recente
git log --oneline -5

# 2. Verificar status do banco
python3 check_db_structure.py

# 3. Testar conectividade
python3 test_frontend_connection.py
```

## 🛠️ FERRAMENTAS DISPONÍVEIS

### Scripts de Diagnóstico:
- `check_db_structure.py` - Verificar estrutura do banco
- `test_frontend_connection.py` - Testar conectividade
- `populate_neon_correct.py` - Popular banco com dados

### Configurações:
- `render.yaml` - Configuração do deploy
- `apps/web/src/config/api.js` - Configuração da API
- `.github/workflows/neon_workflow.yml` - CI/CD

## 🎯 RESULTADO ESPERADO

### Estado Final:
1. **Sistema 100% funcional**
2. **Zero erros no console**
3. **5 produtos exibindo**
4. **Imagens carregando**
5. **Performance otimizada**
6. **Segurança implementada**

### URLs para Testar:
- **Frontend**: https://mestres-cafe-web.onrender.com/
- **API**: https://mestres-cafe-api.onrender.com/api/health
- **Produtos**: https://mestres-cafe-api.onrender.com/api/products

## 🚀 AÇÕES IMEDIATAS

### 1. EXECUTAR DIAGNÓSTICO COMPLETO
```bash
# Executar todos os testes
./diagnostic_complete.sh
```

### 2. CORRIGIR PROBLEMAS IDENTIFICADOS
- Aplicar correções necessárias
- Fazer commit das mudanças
- Aguardar deploy

### 3. VALIDAR FUNCIONAMENTO
- Testar todas as funcionalidades
- Verificar métricas de performance
- Confirmar segurança

## 📝 ENTREGÁVEIS

### Relatório Final:
1. **Status de cada componente**
2. **Métricas de performance**
3. **Problemas encontrados e soluções**
4. **Recomendações de melhoria**
5. **Plano de monitoramento**

### Código:
- Todas as correções aplicadas
- Scripts de diagnóstico
- Documentação atualizada

---

## 🎯 INSTRUÇÕES FINAIS

**Execute este prompt de forma sistemática:**
1. **Diagnóstico**: Identifique todos os problemas
2. **Correção**: Aplique soluções específicas
3. **Validação**: Confirme funcionamento
4. **Otimização**: Melhore performance
5. **Documentação**: Registre resultados

**Objetivo**: Sistema Mestres do Café 100% funcional, estável e production-ready.

**Tempo estimado**: 2-4 horas
**Prioridade**: CRÍTICA
**Status**: AGUARDANDO EXECUÇÃO
