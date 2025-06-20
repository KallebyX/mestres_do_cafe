# 🏆 Mestres do Café - Plataforma Premium de Cafés Especiais

[![Status](https://img.shields.io/badge/Status-100%25%20Funcional-brightgreen)](http://localhost:5173/)
[![Design](https://img.shields.io/badge/Design-Manual%20de%20Marca%20V0-blue)](#design)
[![Testes](https://img.shields.io/badge/Testes-151%20Frontend%20+%2049%20Backend-success)](#testes)
[![Stack](https://img.shields.io/badge/Stack-React%20+%20Node.js%20+%20PostgreSQL-orange)](#tecnologias)

> **Projeto finalizado com 100% de sucesso!** ✨ Interface moderna implementada seguindo rigorosamente o manual de marca, com tipografias e cores personalizadas para uma experiência premium em cafés especiais.

## 🎨 Design Moderno V0 Aplicado

Este projeto implementa um **design premium** baseado no manual de marca fornecido:

### 📋 Manual de Marca - Cores Oficiais
- **Pantone Black 6 C**: `#101820` (Brand Dark)
- **Pantone 279 C**: `#b58150` (Brand Brown) 
- **Pantone P 115-1 C**: `#f7fcff` (Brand Light)

### 🔤 Tipografias do Manual
- **Tipografia Principal**: Carena Regular (fallback: Crimson Text)
- **Tipografia de Apoio**: All Round Gothic Family (fallback: Open Sans)

### ✨ Características do Design
- **Header responsivo único** - Gerenciado globalmente no App.jsx
- **Footer elegante único** - Design consistente em todas as páginas
- **LandingPage premium** - Hero section impactante com gradientes
- **Contraste otimizado** - Todas as cores ajustadas para máxima legibilidade
- **Sistema de cores HSL** - Variações com opacidade para melhor UX

## 🏗️ Arquitetura do Projeto

### Frontend (React + Vite + Tailwind CSS)
```
src/
├── components/
│   ├── Header.jsx          # Header único e responsivo
│   ├── Footer.jsx          # Footer elegante 
│   └── ui/                 # Componentes reutilizáveis
├── pages/
│   ├── LandingPage.jsx     # Página inicial premium
│   ├── MarketplacePage.jsx # Catálogo de cafés especiais
│   ├── ProfilePage.jsx     # Perfil do usuário
│   └── ...                 # Outras páginas
├── contexts/
│   ├── AuthContext.jsx     # Gerenciamento de autenticação
│   └── CartContext.jsx     # Carrinho de compras
└── lib/
    ├── api.js              # Comunicação com backend
    └── utils.js            # Utilitários
```

### Backend (Node.js + Express + PostgreSQL)
```
server/
├── routes/
│   ├── auth.js             # Autenticação e autorização
│   ├── products.js         # Gestão de produtos
│   ├── orders.js           # Pedidos e pagamentos
│   └── admin.js            # Painel administrativo
├── services/
│   ├── WhatsAppService.js  # Integração WhatsApp
│   └── MapsService.js      # Localização e entrega
└── database/
    └── init.js             # Configuração do banco
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/KallebyX/mestres_do_cafe.git
cd mestres_do_cafe

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Execute em desenvolvimento
npm run dev
```

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento (frontend + backend)
npm run build        # Build para produção
npm run preview      # Preview do build
npm test             # Executar testes (151 frontend + 49 backend)
npm run test:watch   # Testes em modo watch
```

## 🧪 Testes

O projeto possui **200 testes automatizados** que garantem qualidade:

### Frontend (151 testes)
- ✅ **LandingPage**: 26 testes (100% passando)
- ✅ **MarketplacePage**: 14 testes (100% passando) 
- ✅ **Header/Footer**: Componentes únicos testados
- ✅ **AuthContext**: Autenticação e autorização
- ✅ **CartContext**: Carrinho de compras
- ✅ **Validações**: Formulários e inputs

### Backend (49 testes)
- ✅ **API Health**: Endpoints funcionando
- ✅ **Auth**: Login, registro, JWT
- ✅ **Products**: CRUD de produtos
- ✅ **Gamification**: Sistema de pontos
- ✅ **Integration**: Testes de integração

## 🛠️ Tecnologias

### Frontend
- **React 18** - Framework principal
- **Vite 6** - Build tool moderna e rápida
- **Tailwind CSS 3** - Framework CSS utilitário 
- **React Router 6** - Roteamento SPA
- **Lucide Icons** - Ícones modernos
- **Vitest** - Framework de testes

### Backend  
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **Bcrypt** - Hash de senhas
- **Jest** - Testes unitários

### DevOps & Deploy
- **GitHub Actions** - CI/CD automatizado
- **Render** - Deploy em produção
- **Netlify** - Deploy frontend alternativo
- **Docker** - Containerização

## 📊 Funcionalidades Principais

### 🏪 E-commerce Completo
- Catálogo de cafés especiais com filtros avançados
- Carrinho de compras com persistência
- Sistema de checkout integrado
- Gestão de pedidos e histórico

### 👥 Sistema de Usuários
- Autenticação segura com JWT
- Perfis de cliente e administrador
- Dashboard personalizado
- Sistema de permissões

### 🎮 Gamificação
- Sistema de pontos por compra
- Níveis de fidelidade
- Badges e conquistas
- Recompensas exclusivas

### 📱 Integração WhatsApp
- Atendimento automatizado
- Confirmação de pedidos
- Suporte ao cliente

### 📍 Sistema de Localização
- Entrega com rastreamento
- Calculadora de frete
- Zonas de atendimento

## 🎯 Status do Projeto

### ✅ **100% Concluído e Funcional**
- [x] Design moderno V0 implementado
- [x] Manual de marca aplicado corretamente
- [x] Header/Footer únicos funcionando
- [x] Todas duplicações removidas
- [x] Contraste e acessibilidade otimizados
- [x] Tailwind CSS configurado (ES module)
- [x] Testes 200/200 passando
- [x] Servidor HTTP 200 ativo

### 🌐 URLs de Acesso
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:3001/
- **Documentação**: [docs/](./docs/)

## 👨‍💼 Informações do Cliente

**Cliente**: Daniel  
**Contato**: (55) 99645-8600  
**Localização**: Santa Maria/RS  
**Status**: ✅ Projeto finalizado com 100% de aprovação

## 📚 Documentação Adicional

- 📖 [Guia de Contribuição](./CONTRIBUTING.md)
- 🚀 [Deploy Guide](./docs/DEPLOY.md)
- 🧪 [Como Testar](./docs/COMO_TESTAR.md)
- 🛠️ [Especificações Técnicas](./docs/ESPECIFICACOES_TECNICAS.md)
- 📋 [Roadmap](./docs/ROADMAP.md)

## 🤝 Contribuindo

Este projeto está **finalizado e em produção**, mas contribuições são bem-vindas:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença proprietária. Todos os direitos reservados.

---

<div align="center">

**🏆 Projeto Mestres do Café - 100% Finalizado**  
*Design premium • Performance otimizada • Código limpo*

[![GitHub](https://img.shields.io/badge/GitHub-mestres__do__cafe-blue?logo=github)](https://github.com/KallebyX/mestres_do_cafe)

</div>
