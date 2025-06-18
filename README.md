# ☕ Mestres do Café - Frontend

<div align="center">

![Mestres do Café](https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=400&fit=crop&crop=center)

**Aplicação web responsiva para torrefação artesanal de cafés especiais**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.7-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

[🚀 Demo](#demo) • [📦 Instalação](#instalação) • [🎯 Funcionalidades](#funcionalidades) • [🛠️ Tecnologias](#tecnologias)

</div>

---

## 📋 Sobre o Projeto

O **Mestres do Café** é uma aplicação web moderna e responsiva desenvolvida para uma torrefação artesanal de cafés especiais localizada em Santa Maria - RS. Com mais de 5 anos de experiência no mercado, a empresa busca oferecer uma experiência digital única para seus clientes.

### 🎯 Objetivos

- ✅ **Interface moderna e responsiva** para todos os dispositivos
- ✅ **Sistema completo de autenticação** (login/cadastro)
- ✅ **Catálogo de produtos** com cafés especiais
- ✅ **Experiência de usuário fluida** e intuitiva
- ✅ **Performance otimizada** com Vite e React 19

---

## 🚀 Demo

### 🌐 Aplicação Online
> **Em desenvolvimento** - Deploy será disponibilizado em breve

### 💻 Execução Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mestres-do-cafe-frontend.git

# Entre na pasta do projeto
cd mestres-do-cafe-frontend

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Acesse no navegador
http://localhost:5173
```

---

## 🎯 Funcionalidades

### 🔐 Sistema de Autenticação
- [x] **Login completo** com validação em tempo real
- [x] **Cadastro de usuários** (Pessoa Física/Jurídica)
- [x] **Validação de dados** (email, senha, campos obrigatórios)
- [x] **Sessão persistente** com localStorage
- [x] **Proteção de rotas** baseada em autenticação
- [x] **Logout funcional** com limpeza de dados

### 🛒 E-commerce (Em desenvolvimento)
- [ ] Catálogo de produtos
- [ ] Carrinho de compras
- [ ] Sistema de pedidos
- [ ] Painel administrativo

### 🎨 Interface
- [x] **Design responsivo** para mobile, tablet e desktop
- [x] **Componentes reutilizáveis** com Radix UI
- [x] **Animações suaves** com Framer Motion
- [x] **Tema escuro/claro** (suporte futuro)
- [x] **Feedback visual** (loading, mensagens)

### 🧪 Sistema Mock para Testes
- [x] **API simulada** usando localStorage
- [x] **Dados persistentes** entre sessões
- [x] **Usuário admin** pré-configurado
- [x] **Validações completas** de frontend

---

## 🛠️ Tecnologias

### Frontend Core
- **[React 19.1.0](https://reactjs.org/)** - Biblioteca principal
- **[Vite 6.3.5](https://vitejs.dev/)** - Build tool e dev server
- **[React Router DOM](https://reactrouter.com/)** - Roteamento
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários

### UI/UX
- **[TailwindCSS 4.1.7](https://tailwindcss.com/)** - Framework CSS
- **[Radix UI](https://www.radix-ui.com/)** - Componentes primitivos
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[Framer Motion](https://www.framer.com/motion/)** - Animações
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Desenvolvimento
- **[ESLint](https://eslint.org/)** - Linting
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem (configurado)
- **[Zod](https://zod.dev/)** - Validação de schemas

---

## 📦 Instalação

### Pré-requisitos
- **Node.js** 18+ 
- **npm** ou **pnpm**

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/mestres-do-cafe-frontend.git
cd mestres-do-cafe-frontend
```

2. **Instale as dependências**
```bash
npm install
# ou
pnpm install
```

3. **Execute em desenvolvimento**
```bash
npm run dev
# ou
pnpm dev
```

4. **Acesse a aplicação**
```
http://localhost:5173
```

### 🔧 Scripts Disponíveis

```bash
npm run dev      # Executa em modo desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Executa o linter
```

---

## 🧪 Como Testar

### 1. Sistema de Autenticação

#### Login com usuário admin:
```
Email: admin@mestrescafe.com.br
Senha: admin123
```

#### Cadastro de novo usuário:
1. Acesse `/register`
2. Preencha o formulário
3. Teste validações (email duplicado, senhas diferentes, etc.)

### 2. Funcionalidades Testadas

| Funcionalidade | Status | Descrição |
|----------------|---------|-----------|
| ✅ Login | Funcionando | Autenticação completa |
| ✅ Cadastro | Funcionando | Formulário com validações |
| ✅ Validações | Funcionando | Email, senha, campos obrigatórios |
| ✅ Persistência | Funcionando | Sessão mantida após reload |
| ✅ Logout | Funcionando | Limpeza de dados |
| ✅ Responsividade | Funcionando | Mobile, tablet, desktop |

---

## 🏗️ Estrutura do Projeto

```
mestres-do-cafe-frontend/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes de UI (Radix)
│   │   ├── Header.jsx     # Cabeçalho da aplicação
│   │   ├── Footer.jsx     # Rodapé
│   │   └── ...
│   ├── contexts/          # Contextos React
│   │   ├── AuthContext.jsx   # Gerenciamento de autenticação
│   │   └── CartContext.jsx   # Carrinho (futuro)
│   ├── pages/             # Páginas da aplicação
│   │   ├── LandingPage.jsx   # Página inicial
│   │   ├── LoginPage.jsx     # Login
│   │   ├── RegisterPage.jsx  # Cadastro
│   │   └── ...
│   ├── lib/               # Bibliotecas e utilitários
│   │   ├── api.js         # API mock e configuração
│   │   └── utils.js       # Funções utilitárias
│   ├── hooks/             # Custom hooks
│   └── assets/            # Imagens e recursos
├── COMO_TESTAR.md         # Instruções de teste
├── TESTE_MANUAL.md        # Relatório de testes
└── README.md              # Este arquivo
```

---

## 🎨 Screenshots

### 📱 Página Inicial
![Landing Page](https://via.placeholder.com/800x400/2B3A42/C8956D?text=Landing+Page)

### 🔐 Sistema de Login
![Login](https://via.placeholder.com/800x400/2B3A42/C8956D?text=Login+Page)

### 📝 Cadastro de Usuário
![Register](https://via.placeholder.com/800x400/2B3A42/C8956D?text=Register+Page)

---

## 🚀 Próximas Funcionalidades

### 🛒 E-commerce
- [ ] Catálogo de produtos completo
- [ ] Carrinho de compras funcional
- [ ] Sistema de checkout
- [ ] Integração com gateway de pagamento
- [ ] Histórico de pedidos

### 🎛️ Painel Admin
- [ ] Dashboard administrativo
- [ ] Gerenciamento de produtos
- [ ] Controle de estoque
- [ ] Relatórios de vendas
- [ ] Gestão de usuários

### 🔧 Melhorias Técnicas
- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes E2E (Cypress/Playwright)
- [ ] PWA (Progressive Web App)
- [ ] SEO otimizado
- [ ] Performance monitoring

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### 📋 Guidelines
- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use commits semânticos

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato

### 🏢 Mestres do Café
- **Localização:** Santa Maria - RS, Brasil
- **Experiência:** 5+ anos no mercado
- **Especialidade:** Torrefação artesanal de cafés especiais

### 👨‍💻 Desenvolvimento
- **GitHub:** [@seu-usuario](https://github.com/seu-usuario)
- **LinkedIn:** [Seu Nome](https://linkedin.com/in/seu-perfil)
- **Email:** contato@mestrescafe.com.br

---

## 🙏 Agradecimentos

- [React Team](https://reactjs.org/) pela excelente biblioteca
- [Vite Team](https://vitejs.dev/) pela ferramenta de build incrível
- [Tailwind Team](https://tailwindcss.com/) pelo framework CSS
- [Radix UI](https://www.radix-ui.com/) pelos componentes acessíveis
- [Unsplash](https://unsplash.com/) pelas imagens de qualidade

---

<div align="center">

**⭐ Deixe uma estrela se este projeto te ajudou!**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)]()
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)]()
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite)]()

</div> # mestres_do_cafe
