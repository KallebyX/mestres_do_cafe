# ☕ Mestres do Café - E-commerce Otimizado

**Sistema de e-commerce limpo e funcional para mercado de café especial**

---

## 🚀 **INÍCIO RÁPIDO**

### **Backend API**
```bash
cd apps/api
pip install -r requirements.txt
python src/app.py
```
**API rodando em:** http://localhost:5001

### **Frontend React**
```bash
cd apps/web
npm install
npm run dev
```
**Frontend rodando em:** http://localhost:3000

---

## 📁 **ESTRUTURA OTIMIZADA**

```
mestres_cafe_enterprise/
├── apps/
│   ├── api/          # Backend Flask + SQLite
│   │   ├── src/      # Código principal
│   │   ├── .env      # Configurações
│   │   └── requirements.txt # Dependências Python
│   └── web/          # Frontend React
│       ├── src/      # Componentes React
│       └── package.json # Dependências Node
└── README.md         # Esta documentação
```

---

## 💾 **BANCO DE DADOS**

- **Único SQLite**: `apps/api/mestres_cafe.db`
- **Usuário teste**: `teste@pato.com` / `123456`
- **Produtos**: Carregados automaticamente

---

## ⚙️ **CONFIGURAÇÃO**

### **Variáveis Essenciais (.env)**
```bash
DATABASE_URL=sqlite:///mestres_cafe.db
SECRET_KEY=sua-chave-secreta
JWT_SECRET_KEY=sua-chave-jwt
MERCADO_PAGO_ACCESS_TOKEN=seu-token-mp
```

---

## 🎯 **FUNCIONALIDADES**

- ✅ Autenticação JWT
- ✅ Catálogo de produtos
- ✅ Carrinho de compras
- ✅ Checkout completo
- ✅ Integração Mercado Pago
- ✅ Painel admin
- ✅ Controle de estoque

---

**🚀 Sistema pronto para produção!** ☕