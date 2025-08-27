# 🚀 Mestres do Café - Sistema E-commerce & ERP

Sistema completo de e-commerce e ERP para torrefação artesanal de café, com integração de pagamentos (Mercado Pago), frete (Melhor Envio) e gestão completa.

## 📋 Características Principais

### Frontend (React + Vite)
- **E-commerce Completo**: Catálogo de produtos, carrinho, checkout
- **Sistema de Avaliações**: Reviews de produtos com rating
- **Dashboard Admin**: Gestão de produtos, pedidos, clientes
- **Analytics**: Dashboards com gráficos e métricas
- **Design Responsivo**: Mobile-first com Tailwind CSS
- **PWA Ready**: Funciona offline e pode ser instalado

### Backend (Flask + PostgreSQL)
- **API RESTful**: Endpoints completos para todas funcionalidades
- **Autenticação JWT**: Sistema seguro com tokens
- **Integração Mercado Pago**: Pagamentos PIX, cartão, boleto
- **Integração Melhor Envio**: Cálculo de frete e rastreamento
- **Sistema de Cache**: Redis para otimização
- **WebHooks**: Processamento assíncrono de eventos

### Funcionalidades
- ✅ Catálogo de produtos com filtros
- ✅ Carrinho de compras
- ✅ Sistema de cupons
- ✅ Múltiplos métodos de pagamento
- ✅ Cálculo de frete automático
- ✅ Rastreamento de pedidos
- ✅ Sistema de notificações
- ✅ Gestão de estoque
- ✅ Relatórios e analytics
- ✅ Sistema de reviews
- ✅ Blog integrado
- ✅ Newsletter

## 🛠️ Stack Tecnológica

### Frontend
- React 18
- Vite 5
- Tailwind CSS
- React Router DOM
- React Query
- React Hook Form
- Recharts (gráficos)
- Axios

### Backend
- Python 3.9+
- Flask 2.3
- SQLAlchemy (ORM)
- PostgreSQL
- Redis (cache)
- Gunicorn (produção)
- JWT Extended

### Infraestrutura
- Render (deploy)
- PostgreSQL (banco de dados)
- Redis (cache e sessões)
- GitHub (versionamento)

## 🚀 Instalação Local

### Pré-requisitos
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- Redis (opcional)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/mestres_do_cafe.git
cd mestres_do_cafe
```

### 2. Configure o Backend

```bash
# Instale as dependências
cd apps/api
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp ../../.env.example ../../.env
# Edite o arquivo .env com suas configurações

# Crie o banco de dados
createdb mestres_cafe

# Inicie o servidor
python app.py
```

### 3. Configure o Frontend

```bash
# Em outro terminal
cd apps/web
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### 4. Acesse o sistema
- Frontend: http://localhost:3000
- API: http://localhost:5002/api/health
- Admin: http://localhost:3000/admin

## 📦 Deploy no Render

### Deploy Rápido (via render.yaml)

1. Fork este repositório
2. Conecte no Render
3. Crie um Blueprint e selecione o repositório
4. Configure as variáveis de ambiente necessárias
5. Deploy automático será iniciado

### Deploy Manual

Siga o guia completo em [DEPLOY_RENDER.md](DEPLOY_RENDER.md)

## 🔐 Variáveis de Ambiente

### Essenciais
```env
# Segurança
SECRET_KEY=sua-chave-secreta-32-chars
JWT_SECRET_KEY=sua-jwt-key-32-chars

# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/mestres_cafe

# APIs Externas
MERCADO_PAGO_ACCESS_TOKEN=seu-token
MELHOR_ENVIO_API_KEY=sua-api-key
```

Veja [.env.example](.env.example) para lista completa.

## 📚 Documentação

- [Guia de Deploy](DEPLOY_RENDER.md)
- [API Documentation](docs/api.md) *(em breve)*
- [Frontend Components](docs/components.md) *(em breve)*
- [Database Schema](docs/database.md) *(em breve)*

## 🧪 Testes

```bash
# Backend
cd apps/api
pytest

# Frontend
cd apps/web
npm test
```

## 📊 Estrutura do Projeto

```
mestres_do_cafe/
├── apps/
│   ├── api/                # Backend Flask
│   │   ├── src/
│   │   │   ├── app.py       # Aplicação principal
│   │   │   ├── config.py    # Configurações
│   │   │   ├── database.py  # Conexão DB
│   │   │   ├── controllers/ # Rotas/Endpoints
│   │   │   ├── models/      # Modelos SQLAlchemy
│   │   │   ├── services/    # Lógica de negócio
│   │   │   └── utils/       # Utilitários
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── build.sh
│   │   └── start.sh
│   │
│   └── web/                 # Frontend React
│       ├── src/
│       │   ├── App.jsx      # Componente principal
│       │   ├── components/  # Componentes React
│       │   ├── pages/       # Páginas/Rotas
│       │   ├── services/    # Serviços/API calls
│       │   ├── contexts/    # Context API
│       │   └── config/      # Configurações
│       ├── package.json
│       └── vite.config.js
│
├── render.yaml              # Config Render
├── .env.example             # Variáveis exemplo
└── README.md                # Este arquivo
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Sistema desenvolvido para Mestres do Café
- **Stack**: Python/Flask + React/Vite
- **Deploy**: Otimizado para Render

## 📞 Suporte

- Email: suporte@mestresdocafe.com.br
- Issues: [GitHub Issues](https://github.com/seu-usuario/mestres_do_cafe/issues)

## 🎯 Roadmap

- [x] MVP E-commerce
- [x] Integração Mercado Pago
- [x] Integração Melhor Envio
- [x] Dashboard Admin
- [ ] App Mobile (React Native)
- [ ] Sistema de Assinaturas
- [ ] Marketplace Multi-vendor
- [ ] IA para Recomendações
- [ ] Sistema de Pontos/Gamificação

## 🏆 Status do Projeto

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

**Desenvolvido com ☕ e 💜 para Mestres do Café**