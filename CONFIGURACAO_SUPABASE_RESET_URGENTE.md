# 🚨 CONFIGURAÇÃO URGENTE - SUPABASE RESET DE SENHA

## 🔧 CONFIGURAÇÕES OBRIGATÓRIAS NO DASHBOARD SUPABASE

### 1. **Configurações de URL no Dashboard**
- Acesse: https://supabase.com/dashboard/project/uicpqeruwwbnqbykymaj
- Vá em: **Settings** → **Authentication** → **URL Configuration**

### 2. **Site URL (OBRIGATÓRIO)**
```
http://localhost:5173
```

### 3. **Redirect URLs (ADICIONAR TODAS)**
```
http://localhost:5173/redefinir-senha
http://localhost:5173/reset-password
http://localhost:5173/login
http://localhost:5173/dashboard
http://localhost:5173/auth/callback
http://localhost:5173/teste-reset
http://localhost:5173/teste-token
```

### 4. **Email Templates (VERIFICAR)**
- Vá em: **Authentication** → **Email Templates**
- Template: **Reset Password**
- Verificar se a URL está como: `{{ .ConfirmationURL }}`

### 5. **CONFIGURAÇÕES CRÍTICAS PARA RESOLVER "TOKEN INVÁLIDO"**

#### A. **Token Expiry Settings**
- Vá em: **Settings** → **Authentication** → **General**
- **JWT expiry**: 3600 (1 hora)
- **Refresh token expiry**: 604800 (7 dias)

#### B. **Email Settings**
- Vá em: **Settings** → **Authentication** → **Email**
- **Confirm email**: Habilitado
- **Email confirmation**: Habilitado
- **Password reset**: Habilitado

#### C. **Security Settings**
- Vá em: **Settings** → **Authentication** → **Security**
- **Password policy**: Configurado
- **Rate limiting**: Configurado adequadamente

### 6. **TEMPLATE DE EMAIL CORRETO**

Verifique se o template está assim:
```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 7. **TESTE ESPECÍFICO PARA SEU CASO**

1. **Envie um novo email de reset para**: `kallebyevangelho03@gmail.com`
2. **Use a nova página de teste**: http://localhost:5173/teste-token
3. **Verifique se o redirect está correto**

### 8. **CONFIGURAÇÃO ADICIONAL - CORS**

Se necessário, adicione estas origens CORS:
```
http://localhost:5173
http://localhost:5174
http://localhost:5175
```

### 9. **VERIFICAÇÃO DE CONFIGURAÇÃO**

Execute estes comandos para verificar:
```bash
# Verificar se as variáveis estão carregadas
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Acessar página de teste
open http://localhost:5173/teste-token
```

### 10. **PROBLEMÁTICA IDENTIFICADA**

O problema "Token inválido ou expirado" pode ser causado por:

1. **URL de redirect incorreta** no dashboard
2. **Template de email** com URL errada
3. **Configurações de JWT** muito restritivas
4. **Tempo de expiração** muito baixo
5. **Configuração de CORS** inadequada

---

## 🆘 PASSOS PARA RESOLVER AGORA

1. **Acesse o dashboard Supabase**
2. **Configure todas as URLs acima**
3. **Envie um novo email de reset**
4. **Use a URL**: http://localhost:5173/teste-token
5. **Verifique os logs na nova página de teste**

---

## 📞 SUPORTE

Se o problema persistir:
- Verifique se o email template está correto
- Confirme se as URLs estão todas configuradas
- Use a página de teste para diagnóstico detalhado 