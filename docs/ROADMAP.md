# 🚀 ROADMAP MESTRES DO CAFÉ - FASE 1

> **Projeto**: Plataforma Digital Completa para Torrefação Artesanal  
> **Prazo**: 30 dias (até 10/07/2025)  
> **Orçamento**: R$ 2.500,00 + R$ 300,00/mês manutenção  
> **Status**: 🟡 Em Desenvolvimento

## 📊 ESTADO ATUAL (10/06/2025)

### ✅ **JÁ IMPLEMENTADO**
- [x] Estrutura base React.js + Vite + TailwindCSS
- [x] Componentes UI (Radix UI + shadcn/ui)
- [x] Sistema de autenticação mock (login/registro)
- [x] Landing Page responsiva
- [x] Marketplace básico (catálogo de produtos)
- [x] Dashboard administrativo
- [x] Página de cadastro de clientes
- [x] Sistema de roteamento (React Router)
- [x] API mock com localStorage
- [x] Documentação GitHub completa

### 🟡 **PARCIALMENTE IMPLEMENTADO**
- [ ] Carrinho de compras (estrutura criada, precisa integrar)
- [ ] Checkout (página criada, precisa funcionalidade)
- [ ] Sistema de produtos (básico, precisa expandir)

### ❌ **NÃO IMPLEMENTADO**
- [ ] Backend real (Node.js + Express)
- [ ] Banco de dados PostgreSQL
- [ ] Sistema de pontuação/gamificação
- [ ] Mapa interativo de cafeterias
- [ ] Automação WhatsApp
- [ ] Integração Egestor
- [ ] Gateway de pagamento

---

## 🗓️ CRONOGRAMA DETALHADO

### **SEMANA 1: 10/06 - 16/06** 
> **Foco**: Backend e Infraestrutura

#### **Dias 1-2 (10-11/06)**
- [ ] **Backend Setup**
  - [ ] Criar estrutura Node.js + Express
  - [ ] Configurar PostgreSQL no Supabase
  - [ ] Implementar autenticação JWT
  - [ ] Criar models básicos (User, Product, Order)

#### **Dias 3-4 (12-13/06)**
- [ ] **APIs Principais**
  - [ ] Auth API (login, register, verify)
  - [ ] Products API (CRUD completo)
  - [ ] Users API (cadastro PF/PJ)
  - [ ] Cart API (adicionar, remover, atualizar)

#### **Dias 5-7 (14-16/06)**
- [ ] **Integração Frontend-Backend**
  - [ ] Substituir API mock por calls reais
  - [ ] Testar autenticação completa
  - [ ] Validar funcionamento do marketplace
  - [ ] Configurar variáveis de ambiente

**🎯 Entregáveis Semana 1:**
- Backend funcional com APIs básicas
- Banco de dados estruturado
- Frontend integrado com backend real
- Sistema de autenticação operacional

---

### **SEMANA 2: 17/06 - 23/06**
> **Foco**: Sistema de Clientes e Gamificação

#### **Dias 8-9 (17-18/06)**
- [ ] **Sistema de Cadastro Avançado**
  - [ ] Formulários PF vs PJ diferenciados
  - [ ] Validação CPF/CNPJ em tempo real
  - [ ] Sistema de níveis (Bronze, Prata, Ouro, Diamante)
  - [ ] Banco de dados de pontuação

#### **Dias 10-11 (19-20/06)**
- [ ] **Gamificação e Pontos**
  - [ ] Lógica de pontuação diferenciada PF/PJ
  - [ ] Sistema de níveis e benefícios
  - [ ] Dashboard de pontos para cliente
  - [ ] Histórico de movimentações

#### **Dias 12-14 (21-23/06)**
- [ ] **Integração Egestor**
  - [ ] Configurar API Egestor
  - [ ] Sincronização bidirecional de clientes
  - [ ] Sincronização de produtos e estoque
  - [ ] Log de sincronizações

**🎯 Entregáveis Semana 2:**
- Sistema completo de cadastro PF/PJ
- Gamificação funcionando
- Integração Egestor operacional
- Dashboard de clientes para admin

---

### **SEMANA 3: 24/06 - 30/06**
> **Foco**: Mapa e Automação WhatsApp

#### **Dias 15-16 (24-25/06)**
- [ ] **Mapa Interativo**
  - [ ] Integração Google Maps API
  - [ ] CRUD de localizações (cafeterias/revendedores)
  - [ ] Marcadores personalizados
  - [ ] Busca e filtros geográficos

#### **Dias 17-18 (26-27/06)**
- [ ] **Geolocalização e Funcionalidades**
  - [ ] Localização do usuário
  - [ ] Cálculo de distâncias
  - [ ] Direções integradas
  - [ ] Modal de detalhes das localizações

#### **Dias 19-21 (28-30/06)**
- [ ] **Automação WhatsApp**
  - [ ] Configurar Z-API ou Evolution API
  - [ ] Implementar chatbot básico
  - [ ] Fluxos de atendimento
  - [ ] Carrinho abandonado automation
  - [ ] Templates de mensagens

**🎯 Entregáveis Semana 3:**
- Mapa funcional com localizações
- Chatbot WhatsApp operacional
- Automações básicas funcionando
- Sistema de mensagens templates

---

### **SEMANA 4: 01/07 - 07/07**
> **Foco**: E-commerce e Pagamentos

#### **Dias 22-23 (01-02/07)**
- [ ] **Marketplace Completo**
  - [ ] Carrinho persistente
  - [ ] Sistema de checkout funcional
  - [ ] Cálculo de frete
  - [ ] Cupons de desconto

#### **Dias 24-25 (03-04/07)**
- [ ] **Gateway de Pagamento**
  - [ ] Integração Mercado Pago
  - [ ] PIX, Cartão, Boleto
  - [ ] Confirmação de pagamentos
  - [ ] Webhooks de status

#### **Dias 26-28 (05-07/07)**
- [ ] **Finalizações e Testes**
  - [ ] Testes de integração completos
  - [ ] Otimizações de performance
  - [ ] Correção de bugs
  - [ ] Validação com cliente

**🎯 Entregáveis Semana 4:**
- E-commerce 100% funcional
- Pagamentos integrados
- Sistema testado e validado
- Performance otimizada

---

### **SEMANA 5: 08/07 - 10/07**
> **Foco**: Deploy e Entrega

#### **Dias 29-30 (08-09/07)**
- [ ] **Deploy e Configuração**
  - [ ] Deploy frontend (Vercel/Netlify)
  - [ ] Deploy backend (Render/Railway)
  - [ ] Configuração de domínio
  - [ ] SSL e segurança

#### **Dia 31 (10/07)**
- [ ] **Entrega Final**
  - [ ] Documentação completa
  - [ ] Manual do administrador
  - [ ] Treinamento da equipe
  - [ ] Entrega oficial

**🎯 Entregáveis Semana 5:**
- Sistema em produção
- Documentação completa
- Equipe treinada
- Projeto entregue

---

## 🎯 FUNCIONALIDADES POR MÓDULO

### **1. FRONTEND & LANDING PAGE**
```
✅ Design System (shadcn/ui + TailwindCSS)
✅ Landing Page responsiva  
✅ Hero Section com CTAs
✅ Seções: Sobre, Produtos, Contato
⏳ Otimizações SEO
⏳ Google Analytics
⏳ Newsletter/Lead capture
```

### **2. MARKETPLACE ONLINE**
```
✅ Catálogo de produtos básico
⏳ Filtros avançados (acidez, amargor, origem)
⏳ Carrinho persistente
⏳ Sistema de checkout
⏳ Avaliações e comentários
⏳ Gestão de estoque
⏳ Cupons de desconto
```

### **3. MAPA DE CAFETERIAS**
```
❌ Google Maps integração
❌ Marcadores personalizados
❌ Busca por localização
❌ Filtros (tipo, distância, avaliação)
❌ Direções integradas
❌ CRUD administrativo
```

### **4. AUTOMAÇÃO WHATSAPP**
```
❌ Bot de atendimento
❌ Fluxos de conversação
❌ Carrinho abandonado
❌ Aniversário cliente
❌ Recompra (cliente inativo)
❌ Templates personalizáveis
```

### **5. SISTEMA DE CADASTRO**
```
✅ Formulários PF/PJ básicos
⏳ Sistema de pontuação
⏳ Níveis e benefícios
⏳ Integração Egestor
⏳ Dashboard de pontos
⏳ Diferenciação PF vs PJ
```

---

## 🛠️ STACK TECNOLÓGICA

### **Frontend**
- ✅ React.js 19.1.0
- ✅ Vite 6.3.5
- ✅ TailwindCSS 4.1.7
- ✅ Radix UI (componentes)
- ✅ React Router DOM
- ✅ React Hook Form + Zod
- ✅ Framer Motion (animações)

### **Backend** (a implementar)
- ⏳ Node.js + Express.js
- ⏳ PostgreSQL (Supabase)
- ⏳ JWT Authentication
- ⏳ bcrypt (hash senhas)
- ⏳ Multer (upload files)

### **Integrações** (a implementar)
- ⏳ Egestor API
- ⏳ Google Maps API
- ⏳ Z-API (WhatsApp)
- ⏳ Mercado Pago
- ⏳ Correios (frete)

---

## 📊 MÉTRICAS DE PROGRESSO

| Módulo | Progresso | Status |
|--------|-----------|--------|
| Frontend Base | 85% | 🟢 |
| Landing Page | 90% | 🟢 |
| Marketplace | 40% | 🟡 |
| Autenticação | 70% | 🟡 |
| Backend | 0% | 🔴 |
| Mapa | 0% | 🔴 |
| WhatsApp | 0% | 🔴 |
| Egestor | 0% | 🔴 |
| Deploy | 0% | 🔴 |

**Progresso Geral: 32%**

---

## 🚨 RISCOS E MITIGATION

### **Alto Risco**
1. **Integração Egestor**: API pode ter limitações
   - *Mitigation*: Documentar limitações, implementar fallbacks
   
2. **WhatsApp API**: Políticas restritivas
   - *Mitigation*: Usar Z-API ou Evolution API como alternativa

### **Médio Risco**
1. **Performance**: Muitas integrações podem afetar velocidade
   - *Mitigation*: Cache, lazy loading, otimizações

2. **Prazo**: 30 dias é apertado para todas funcionalidades
   - *Mitigation*: Priorizar MVPs, deixar refinamentos para depois

---

## 📞 CONTATOS DO PROJETO

**Desenvolvedor**: Kalleby Evangelho Mota  
📧 kalleby@oryum.tech  
📱 (55) 99125-5935

**Cliente**: Daniel do Nascimento  
📱 (55) 99645-8600  
🏢 Mestres do Café LTDA - Santa Maria/RS

---

## 🎯 PRÓXIMAS AÇÕES IMEDIATAS

1. **Backend Setup** (Hoje - 10/06)
   - Criar repositório backend
   - Configurar Node.js + Express
   - Setup PostgreSQL no Supabase

2. **Database Design** (11/06)
   - Criar schema completo
   - Relacionamentos e índices
   - Seeds de dados iniciais

3. **API Development** (12-13/06)
   - Auth endpoints
   - Products CRUD
   - Users management

---

*Documento atualizado em: 10/06/2025*  
*Próxima revisão: 17/06/2025* 