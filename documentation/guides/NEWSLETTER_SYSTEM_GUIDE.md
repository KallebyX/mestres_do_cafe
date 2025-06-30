# 📧📱 Sistema de Newsletter - Mestres do Café

## 🎯 Visão Geral

O sistema de newsletter dos Mestres do Café permite enviar mensagens personalizadas para clientes através de **Email** e **WhatsApp**, integrado diretamente ao CRM administrativo.

## ✨ Funcionalidades Implementadas

### 📊 **Interface do CRM**
- ✅ Nova aba "Newsletter" no AdminCRMDashboard
- ✅ Interface intuitiva com preview em tempo real
- ✅ Seleção de público-alvo (todos, admin-criados, auto-cadastrados, ativos, inativos)
- ✅ Visualização dos destinatários selecionados
- ✅ Validações completas antes do envio

### 📝 **Templates Pré-definidos Aprimorados**
- 🔥 **Promoção**: Layout profissional com bordas ASCII, descontos em níveis e urgência
- 📰 **Newsletter**: Formato de jornal com seções organizadas e dicas do especialista
- 🎊 **Boas-vindas**: Apresentação completa da família, benefícios e programa de pontos
- 🎂 **Aniversário**: Celebração especial com múltiplos presentes e instruções detalhadas
- 🎪 **Eventos**: Convites para workshops, degustações e programação completa
- 🎨 **Personalizada**: Criação livre com validações e suporte completo

### 🎨 **Personalização**
- ✅ Substituição automática de `[NOME]` pelo nome do cliente
- ✅ Substituição automática de `[DATA]` pela data atual
- ✅ Preview em tempo real das mensagens
- ✅ Contagem automática de destinatários

### 📧 **Envio por Email**
- ✅ Integração com SMTP (Gmail, Outlook, etc.)
- ✅ Templates HTML responsivos
- ✅ Personalização por destinatário
- ✅ Tratamento de erros individual

### 📱 **Envio por WhatsApp**
- ✅ Integração com WhatsAppService existente
- ✅ Formatação automática de números brasileiros
- ✅ Delay entre mensagens para evitar spam
- ✅ Suporte a emojis e formatação

### 🎨 **Design Aprimorado dos Templates**
- ✅ **Bordas ASCII**: Cabeçalhos profissionais com molduras
- ✅ **Hierarquia Visual**: Uso de símbolos ├ └ para organizar informações
- ✅ **Identidade Visual**: Cores e emojis alinhados com a marca Mestres do Café
- ✅ **Call-to-Actions**: Botões e links destacados para conversão
- ✅ **Informações Práticas**: Contatos, endereços e horários padronizados
- ✅ **Urgência Marketing**: Elementos de escassez e tempo limitado

### 🔧 **Validações e Segurança**
- ✅ Validação de dados obrigatórios
- ✅ Verificação de emails/telefones válidos
- ✅ Controle de acesso apenas para admins
- ✅ Logs detalhados de envio

## 📁 Arquivos Criados/Modificados

### **Frontend**
```
src/pages/AdminCRMDashboard.jsx      # Adicionada aba Newsletter
src/lib/newsletter-api.js            # API cliente para newsletter
```

### **Backend**
```
server/routes/newsletter.js          # Rotas da newsletter
server/package.json                  # Adicionado nodemailer
server/env.example                   # Configurações de email
```

### **Scripts e Testes**
```
scripts/test-newsletter.js           # Script de teste completo
```

### **Documentação**
```
NEWSLETTER_SYSTEM_GUIDE.md           # Este arquivo
```

## 🚀 Como Usar

### 1. **Configuração Inicial**

**Configure as variáveis de ambiente no servidor:**
```bash
# server/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
NEWSLETTER_FROM_NAME=Mestres do Café
NEWSLETTER_FROM_EMAIL=newsletter@mestrescafe.com.br
```

**Instale as dependências:**
```bash
cd server
npm install
```

### 2. **Acessando a Newsletter**

1. Faça login como administrador
2. Acesse **Admin → CRM**
3. Clique na aba **"Newsletter"**

### 3. **Criando uma Newsletter**

#### **Passo 1: Escolha o Template**
- Selecione um template pré-definido ou "Personalizada"
- Os templates são preenchidos automaticamente

#### **Passo 2: Personalize o Conteúdo**
- **Título**: Assunto do email/título da mensagem
- **Mensagem**: Conteúdo com suporte a personalização
  - Use `[NOME]` para o nome do cliente
  - Use `[DATA]` para a data atual

#### **Passo 3: Escolha o Método de Envio**
- **📧 Email**: Apenas por email
- **📱 WhatsApp**: Apenas por WhatsApp  
- **⚡ Ambos**: Email + WhatsApp

#### **Passo 4: Selecione o Público**
- **Todos os clientes**: Toda a base
- **Criados pelo admin**: Apenas clientes manuais
- **Auto-cadastrados**: Apenas auto-registros
- **Clientes ativos**: Apenas contas ativas
- **Clientes inativos**: Apenas contas inativas

#### **Passo 5: Preview e Envio**
- Visualize o preview com personalização
- Confira a lista de destinatários
- Clique em **"Enviar Newsletter"**

## 🔧 Endpoints da API

### **POST /api/newsletter/email**
Envia newsletter por email
```json
{
  "recipients": [
    {
      "name": "João Silva",
      "email": "joao@email.com",
      "message": "Mensagem personalizada"
    }
  ],
  "subject": "Título do email",
  "message": "Conteúdo base"
}
```

### **POST /api/newsletter/whatsapp**
Envia newsletter por WhatsApp
```json
{
  "recipients": [
    {
      "name": "João Silva", 
      "phone": "(55) 99999-1234",
      "message": "Mensagem personalizada"
    }
  ],
  "message": "Conteúdo base"
}
```

### **GET /api/newsletter/whatsapp/status**
Verifica status do WhatsApp
```json
{
  "connected": true,
  "phone": "5511999999999",
  "platform": "android",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **GET /api/newsletter/templates**
Lista templates disponíveis
```json
{
  "success": true,
  "templates": {
    "promotion": {
      "title": "☕ Promoção Especial",
      "category": "marketing"
    }
  }
}
```

### **GET /api/newsletter/test**
Testa conectividade dos serviços
```json
{
  "success": true,
  "tests": {
    "whatsapp": true,
    "email": true
  }
}
```

## 🧪 Testando o Sistema

### **Teste Manual pelo CRM**
1. Acesse a aba Newsletter
2. Crie uma newsletter de teste
3. Selecione poucos clientes
4. Envie e monitore os logs

### **Teste Automatizado**
```bash
# Execute o script de teste
node scripts/test-newsletter.js
```

### **Teste Individual dos Serviços**
```bash
# Teste apenas email
curl -X POST http://localhost:5000/api/newsletter/email \
  -H "Content-Type: application/json" \
  -d '{"recipients":[{"name":"Test","email":"test@email.com"}],"subject":"Teste","message":"Mensagem de teste"}'

# Teste apenas WhatsApp  
curl -X POST http://localhost:5000/api/newsletter/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"recipients":[{"name":"Test","phone":"5511999999999"}],"message":"Mensagem de teste"}'
```

## 📊 Monitoramento

### **Logs do Servidor**
- ✅ Cada envio é logado com detalhes
- ✅ Erros são capturados e reportados
- ✅ Status de sucesso/falha por destinatário

### **Interface do CRM**
- ✅ Mensagens de sucesso/erro em tempo real
- ✅ Contadores de destinatários
- ✅ Validações visuais

## 🔒 Segurança

- ✅ **Autenticação**: Apenas admins podem enviar
- ✅ **Validação**: Dados são validados antes do envio
- ✅ **Rate Limiting**: Delay entre mensagens WhatsApp
- ✅ **Sanitização**: Conteúdo é tratado antes do envio

## 🚨 Troubleshooting

### **Email não está enviando**
1. Verifique as credenciais SMTP no `.env`
2. Para Gmail, use "Senhas de app" em vez da senha normal
3. Teste a conexão: `GET /api/newsletter/test`

### **WhatsApp não está enviando**
1. Verifique se o QR Code foi escaneado
2. Confirme status: `GET /api/newsletter/whatsapp/status`
3. Verifique os logs do WhatsAppService

### **Newsletter não aparece no CRM**
1. Confirme que o usuário é admin
2. Verifique se as rotas estão registradas no server.js
3. Confirme que o frontend está importando corretamente

### **Erros de validação**
1. Verifique se titulo e mensagem estão preenchidos
2. Confirme que há clientes selecionados
3. Para WhatsApp, verifique se há telefones cadastrados

## 🎨 Exemplos de Templates Aprimorados

### **🔥 Template de Promoção**
```
┌─────────────────────────────┐
│  🔥 OFERTA EXCLUSIVA 🔥    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

💰 DESCONTOS INCRÍVEIS:
├ 🏆 Premium: 25% OFF
├ ⭐ Especiais: 20% OFF  
└ 🎁 FRETE GRÁTIS acima de R$ 89

🛒 GARANTIR DESCONTO:
🔗 mestrescafe.com.br/promocao
🏷️ Cupom: MESTRE25
```

### **📰 Template de Newsletter**
```
┌─────────────────────────────┐
│   📰 NEWSLETTER SEMANAL    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

🌟 DESTAQUES:
├ ☕ Lançamento: Café Bourbon Premium
├ 🏪 Nova loja na Rua do Acampamento  
└ 🎓 Workshop gratuito de barista

📚 DICA DO ESPECIALISTA:
"Para realçar notas frutais, use água entre 88-92°C"
- João, Mestre Barista
```

### **🎊 Template de Boas-vindas**
```
┌─────────────────────────────┐
│  🎊 BEM-VINDO À FAMÍLIA!   │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

🎁 SEUS BENEFÍCIOS DE BOAS-VINDAS:
├ 🏷️ 15% OFF na primeira compra
├ 🚚 FRETE GRÁTIS sem valor mínimo
├ ⭐ 200 PONTOS de bônus
└ 📱 Acesso VIP às promoções
```

## 🎯 Próximos Passos

### **Melhorias Sugeridas**
- [ ] Agendamento de newsletters
- [ ] Estatísticas de abertura (email)
- [ ] Histórico de newsletters enviadas
- [ ] Editor visual drag-and-drop
- [ ] Segmentação por localização
- [ ] A/B testing de conteúdo

### **Integrações Futuras**
- [ ] Integração com Mailchimp/SendGrid
- [ ] Analytics de engajamento
- [ ] Automação por triggers
- [ ] Templates com imagens

## 🎉 Conclusão

O sistema de newsletter está **100% funcional com templates profissionais** e pronto para uso em produção! 

**Principais benefícios aprimorados:**
- ✅ **Comunicação unificada**: Email + WhatsApp em uma interface elegante
- ✅ **Templates profissionais**: Design com bordas ASCII e hierarquia visual
- ✅ **Personalização avançada**: Mensagens adaptadas por cliente com variáveis
- ✅ **Facilidade de uso**: Interface intuitiva no CRM com preview em tempo real
- ✅ **Robustez**: Validações completas e tratamento de erros
- ✅ **Flexibilidade**: 6 templates especializados + criação personalizada
- ✅ **Marketing efetivo**: Call-to-actions destacados e elementos de urgência

**Para suporte técnico:**
- 📧 Email: suporte@mestrescafe.com.br
- 📱 WhatsApp: (55) 99999-9999
- 🌐 Documentação: `/docs`

---
*© 2024 Mestres do Café - Sistema de Newsletter v1.1 (Templates Aprimorados)* 