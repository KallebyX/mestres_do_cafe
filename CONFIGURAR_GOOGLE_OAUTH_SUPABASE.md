# 🔐 CONFIGURAR GOOGLE OAUTH NO SUPABASE - GUIA COMPLETO

## ✅ **CREDENCIAIS JÁ CONFIGURADAS NO SISTEMA:**

- ✅ **Frontend:** `http://localhost:5173` 
- ✅ **Backend:** `http://localhost:5000`
- ✅ **Arquivo .env** atualizado com suas credenciais Supabase
- ✅ **Botões Google** já implementados nas páginas

---

## 🚀 **ÚLTIMA ETAPA - CONFIGURAR NO SUPABASE DASHBOARD:**

### **📍 1. ACESSE SEU PROJETO SUPABASE:**
```
https://supabase.com/dashboard/project/uicpqeruwwbnqbykymaj
```

### **📍 2. NAVEGUE PARA AUTHENTICATION:**
1. **Menu lateral esquerdo** → 🔐 **"Authentication"**
2. **Submenu** → ⚙️ **"Settings"**
3. **Aba** → 🌐 **"Auth Providers"**

### **📍 3. CONFIGURAR GOOGLE PROVIDER:**

#### **3.1 - Encontre "Google" na lista:**
- Procure pelo ícone do **Google** na lista de provedores
- **Clique no toggle** para **ATIVAR**

#### **3.2 - Preencha os campos:**
```
✅ Google enabled: ATIVADO (toggle ligado)

📋 Client ID (OAuth 2.0):
[SEU_GOOGLE_CLIENT_ID_AQUI]

🔑 Client Secret (OAuth 2.0):
[SEU_GOOGLE_CLIENT_SECRET_AQUI]

🔗 Authorized redirect URLs:
https://uicpqeruwwbnqbykymaj.supabase.co/auth/v1/callback

🎯 Additional Scopes (opcional):
email,profile
```

**⚠️ IMPORTANTE:** As credenciais OAuth devem ser obtidas no Google Cloud Console e mantidas seguras.

#### **3.3 - Salvar configuração:**
- **Clique:** 💾 **"Save"** ou **"Update"**

---

## 🎯 **CONFIGURAÇÃO NO GOOGLE CLOUD CONSOLE:**

### **📍 4. CONFIGURAR URLS AUTORIZADAS:**

#### **4.1 - Acesse Google Cloud Console:**
```
https://console.cloud.google.com/apis/credentials
```

#### **4.2 - Encontre seu Client ID:**
- Procure por seu Client ID configurado
- **Clique para editar**

#### **4.3 - Adicionar URLs autorizadas:**

**👉 Origens JavaScript autorizadas:**
```
http://localhost:5173
https://uicpqeruwwbnqbykymaj.supabase.co
```

**👉 URIs de redirecionamento autorizados:**
```
http://localhost:5173/auth/callback
https://uicpqeruwwbnqbykymaj.supabase.co/auth/v1/callback
```

#### **4.4 - Salvar:**
- **Clique:** 💾 **"Salvar"**

---

## 🧪 **TESTAR O GOOGLE LOGIN:**

### **✅ APÓS CONFIGURAR:**

1. **Acesse:** `http://localhost:5173/login`
2. **Clique:** "Continuar com Google" 
3. **Deve abrir:** Popup do Google para autorização
4. **Após autorizar:** Redirecionamento para `/dashboard`

### **✅ OU TESTE O CADASTRO:**

1. **Acesse:** `http://localhost:5173/registro`
2. **Clique:** "Continuar com Google"
3. **Conta criada automaticamente** e login efetuado

---

## 🔧 **TROUBLESHOOTING:**

### **❌ Se der erro "redirect_uri_mismatch":**
- Verifique se as URLs no Google Cloud Console estão **exatamente** como mostrado acima

### **❌ Se der erro "OAuth client not found":**
- Confirme se o Client ID está correto no Supabase

### **❌ Se não aparecer o popup:**
- Verifique se seu navegador não está bloqueando popups
- Teste em modo anônimo/privado

---

## 🎉 **FUNCIONALIDADES APÓS CONFIGURAÇÃO:**

### **🚀 Login com Google funcionará:**
- ✅ **Página Login:** Botão "Continuar com Google"
- ✅ **Página Cadastro:** Botão "Continuar com Google" 
- ✅ **Criação automática** de perfil do usuário
- ✅ **Sincronização** de nome, email e avatar
- ✅ **Redirecionamento** automático para dashboard

### **👤 Perfil criado automaticamente com:**
- **Nome completo** do Google
- **Email** verificado
- **Avatar** do Google
- **Tipo:** Cliente Pessoa Física
- **Provider:** Google OAuth

---

## 📱 **LINKS IMPORTANTES:**

- **🏠 Sistema:** http://localhost:5173
- **🔐 Login:** http://localhost:5173/login
- **📝 Cadastro:** http://localhost:5173/registro
- **👑 Admin:** admin@mestrescafe.com / admin123
- **🛡️ Supabase:** https://supabase.com/dashboard/project/uicpqeruwwbnqbykymaj

---

**🎯 RESUMO:** Você só precisa configurar o Google Provider no Supabase Dashboard (passo 3) e ajustar as URLs no Google Cloud Console (passo 4). Depois disso, o login com Google funcionará perfeitamente!

**🔒 SEGURANÇA:** Mantenha suas credenciais OAuth em segurança e nunca as compartilhe publicamente. 