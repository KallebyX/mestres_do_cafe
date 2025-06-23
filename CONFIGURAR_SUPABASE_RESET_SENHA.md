# 🔧 CONFIGURAÇÃO SUPABASE - REDEFINIÇÃO DE SENHA

## ⚠️ **PROBLEMA IDENTIFICADO:**
O link de redefinição de senha no email está redirecionando para a página errada.

## 🛠️ **SOLUÇÃO - CONFIGURAÇÃO SUPABASE:**

### **📍 1. ACESSAR SUPABASE DASHBOARD:**
```
https://supabase.com/dashboard/project/uicpqeruwwbnqbykymaj
```

### **📍 2. CONFIGURAR AUTHENTICATION:**

#### **🔗 Site URL e Redirect URLs:**
1. **Navegue:** Authentication → Settings
2. **Encontre:** "Site URL"
3. **Configure:**
   ```
   Site URL: http://localhost:5173
   ```

4. **Encontre:** "Redirect URLs"
5. **Adicione as seguintes URLs:**
   ```
   http://localhost:5173/redefinir-senha
   http://localhost:5173/auth/callback
   https://seudominio.com/redefinir-senha (para produção)
   ```

### **📍 3. CONFIGURAR EMAIL TEMPLATES:**

#### **📧 Reset Password Template:**
1. **Navegue:** Authentication → Email Templates
2. **Selecione:** "Reset Password"
3. **Configure o Subject:**
   ```
   Redefinir sua senha - Mestres do Café
   ```

4. **Configure o Body HTML:**
   ```html
   <h2>Redefinir sua senha - Mestres do Café</h2>
   <p>Olá!</p>
   <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para definir uma nova senha:</p>
   
   <div style="text-align: center; margin: 30px 0;">
     <a href="{{ .SiteURL }}/redefinir-senha?access_token={{ .TokenHash }}&type=recovery" 
        style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
       🔒 Redefinir Minha Senha
     </a>
   </div>
   
   <p><strong>⚠️ Importante:</strong></p>
   <ul>
     <li>Este link expira em <strong>1 hora</strong></li>
     <li>Se você não solicitou esta redefinição, ignore este email</li>
     <li>Por segurança, não compartilhe este link</li>
   </ul>
   
   <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
   <p style="font-size: 12px; color: #666;">
     Mestres do Café - Cafés Especiais Certificados SCA<br>
     Este é um email automático, não responda.
   </p>
   ```

### **📍 4. VERIFICAR CONFIGURAÇÕES AVANÇADAS:**

#### **🔐 Auth Settings:**
1. **Navegue:** Authentication → Settings → Auth
2. **Verifique:**
   ```
   ✅ Enable email confirmations: ON
   ✅ Enable phone confirmations: OFF (se não usar)
   ⏰ JWT expiry limit: 3600 (1 hora)
   🔄 Refresh token rotation: ON
   ```

#### **📧 SMTP Settings (Opcional):**
Se quiser personalizar o envio de emails:
1. **Navegue:** Authentication → Settings → SMTP
2. **Configure seu provedor de email:**
   ```
   Host: smtp.gmail.com (exemplo)
   Port: 587
   Username: seu@email.com
   Password: sua_senha_app
   ```

---

## 🧪 **TESTANDO A CONFIGURAÇÃO:**

### **✅ 1. Teste Local:**
1. Acesse: `http://localhost:5173/login`
2. Clique em: **"Esqueci minha senha"**
3. Digite um email válido
4. Verifique se recebe o email
5. Clique no link do email
6. Verifique se redireciona para: `/redefinir-senha?access_token=...&type=recovery`

### **✅ 2. Verificar Console:**
Abra o **DevTools** (F12) e veja no Console:
- Mensagens de sucesso/erro
- Parâmetros da URL
- Logs de redirecionamento

### **✅ 3. Teste Completo:**
1. **Solicitar redefinição** ✅
2. **Receber email** ✅  
3. **Clicar no link** ✅
4. **Redirecionar corretamente** ✅
5. **Definir nova senha** ✅
6. **Fazer login** com nova senha ✅

---

## 🔍 **DEBUGGING - SE NÃO FUNCIONAR:**

### **🐛 Problema 1: Link redireciona para lugar errado**
**Solução:**
- Verificar "Site URL" no Supabase
- Verificar "Redirect URLs" no Supabase
- Limpar cache do navegador

### **🐛 Problema 2: Token inválido ou expirado**
**Solução:**
- Verificar se URL contém `access_token` e `type=recovery`
- Solicitar novo link (tokens expiram em 1 hora)
- Verificar configurações JWT no Supabase

### **🐛 Problema 3: Email não chega**
**Solução:**
- Verificar pasta de spam
- Testar com email diferente
- Verificar configurações SMTP (se configurado)

### **🐛 Problema 4: Erro 400 na página**
**Solução:**
- Verificar console do navegador
- Verificar logs do Supabase
- Verificar se as URLs estão corretas

---

## 📋 **CHECKLIST FINAL:**

### **🔧 Configuração Supabase:**
- [ ] Site URL configurada
- [ ] Redirect URLs adicionadas
- [ ] Template de email personalizado
- [ ] Configurações Auth verificadas

### **💻 Código Frontend:**
- [ ] Função `requestPasswordReset` funcionando
- [ ] Página `/esqueci-senha` criada
- [ ] Página `/redefinir-senha` criada
- [ ] Rotas adicionadas no App.jsx
- [ ] Link no login funcionando

### **🧪 Testes:**
- [ ] Solicitar redefinição funciona
- [ ] Email é recebido
- [ ] Link do email funciona
- [ ] Redefinição de senha funciona
- [ ] Login com nova senha funciona

---

## 🎯 **URLs IMPORTANTES:**

### **🌐 URLs de Desenvolvimento:**
```
Frontend: http://localhost:5173
Backend: http://localhost:5000
Esqueci Senha: http://localhost:5173/esqueci-senha
Redefinir Senha: http://localhost:5173/redefinir-senha
```

### **📧 URLs do Email:**
```
Template Link: {{ .SiteURL }}/redefinir-senha?access_token={{ .TokenHash }}&type=recovery
Resultado: http://localhost:5173/redefinir-senha?access_token=ABC123&type=recovery
```

---

**🏆 SEGUINDO ESTE GUIA, O SISTEMA DE REDEFINIÇÃO FUNCIONARÁ PERFEITAMENTE!** 