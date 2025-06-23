# 🚀 Guia de Início Rápido - Mestres do Café

> **⚡ Configure e execute o sistema completo em menos de 5 minutos**

## 📋 **Pré-requisitos**

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Conta Supabase** gratuita ([supabase.com](https://supabase.com))
- **Editor de código** (VS Code recomendado)

## 🏃‍♂️ **Instalação Express (5 minutos)**

### **1. Clone e Configure**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend

# Instale dependências
npm install

# Configure ambiente
cp env.example .env
```

### **2. Configure o Supabase**

#### **2.1 Crie um Projeto**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Nome: `mestres-do-cafe`
4. Database Password: `sua_senha_segura`
5. Aguarde ~2 minutos para criação

#### **2.2 Execute o SQL Setup**
1. No Supabase Dashboard → **SQL Editor**
2. Cole e execute o conteúdo de `database/setup-completo.sql`
3. Aguarde confirmação: **"Success. No rows returned"**

#### **2.3 Configure as Chaves**
1. No Supabase → **Settings** → **API**
2. Copie `Project URL` e `anon public`
3. Edite o arquivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA

# Google OAuth (opcional)
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

### **3. Execute o Sistema**
```bash
# Iniciar em desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:5173
```

## 🎯 **Primeiros Passos**

### **Credenciais de Teste**
```
👨‍💼 Administrador:
Email: admin@mestrescafe.com
Senha: admin123

👤 Cliente PF:
Email: cliente@teste.com  
Senha: 123456

🏢 Cliente PJ:
Email: empresa@teste.com
Senha: 123456
```

### **URLs Principais**
- **Homepage**: http://localhost:5173/
- **Marketplace**: http://localhost:5173/marketplace
- **Login**: http://localhost:5173/login
- **Admin Dashboard**: http://localhost:5173/admin/dashboard
- **CRM**: http://localhost:5173/admin/crm

## 🧪 **Verificação Rápida**

### **Teste o Sistema (2 minutos)**
```bash
# Execute os testes
npm test

# Verifique build
npm run build

# Preview de produção
npm run preview
```

### **Checklist de Funcionamento**
- [ ] ✅ Login funciona (admin@mestrescafe.com)
- [ ] ✅ Dashboard carrega com dados
- [ ] ✅ Marketplace mostra produtos
- [ ] ✅ CRM lista clientes
- [ ] ✅ Carrinho adiciona produtos
- [ ] ✅ Gamificação mostra pontos

## 🛠️ **Configurações Avançadas**

### **Google OAuth (Opcional)**
1. Acesse [Google Console](https://console.developers.google.com)
2. Crie um projeto ou use existente
3. Habilite **Google+ API**
4. Crie credenciais OAuth 2.0
5. Adicione domínio autorizado: `http://localhost:5173`
6. Cole Client ID no `.env`

### **Deploy em Produção**

#### **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### **Netlify**
```bash
# Build local
npm run build

# Arrastar pasta 'dist' para netlify.com
# Ou conectar repositório GitHub
```

## 🔧 **Resolução de Problemas**

### **Erro: "Supabase client error"**
```bash
# Verifique se as chaves estão corretas no .env
# Reinicie o servidor
npm run dev
```

### **Erro: "Cannot connect to database"**
```bash
# Verifique se executou o SQL setup
# Confirme se o projeto Supabase está ativo
```

### **Erro: "Build failed"**
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Erro: "Tests failing"**
```bash
# Execute testes específicos
npm test -- --run
npm test -- --coverage
```

## 📚 **Próximos Passos**

### **Personalização**
1. **Cores**: Edite `tailwind.config.js`
2. **Logo**: Substitua arquivos em `public/assets/logo/`
3. **Textos**: Edite componentes em `src/pages/`
4. **Produtos**: Adicione via Admin Dashboard

### **Funcionalidades Extras**
- [ ] 💳 Integrar gateway de pagamento
- [ ] 📧 Configurar SMTP para emails
- [ ] 📱 Implementar PWA
- [ ] 🤖 Adicionar chatbot
- [ ] 🚚 Integrar APIs de frete

### **Documentação Completa**
- 📖 [Especificações Técnicas](./ESPECIFICACOES_TECNICAS.md)
- 🚀 [Guia de Deploy](./DEPLOY.md)
- 🧪 [Como Testar](./COMO_TESTAR.md)
- 🔧 [Configuração Supabase](./SUPABASE_SETUP.md)

## 💡 **Dicas de Desenvolvimento**

### **Scripts Úteis**
```bash
# Desenvolvimento com logs
npm run dev -- --debug

# Build com análise
npm run build -- --analyze

# Testes específicos
npm test -- --grep "Auth"

# Linting com correção
npm run lint -- --fix
```

### **Extensões VS Code Recomendadas**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Auto Rename Tag

### **Atalhos de Produtividade**
- `Ctrl + Shift + P` → Palette de comandos
- `Ctrl + `` ` → Terminal integrado
- `Alt + Click` → Múltiplos cursores
- `Ctrl + D` → Selecionar próxima ocorrência

## 🏆 **Sistema em Funcionamento**

Parabéns! 🎉 Agora você tem:

- ✅ **E-commerce completo** funcionando
- ✅ **CRM avançado** para gestão
- ✅ **Sistema de gamificação** ativo
- ✅ **Dashboard administrativo** operacional
- ✅ **Autenticação segura** configurada
- ✅ **Banco de dados** estruturado

### **Suporte & Comunidade**
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/mestres-do-cafe-frontend/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/mestres-do-cafe-frontend/discussions)
- 📧 **Email**: seu-email@exemplo.com
- 🔗 **LinkedIn**: [Seu Perfil](https://linkedin.com/in/seu-perfil)

---

<div align="center">

**🚀 Sistema Operacional em 5 Minutos!**

[![Deploy](https://img.shields.io/badge/Deploy-Live-success)](https://mestres-do-cafe.vercel.app)
[![Docs](https://img.shields.io/badge/Docs-Completa-blue)](./README.md)

*Feito com ❤️ e muito ☕*

**[🌐 Demo Live](https://mestres-do-cafe.vercel.app) | [📚 Docs](../README.md) | [🚀 Deploy](./DEPLOY.md)**

</div> 