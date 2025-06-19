/**
 * 🤖 WhatsApp Service - API PRÓPRIA GRATUITA
 * Usando whatsapp-web.js (Open Source)
 * Automação completa para Mestres do Café
 */

// Importações condicionais para evitar erros
let Client, LocalAuth, MessageMedia, qrcode;
let puppeteerAvailable = true;

try {
  const whatsappWeb = require('whatsapp-web.js');
  Client = whatsappWeb.Client;
  LocalAuth = whatsappWeb.LocalAuth;
  MessageMedia = whatsappWeb.MessageMedia;
  qrcode = require('qrcode-terminal');
} catch (error) {
  console.log('⚠️ WhatsApp Web.js não disponível, rodando em modo mock');
  puppeteerAvailable = false;
}

const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor() {
    // Cliente WhatsApp Web
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
    this.mockMode = !puppeteerAvailable;
    
    // Estado das conversas para cada cliente
    this.conversationStates = new Map();
    
    // Arquivo para salvar estados (persistência simples)
    this.statesFile = path.join(__dirname, '../data/whatsapp_states.json');
    
    // Menu principal
    this.mainMenu = `☕ *Bem-vindo aos Mestres do Café!*

Escolha uma das opções:

1️⃣ Ver catálogo de cafés
2️⃣ Informações sobre pontuação/gamificação
3️⃣ Status do meu pedido
4️⃣ Localização das lojas
5️⃣ Falar com atendente
6️⃣ Promoções especiais

Digite o número da opção desejada.`;

    this.coffeeMenu = `☕ *Nossos Cafés Especiais:*

🥇 *Premium (R$ 89,90)*
• Café Geisha Especial
• Notas: Floral, Frutas Tropicais

🏆 *Especial (R$ 45,90)*
• Bourbon Amarelo Premium
• Notas: Chocolate, Caramelo

⭐ *Tradicional (R$ 28,90)*
• Blend Supremo
• Notas: Chocolate, Suave

Para comprar, acesse: https://mestrescafe.com.br
Ou digite 5 para falar com um atendente!`;

    this.gamificationInfo = `🎮 *Sistema de Pontuação:*

*PESSOA FÍSICA:*
• 1 ponto = R$ 1,00 gasto

*PESSOA JURÍDICA:*
• 2 pontos = R$ 1,00 gasto

🏅 *Níveis e Benefícios:*
• Aprendiz (0-499 pts): 5% desconto
• Conhecedor (500-1499 pts): 10% desconto
• Especialista (1500-2999 pts): 15% desconto
• Mestre (3000-4999 pts): 20% desconto
• Lenda (5000+ pts): 25% desconto

Cadastre-se em: https://mestrescafe.com.br/registro`;

    this.locationsInfo = `📍 *Nossas Lojas em Santa Maria/RS:*

🏪 *Loja Centro*
📍 Rua do Acampamento, 123
⏰ Seg-Sex: 7h-19h | Sáb: 8h-18h
📞 (55) 3220-1234

🏪 *Loja Camobi*
📍 Av. Roraima, 456
⏰ Seg-Sex: 7h-20h | Sáb: 8h-17h
📞 (55) 3220-5678

🏪 *Loja Norte*
📍 Rua Silva Jardim, 789
⏰ Seg-Sex: 6h30-19h | Sáb: 7h-18h
📞 (55) 3220-9012

📱 Veja no mapa: https://mestrescafe.com.br/localizacoes`;

    // Inicializar automaticamente se disponível
    if (!this.mockMode) {
      this.initialize().catch(error => {
        console.log('❌ Erro ao inicializar WhatsApp, ativando modo mock:', error.message);
        this.mockMode = true;
      });
    } else {
      console.log('🤖 WhatsApp Service rodando em modo MOCK (desenvolvimento)');
    }
  }

  /**
   * 🚀 Inicializar WhatsApp Bot
   */
  async initialize() {
    try {
      if (this.mockMode) {
        console.log('🤖 WhatsApp em modo mock - simulando funcionamento');
        this.isReady = true;
        return;
      }

      console.log('🤖 Inicializando WhatsApp Bot próprio...');
      
      // Configurar cliente com autenticação local
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'mestres-cafe-bot',
          dataPath: './whatsapp-session'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      });

      // Eventos do cliente
      this.setupEventListeners();
      
      // Carregar estados salvos
      this.loadConversationStates();
      
      // Inicializar cliente com timeout
      const initPromise = this.client.initialize();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na inicialização')), 15000);
      });

      await Promise.race([initPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp Bot:', error.message);
      console.log('🔄 Ativando modo mock para desenvolvimento');
      this.mockMode = true;
      this.isReady = true;
    }
  }

  /**
   * 📡 Configurar eventos do WhatsApp
   */
  setupEventListeners() {
    if (this.mockMode || !this.client) return;

    // QR Code para conexão
    this.client.on('qr', (qr) => {
      console.log('📱 QR Code gerado! Escaneie com seu WhatsApp:');
      if (qrcode && qrcode.generate) {
        qrcode.generate(qr, { small: true });
      }
      this.qrCode = qr;
      
      // Salvar QR em arquivo para interface web
      try {
        const qrPath = path.join(__dirname, '../public/whatsapp-qr.txt');
        fs.writeFileSync(qrPath, qr);
      } catch (error) {
        console.log('⚠️ Erro ao salvar QR code:', error.message);
      }
    });

    // Cliente pronto
    this.client.on('ready', () => {
      console.log('✅ WhatsApp Bot conectado e pronto!');
      this.isReady = true;
      this.qrCode = null;
      
      // Remover QR code salvo
      try {
        const qrPath = path.join(__dirname, '../public/whatsapp-qr.txt');
        if (fs.existsSync(qrPath)) {
          fs.unlinkSync(qrPath);
        }
      } catch (error) {
        console.log('⚠️ Erro ao remover QR code:', error.message);
      }
    });

    // Desconectado
    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp Bot desconectado:', reason);
      this.isReady = false;
    });

    // Mensagem recebida
    this.client.on('message', async (message) => {
      await this.processIncomingMessage(message);
    });

    // Erro de autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação WhatsApp:', msg);
      this.mockMode = true;
    });
  }

  /**
   * 🔍 Verificar status do bot
   */
  async getStatus() {
    try {
      if (this.mockMode) {
        return {
          connected: true,
          phone: 'Mock Mode',
          platform: 'Development',
          battery: 100,
          qrCode: null,
          mockMode: true,
          timestamp: new Date().toISOString()
        };
      }

      if (!this.client) {
        return {
          connected: false,
          error: 'Cliente não inicializado',
          qrCode: this.qrCode,
          timestamp: new Date().toISOString()
        };
      }

      const info = await this.client.info;
      return {
        connected: this.isReady,
        phone: info?.wid?.user || 'Não conectado',
        platform: info?.platform || 'Desconhecido',
        battery: info?.battery || 0,
        qrCode: this.qrCode,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        qrCode: this.qrCode,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 📤 Enviar mensagem de texto
   */
  async sendTextMessage(chatId, message) {
    try {
      if (this.mockMode) {
        console.log(`🤖 [MOCK] Mensagem enviada para ${chatId}:`, message.substring(0, 50) + '...');
        return { success: true, timestamp: new Date().toISOString(), mock: true };
      }

      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const chat = await this.client.getChatById(chatId);
      await chat.sendMessage(message);
      
      console.log(`✅ Mensagem enviada para ${chatId}:`, message.substring(0, 50) + '...');
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.message);
      throw error;
    }
  }

  /**
   * 🖼️ Enviar imagem com caption
   */
  async sendImageMessage(chatId, imagePath, caption) {
    try {
      if (this.mockMode) {
        console.log(`🤖 [MOCK] Imagem enviada para ${chatId} com caption: ${caption}`);
        return { success: true, timestamp: new Date().toISOString(), mock: true };
      }

      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const media = MessageMedia.fromFilePath(imagePath);
      const chat = await this.client.getChatById(chatId);
      await chat.sendMessage(media, { caption: caption });
      
      console.log(`📸 Imagem enviada para ${chatId}`);
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error.message);
      throw error;
    }
  }

  /**
   * 📄 Enviar documento/PDF
   */
  async sendDocumentMessage(chatId, documentPath, filename) {
    try {
      if (this.mockMode) {
        console.log(`🤖 [MOCK] Documento ${filename} enviado para ${chatId}`);
        return { success: true, timestamp: new Date().toISOString(), mock: true };
      }

      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const media = MessageMedia.fromFilePath(documentPath);
      media.filename = filename;
      
      const chat = await this.client.getChatById(chatId);
      await chat.sendMessage(media);
      
      console.log(`📄 Documento enviado para ${chatId}`);
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ Erro ao enviar documento:', error.message);
      throw error;
    }
  }

  /**
   * 🔄 Processar mensagem recebida
   */
  async processIncomingMessage(message) {
    try {
      if (this.mockMode) {
        console.log('🤖 [MOCK] Processando mensagem recebida');
        return;
      }

      // Ignorar mensagens de grupo ou de mim mesmo
      if (message.from.includes('@g.us') || message.fromMe) {
        return;
      }

      const chatId = message.from;
      const messageText = message.body || '';
      const contact = await message.getContact();
      const contactName = contact.pushname || contact.name || 'Cliente';
      
      console.log(`📥 Mensagem de ${contactName} (${chatId}): ${messageText}`);

      // Obter estado da conversa
      const currentState = this.conversationStates.get(chatId) || 'MENU_PRINCIPAL';
      
      // Processar baseado no estado atual
      await this.handleUserInput(chatId, messageText, currentState, contactName);
      
      // Salvar estados
      this.saveConversationStates();
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  /**
   * 🎯 Gerenciar entrada do usuário baseada no estado
   */
  async handleUserInput(chatId, input, currentState, contactName) {
    const userInput = input.toLowerCase().trim();

    switch (currentState) {
      case 'MENU_PRINCIPAL':
        await this.handleMainMenu(chatId, userInput);
        break;
        
      case 'AGUARDANDO_NOME':
        await this.handleNameInput(chatId, input);
        break;
        
      case 'AGUARDANDO_EMAIL':
        await this.handleEmailInput(chatId, input);
        break;

      case 'AGUARDANDO_PEDIDO':
        await this.handleOrderNumber(chatId, input);
        break;
        
      default:
        await this.sendMainMenu(chatId, contactName);
    }
  }

  /**
   * 🏠 Processar menu principal
   */
  async handleMainMenu(chatId, input) {
    switch (input) {
      case '1':
        await this.sendTextMessage(chatId, this.coffeeMenu);
        break;
        
      case '2':
        await this.sendTextMessage(chatId, this.gamificationInfo);
        break;
        
      case '3':
        await this.handleOrderStatus(chatId);
        break;
        
      case '4':
        await this.sendTextMessage(chatId, this.locationsInfo);
        break;
        
      case '5':
        await this.transferToHuman(chatId);
        break;
        
      case '6':
        await this.sendPromotions(chatId);
        break;

      case 'oi':
      case 'olá':
      case 'ola':
      case 'hello':
      case 'bom dia':
      case 'boa tarde':
      case 'boa noite':
        if (!this.mockMode) {
          const contact = await this.client.getChatById(chatId);
          const contactInfo = await contact.getContact();
          await this.sendWelcomeMessage(chatId, contactInfo.pushname || 'Cliente');
        } else {
          await this.sendWelcomeMessage(chatId, 'Cliente');
        }
        break;
        
      default:
        await this.sendMainMenu(chatId);
    }
  }

  /**
   * 📦 Verificar status do pedido
   */
  async handleOrderStatus(chatId) {
    const message = `📦 *Status do Pedido*

Para consultar seu pedido, me informe:

1️⃣ Número do pedido (ex: #1234)
2️⃣ Seu email cadastrado
3️⃣ Seu CPF/CNPJ

Digite uma das opções acima:`;

    await this.sendTextMessage(chatId, message);
    this.conversationStates.set(chatId, 'AGUARDANDO_PEDIDO');
  }

  /**
   * 🔢 Processar número do pedido
   */
  async handleOrderNumber(chatId, input) {
    // Simular busca de pedido
    const orderNumber = input.replace(/[^\d]/g, '');
    
    if (orderNumber.length >= 3) {
      const message = `✅ *Pedido #${orderNumber} encontrado!*

📦 *Status:* Em preparação
🕒 *Estimativa:* 2-3 dias úteis
📍 *Endereço:* Rua das Flores, 123
🚚 *Transportadora:* Correios

*Itens do pedido:*
• 1x Café Bourbon Amarelo (500g)
• 1x Café Geisha Especial (250g)

💰 *Total:* R$ 135,80

Para mais detalhes: https://mestrescafe.com.br/pedidos`;

      await this.sendTextMessage(chatId, message);
    } else {
      await this.sendTextMessage(chatId, '❌ Número de pedido inválido. Tente novamente:');
      return;
    }
    
    this.conversationStates.set(chatId, 'MENU_PRINCIPAL');
  }

  /**
   * 👨‍💼 Transferir para atendimento humano
   */
  async transferToHuman(chatId) {
    const message = `👨‍💼 *Conectando com especialista...*

Um dos nossos mestres do café entrará em contato em breve!

⏰ *Horário de atendimento:*
📞 Segunda a Sexta: 8h às 18h
📞 Sábado: 8h às 16h

🚨 *Para urgências:*
📞 WhatsApp: (55) 99645-8600
📧 Email: daniel@mestrescafe.com.br

Aguarde que logo alguém te atenderá! ☕`;

    await this.sendTextMessage(chatId, message);
    
    // Notificar administrador
    console.log(`🚨 ATENDIMENTO HUMANO: Cliente ${chatId} solicitou atendimento`);
  }

  /**
   * 🎁 Enviar promoções especiais
   */
  async sendPromotions(chatId) {
    const validUntil = new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('pt-BR');
    
    const message = `🎁 *Promoções Especiais de Janeiro!*

🔥 *OFERTA RELÂMPAGO*
💥 15% OFF em todos os cafés especiais
🎫 Código: CAFE15
📅 Válido até ${validUntil}

💎 *PROGRAMA VIP*
🎯 Cadastre-se e ganhe 100 pontos
🏆 + 5% de desconto vitalício

🚚 *FRETE GRÁTIS*
📦 Compras acima de R$ 80,00
🌍 Para toda Santa Maria

🛒 Acesse: https://mestrescafe.com.br

Para aproveitar, digite *QUERO PROMOCAO*`;

    await this.sendTextMessage(chatId, message);
  }

  /**
   * 🏠 Enviar menu principal
   */
  async sendMainMenu(chatId, name = 'Cliente') {
    const welcomeText = `Olá ${name}! 👋\n\n${this.mainMenu}`;
    await this.sendTextMessage(chatId, welcomeText);
    this.conversationStates.set(chatId, 'MENU_PRINCIPAL');
  }

  /**
   * 🚀 Enviar mensagem de boas-vindas
   */
  async sendWelcomeMessage(chatId, name) {
    const message = `🎉 *Olá ${name}!*

Bem-vindo aos Mestres do Café! ☕

Somos a maior torrefação artesanal de Santa Maria/RS!

🎁 *Novos clientes ganham:*
• 100 pontos de boas-vindas
• 10% OFF na primeira compra
• Frete grátis na primeira compra

${this.mainMenu}`;

    await this.sendTextMessage(chatId, message);
  }

  /**
   * 📈 Notificar sobre pontos ganhos
   */
  async sendPointsNotification(phone, name, points, level) {
    const message = `🎉 *Parabéns ${name}!*

Você ganhou *${points} pontos* com sua compra!

🏅 Nível atual: *${level}*
🎯 Continue comprando e suba de nível!

Digite 2 para ver todos os benefícios! 🚀`;

    // Converter telefone para chatId
    const chatId = phone.includes('@') ? phone : `${phone}@c.us`;
    await this.sendTextMessage(chatId, message);
  }

  /**
   * 💾 Salvar estados das conversas
   */
  saveConversationStates() {
    try {
      const dataDir = path.dirname(this.statesFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const states = Object.fromEntries(this.conversationStates);
      fs.writeFileSync(this.statesFile, JSON.stringify(states, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar estados:', error);
    }
  }

  /**
   * 📂 Carregar estados das conversas
   */
  loadConversationStates() {
    try {
      if (fs.existsSync(this.statesFile)) {
        const states = JSON.parse(fs.readFileSync(this.statesFile, 'utf8'));
        this.conversationStates = new Map(Object.entries(states));
        console.log('✅ Estados de conversa carregados');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estados:', error);
    }
  }

  /**
   * 📱 Broadcast para lista de contatos
   */
  async sendBroadcast(phoneList, message) {
    console.log(`📢 Enviando broadcast para ${phoneList.length} contatos`);
    
    for (const phone of phoneList) {
      try {
        const chatId = phone.includes('@') ? phone : `${phone}@c.us`;
        await this.sendTextMessage(chatId, message);
        
        // Delay entre mensagens para evitar spam
        if (!this.mockMode) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${phone}:`, error);
      }
    }
  }

  /**
   * 🔌 Desconectar bot
   */
  async disconnect() {
    try {
      if (this.client && !this.mockMode) {
        await this.client.destroy();
        this.isReady = false;
        console.log('✅ WhatsApp Bot desconectado');
      } else if (this.mockMode) {
        console.log('🤖 WhatsApp Mock desconectado');
        this.isReady = false;
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }
}

module.exports = WhatsAppService; 