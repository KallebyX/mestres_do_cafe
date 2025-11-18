# Configuração de GitHub Secrets

Este guia explica como configurar todos os secrets necessários para os workflows de CI/CD funcionarem corretamente.

## 📋 Índice

- [Como Adicionar Secrets no GitHub](#como-adicionar-secrets-no-github)
- [Secrets de Deploy](#secrets-de-deploy)
- [Secrets de Segurança](#secrets-de-segurança)
- [Secrets de Notificação](#secrets-de-notificação)
- [Verificação de Configuração](#verificação-de-configuração)

---

## Como Adicionar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione o nome e valor do secret
5. Clique em **Add secret**

![GitHub Secrets Location](https://docs.github.com/assets/cb-8377/images/help/settings/actions-secrets-tab.png)

---

## 🚀 Secrets de Deploy

### Staging Environment

#### `STAGING_HOST`
- **Descrição**: Endereço IP ou hostname do servidor de staging
- **Exemplo**: `staging.mestres-do-cafe.com` ou `192.168.1.100`
- **Como obter**:
  ```bash
  # No servidor staging
  hostname -I
  ```

#### `STAGING_USER`
- **Descrição**: Usuário SSH para acesso ao servidor de staging
- **Exemplo**: `deploy` ou `ubuntu`
- **Recomendação**: Criar um usuário dedicado para deploy

#### `STAGING_SSH_KEY`
- **Descrição**: Chave privada SSH para autenticação no servidor de staging
- **Como gerar**:
  ```bash
  # No seu computador local
  ssh-keygen -t ed25519 -C "github-actions-staging" -f ~/.ssh/staging_deploy_key

  # Copiar chave pública para o servidor
  ssh-copy-id -i ~/.ssh/staging_deploy_key.pub STAGING_USER@STAGING_HOST

  # Copiar chave privada (cole isso no GitHub Secret)
  cat ~/.ssh/staging_deploy_key
  ```
- **Formato**: Incluir todo o conteúdo, incluindo `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`

### Production Environment

#### `PROD_HOST`
- **Descrição**: Endereço IP ou hostname do servidor de produção
- **Exemplo**: `mestres-do-cafe.com` ou `192.168.1.200`

#### `PROD_USER`
- **Descrição**: Usuário SSH para acesso ao servidor de produção
- **Exemplo**: `deploy`

#### `PROD_SSH_KEY`
- **Descrição**: Chave privada SSH para autenticação no servidor de produção
- **Como gerar**:
  ```bash
  # Gerar chave específica para produção
  ssh-keygen -t ed25519 -C "github-actions-production" -f ~/.ssh/prod_deploy_key

  # Copiar para servidor
  ssh-copy-id -i ~/.ssh/prod_deploy_key.pub PROD_USER@PROD_HOST

  # Copiar chave privada (cole isso no GitHub Secret)
  cat ~/.ssh/prod_deploy_key
  ```

### Setup Completo do Servidor

Execute estes comandos nos servidores de staging e produção:

```bash
# Criar usuário de deploy
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy

# Configurar diretório do projeto
sudo mkdir -p /opt/mestres-do-cafe
sudo chown deploy:deploy /opt/mestres-do-cafe

# Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com | sudo bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clonar repositório
cd /opt/mestres-do-cafe
git clone https://github.com/KallebyX/mestres_do_cafe.git .

# Configurar .env
cp .env.example .env
nano .env  # Editar com valores corretos
```

---

## 🔒 Secrets de Segurança

### `SNYK_TOKEN`
- **Descrição**: Token para scan de vulnerabilidades com Snyk
- **Como obter**:
  1. Acesse [snyk.io](https://snyk.io) e crie uma conta
  2. Vá em **Account Settings** → **General**
  3. Copie o valor de **Auth Token**
- **Workflow usado**: `.github/workflows/security.yml`
- **Opcional**: Workflow continua sem este token (apenas pula o job)

### `GITGUARDIAN_API_KEY`
- **Descrição**: API key para scan de secrets vazados com GitGuardian
- **Como obter**:
  1. Acesse [gitguardian.com](https://www.gitguardian.com) e crie uma conta
  2. Vá em **API** → **Personal Access Tokens**
  3. Crie um novo token com permissões de scan
- **Workflow usado**: `.github/workflows/security.yml`
- **Opcional**: Workflow continua sem esta key

### `CODECOV_TOKEN`
- **Descrição**: Token para upload de relatórios de cobertura
- **Como obter**:
  1. Acesse [codecov.io](https://codecov.io) e conecte seu repositório
  2. Copie o **Repository Upload Token**
- **Workflow usado**: `.github/workflows/tests.yml`
- **Opcional**: Workflow continua sem este token

---

## 🔔 Secrets de Notificação

### `SLACK_WEBHOOK`
- **Descrição**: Webhook URL para enviar notificações de deploy e alertas
- **Como obter**:
  1. No Slack, vá em **Apps** → **Incoming Webhooks**
  2. Clique em **Add to Slack**
  3. Escolha o canal (ex: `#deployments`)
  4. Copie a **Webhook URL**
- **Formato**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
- **Workflows usados**: `.github/workflows/deploy.yml`

#### Configuração do Canal Slack

Crie canais específicos no Slack:

```
#deployments      → Notificações de deploy
#alerts-critical  → Alertas críticos do Prometheus
#alerts-warning   → Alertas de warning
#security-scan    → Resultados de scans de segurança
```

Configure webhooks separados para cada canal se necessário.

---

## ✅ Verificação de Configuração

### Checklist de Secrets

Use esta checklist para garantir que todos os secrets estão configurados:

#### Deploy (Obrigatórios)
- [ ] `STAGING_HOST` - Hostname ou IP do servidor de staging
- [ ] `STAGING_USER` - Usuário SSH de staging
- [ ] `STAGING_SSH_KEY` - Chave privada SSH de staging
- [ ] `PROD_HOST` - Hostname ou IP do servidor de produção
- [ ] `PROD_USER` - Usuário SSH de produção
- [ ] `PROD_SSH_KEY` - Chave privada SSH de produção

#### Segurança (Opcionais)
- [ ] `SNYK_TOKEN` - Token da Snyk para scan de vulnerabilidades
- [ ] `GITGUARDIAN_API_KEY` - API key do GitGuardian
- [ ] `CODECOV_TOKEN` - Token do Codecov para cobertura

#### Notificação (Recomendados)
- [ ] `SLACK_WEBHOOK` - Webhook do Slack para notificações

### Script de Teste

Crie um workflow temporário para testar os secrets:

```yaml
# .github/workflows/test-secrets.yml
name: Test Secrets

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test Staging Secrets
        run: |
          echo "Testing STAGING_HOST..."
          [ -n "${{ secrets.STAGING_HOST }}" ] && echo "✓ STAGING_HOST configured" || echo "✗ STAGING_HOST missing"
          [ -n "${{ secrets.STAGING_USER }}" ] && echo "✓ STAGING_USER configured" || echo "✗ STAGING_USER missing"
          [ -n "${{ secrets.STAGING_SSH_KEY }}" ] && echo "✓ STAGING_SSH_KEY configured" || echo "✗ STAGING_SSH_KEY missing"

      - name: Test Production Secrets
        run: |
          echo "Testing PROD_HOST..."
          [ -n "${{ secrets.PROD_HOST }}" ] && echo "✓ PROD_HOST configured" || echo "✗ PROD_HOST missing"
          [ -n "${{ secrets.PROD_USER }}" ] && echo "✓ PROD_USER configured" || echo "✗ PROD_USER missing"
          [ -n "${{ secrets.PROD_SSH_KEY }}" ] && echo "✓ PROD_SSH_KEY configured" || echo "✗ PROD_SSH_KEY missing"

      - name: Test Security Secrets
        run: |
          [ -n "${{ secrets.SNYK_TOKEN }}" ] && echo "✓ SNYK_TOKEN configured" || echo "⚠ SNYK_TOKEN missing (optional)"
          [ -n "${{ secrets.GITGUARDIAN_API_KEY }}" ] && echo "✓ GITGUARDIAN_API_KEY configured" || echo "⚠ GITGUARDIAN_API_KEY missing (optional)"

      - name: Test Notification Secrets
        run: |
          [ -n "${{ secrets.SLACK_WEBHOOK }}" ] && echo "✓ SLACK_WEBHOOK configured" || echo "⚠ SLACK_WEBHOOK missing (recommended)"
```

Execute este workflow manualmente em **Actions** → **Test Secrets** → **Run workflow**.

### Teste de Conexão SSH

Teste a conexão SSH com os servidores:

```bash
# Local machine
ssh -i ~/.ssh/staging_deploy_key STAGING_USER@STAGING_HOST "echo 'Connection successful!'"
ssh -i ~/.ssh/prod_deploy_key PROD_USER@PROD_HOST "echo 'Connection successful!'"
```

### Teste de Slack Webhook

Teste o webhook do Slack:

```bash
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🧪 Teste de webhook do GitHub Actions",
    "attachments": [{
      "color": "good",
      "fields": [{
        "title": "Status",
        "value": "Webhook configurado com sucesso!",
        "short": false
      }]
    }]
  }'
```

---

## 🔐 Segurança dos Secrets

### Boas Práticas

1. **Nunca commitar secrets** no código
2. **Usar chaves SSH específicas** para cada ambiente
3. **Rotacionar secrets** periodicamente (recomendado: a cada 90 dias)
4. **Limitar permissões** dos usuários SSH ao mínimo necessário
5. **Usar diferentes webhooks** do Slack para staging e produção
6. **Habilitar 2FA** em todas as contas de serviços (Snyk, GitGuardian, etc.)

### Rotação de Secrets

Para rotacionar uma chave SSH:

```bash
# 1. Gerar nova chave
ssh-keygen -t ed25519 -C "github-actions-new" -f ~/.ssh/new_deploy_key

# 2. Adicionar nova chave ao servidor
ssh-copy-id -i ~/.ssh/new_deploy_key.pub USER@HOST

# 3. Testar nova chave
ssh -i ~/.ssh/new_deploy_key USER@HOST "echo 'New key works!'"

# 4. Atualizar secret no GitHub
# Settings → Secrets → Edit SECRET_NAME

# 5. Remover chave antiga do servidor
ssh USER@HOST "sed -i '/github-actions-old/d' ~/.ssh/authorized_keys"

# 6. Remover chave local antiga
rm ~/.ssh/old_deploy_key*
```

### Auditoria de Acesso

Monitore o uso dos secrets:

```bash
# No servidor, verificar últimos acessos SSH
sudo last -i | grep deploy

# Verificar logs de autenticação
sudo tail -f /var/log/auth.log | grep deploy
```

---

## 📚 Recursos Adicionais

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Key Best Practices](https://www.ssh.com/academy/ssh/keygen)
- [Snyk Documentation](https://docs.snyk.io)
- [GitGuardian Documentation](https://docs.gitguardian.com)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

## 🆘 Troubleshooting

### Erro: "Permission denied (publickey)"

```bash
# Verificar se a chave está correta
ssh-keygen -lf ~/.ssh/deploy_key.pub

# Testar conexão com verbose
ssh -vvv -i ~/.ssh/deploy_key USER@HOST

# Verificar permissões da chave
chmod 600 ~/.ssh/deploy_key
```

### Erro: "Host key verification failed"

```bash
# Adicionar host às known_hosts
ssh-keyscan -H HOST >> ~/.ssh/known_hosts

# Ou no workflow, adicionar:
- name: Add SSH known hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.STAGING_HOST }} >> ~/.ssh/known_hosts
```

### Erro: Slack webhook não funciona

```bash
# Testar webhook manualmente
curl -X POST $SLACK_WEBHOOK -H 'Content-Type: application/json' -d '{"text":"Test"}'

# Verificar se o webhook não expirou no Slack
# Settings & administration → Manage apps → Incoming Webhooks
```

### Erro: Snyk authentication failed

```bash
# Verificar se o token está correto
snyk auth $SNYK_TOKEN

# Ou testar via API
curl -X GET "https://snyk.io/api/v1/user/me" \
  -H "Authorization: token $SNYK_TOKEN"
```

---

## 📝 Próximos Passos

Após configurar todos os secrets:

1. ✅ Execute o workflow de teste: `.github/workflows/test-secrets.yml`
2. ✅ Teste um deploy em staging: `workflow_dispatch` → `deploy.yml` → `staging`
3. ✅ Verifique os logs no Slack
4. ✅ Execute os scans de segurança: `security.yml`
5. ✅ Configure alertas do Prometheus com Slack (veja `docs/ALERTMANAGER_SETUP.md`)

---

**Última atualização**: 2025-01-18
**Versão**: 1.0.0
