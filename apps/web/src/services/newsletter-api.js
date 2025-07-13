/**
 * 📧📱 Newsletter API - Mestres do Café
 * Integração completa para envio de newsletters via Email e WhatsApp
 */

import { newsletterAPI } from './api.js';

/**
 * 📤 Enviar newsletter por email
 */
export const sendEmailNewsletter = async (recipients, subject, message) => {
  try {
    const result = await newsletterAPI.send({
      type: 'email',
      recipients,
      subject,
      message,
      timestamp: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Erro ao enviar newsletter por email:', error);
    throw error;
  }
};

/**
 * 📱 Enviar newsletter por WhatsApp
 */
export const sendWhatsAppNewsletter = async (recipients, message) => {
  try {
    const result = await newsletterAPI.send({
      type: 'whatsapp',
      recipients,
      message,
      timestamp: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Erro ao enviar newsletter por WhatsApp:', error);
    throw error;
  }
};

/**
 * 🔄 Verificar status do WhatsApp
 */
export const getWhatsAppStatus = async () => {
  try {
    const result = await newsletterAPI.getStatus();
    return result;
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error);
    return { connected: false, error: error.message };
  }
};

/**
 * 📊 Obter estatísticas de newsletter
 */
export const getNewsletterStats = async () => {
  try {
    const result = await newsletterAPI.getStats();
    return result;
  } catch (error) {
    console.error('Erro ao obter estatísticas da newsletter:', error);
    return { totalSent: 0, totalEmails: 0, totalWhatsApp: 0, error: error.message };
  }
};

/**
 * 🎯 Enviar newsletter completa (email + WhatsApp)
 */
export const sendCompleteNewsletter = async (newsletterData, customers) => {
  const results = {
    email: { success: 0, failed: 0, errors: [] },
    whatsapp: { success: 0, failed: 0, errors: [] },
    total: customers.length
  };

  // Preparar dados dos destinatários
  const emailRecipients = customers.map(customer => ({
    name: customer.name,
    email: customer.email,
    message: newsletterData.message.replace(/\[NOME\]/g, customer.name).replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'))
  }));

  const whatsappRecipients = customers
    .filter(customer => customer.phone)
    .map(customer => ({
      name: customer.name,
      phone: customer.phone,
      message: newsletterData.message.replace(/\[NOME\]/g, customer.name).replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'))
    }));

  try {
    // Enviar por email se selecionado
    if (newsletterData.sendMethod === 'email' || newsletterData.sendMethod === 'both') {
      try {
        const emailResult = await sendEmailNewsletter(emailRecipients, newsletterData.title, newsletterData.message);
        if (emailResult.success) {
          results.email.success = emailResult.sent || emailRecipients.length;
        } else {
          results.email.failed = emailRecipients.length;
          results.email.errors.push(emailResult.error || 'Erro desconhecido no envio de email');
        }
      } catch (error) {
        results.email.failed = emailRecipients.length;
        results.email.errors.push(error.message);
      }
    }

    // Enviar por WhatsApp se selecionado
    if (newsletterData.sendMethod === 'whatsapp' || newsletterData.sendMethod === 'both') {
      try {
        const whatsappResult = await sendWhatsAppNewsletter(whatsappRecipients, newsletterData.message);
        if (whatsappResult.success) {
          results.whatsapp.success = whatsappResult.sent || whatsappRecipients.length;
        } else {
          results.whatsapp.failed = whatsappRecipients.length;
          results.whatsapp.errors.push(whatsappResult.error || 'Erro desconhecido no envio de WhatsApp');
        }
      } catch (error) {
        results.whatsapp.failed = whatsappRecipients.length;
        results.whatsapp.errors.push(error.message);
      }
    }

    return {
      success: true,
      results,
      message: `Newsletter enviada! Email: ${results.email.success}/${emailRecipients.length}, WhatsApp: ${results.whatsapp.success}/${whatsappRecipients.length}`
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

/**
 * 🔧 Validar configurações da newsletter
 */
export const validateNewsletterData = (newsletterData, customers) => {
  const errors = [];

  if (!newsletterData.title || newsletterData.title.trim() === '') {
    errors.push('Título é obrigatório');
  }

  if (!newsletterData.message || newsletterData.message.trim() === '') {
    errors.push('Mensagem é obrigatória');
  }

  if (!customers || customers.length === 0) {
    errors.push('Selecione pelo menos um cliente');
  }

  if (newsletterData.sendMethod === 'email' || newsletterData.sendMethod === 'both') {
    const customersWithoutEmail = customers.filter(c => !c.email);
    if (customersWithoutEmail.length > 0) {
      errors.push(`${customersWithoutEmail.length} cliente(s) sem email cadastrado`);
    }
  }

  if (newsletterData.sendMethod === 'whatsapp' || newsletterData.sendMethod === 'both') {
    const customersWithoutPhone = customers.filter(c => !c.phone);
    if (customersWithoutPhone.length === customers.length) {
      errors.push('Nenhum cliente possui telefone cadastrado para WhatsApp');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 📝 Templates de newsletter pré-definidos
 */
export const getNewsletterTemplates = () => {
  return {
    promotion: {
      title: '🔥 OFERTA IMPERDÍVEL | Mestres do Café',
      message: `┌─────────────────────────────┐
│  🔥 OFERTA EXCLUSIVA 🔥    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕✨

🎯 *LIQUIDAÇÃO ESPECIAL* acontecendo AGORA!

💰 *DESCONTOS INCRÍVEIS:*
├ 🏆 Premium: 25% OFF
├ ⭐ Especiais: 20% OFF  
├ 🌟 Tradicionais: 15% OFF
└ 🎁 FRETE GRÁTIS acima de R$ 89

⏰ *ÚLTIMAS HORAS* - Válido até [DATA]

🛒 *GARANTIR DESCONTO:*
🔗 mestrescafe.com.br/promocao
🏷️ Cupom: MESTRE25

🚚 *Entrega expressa em Santa Maria/RS*
📞 *Dúvidas: (55) 3220-1234*

┌─────────────────────────────┐
│ Não perca! Estoque limitado │
└─────────────────────────────┘

🌟 Equipe Mestres do Café
📍 Santa Maria/RS - Desde 2020`
    },
    newsletter: {
      title: '📰 Novidades Quentinhas | Mestres do Café',
      message: `┌─────────────────────────────┐
│   📰 NEWSLETTER SEMANAL    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕📰

🗞️ *AS NOVIDADES DA SEMANA:*

🌟 *DESTAQUES:*
├ ☕ Lançamento: Café Bourbon Premium
├ 🏪 Nova loja na Rua do Acampamento  
├ 🎓 Workshop gratuito de barista
└ 🏆 Sistema de pontos renovado

📈 *CAFÉ DO MÊS:*
🥇 Geisha Especial - Notas florais
💝 Edição limitada com 30% OFF

🎯 *EVENTOS EM MARÇO:*
├ 📅 05/03 - Degustação gratuita
├ 📅 12/03 - Workshop de latte art
└ 📅 19/03 - Concurso de receitas

📚 *DICA DO ESPECIALISTA:*
"Para realçar notas frutais, use água entre 88-92°C"
- João, Mestre Barista

🔗 *LEIA MAIS:*
📖 mestrescafe.com.br/blog
📱 Nos siga: @mestres_do_cafe

☕ Até a próxima semana!
🌟 Equipe Mestres do Café`
    },
    welcome: {
      title: '🎊 Seja Bem-Vindo(a) à Família! | Mestres do Café',
      message: `┌─────────────────────────────┐
│  🎊 BEM-VINDO À FAMÍLIA!   │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕🤝

🌟 *Você agora faz parte da nossa família de apaixonados por café!*

🎁 *SEUS BENEFÍCIOS DE BOAS-VINDAS:*
├ 🏷️ 15% OFF na primeira compra
├ 🚚 FRETE GRÁTIS sem valor mínimo
├ ⭐ 200 PONTOS de bônus
├ 📱 Acesso VIP às promoções
└ 📰 Newsletter exclusiva

☕ *CONHEÇA NOSSA SELEÇÃO:*
🥇 Cafés Premium: Geisha, Bourbon
⭐ Especiais: Catuaí, Mundo Novo  
🌟 Tradicionais: Blend Supremo

🏆 *PROGRAMA MESTRES:*
💰 Acumule pontos a cada compra
🎯 Troque por descontos e brindes
📈 Evolua de Aprendiz à Lenda!

🛒 *FAZER PRIMEIRA COMPRA:*
🔗 mestrescafe.com.br
🏷️ Cupom: BEMVINDO15
⏰ Válido por 30 dias

📞 *CONTATO:*
💬 WhatsApp: (55) 99999-9999
📧 Email: contato@mestrescafe.com.br

☕ Bem-vindo(a) à jornada do café perfeito!
🌟 Equipe Mestres do Café`
    },
    birthday: {
      title: '🎂 Parabéns! Hoje é seu Dia Especial! | Mestres do Café',
      message: `┌─────────────────────────────┐
│   🎂 FELIZ ANIVERSÁRIO!    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

🎊 *PARABÉNS, [NOME]!* 🎊

Hoje é um dia muito especial! A família Mestres do Café deseja um feliz aniversário repleto de alegria e momentos especiais! ☕🎈

🎁 *SEU PRESENTE DE ANIVERSÁRIO:*
├ 🏷️ 30% OFF em TODA loja
├ ☕ Café de aniversário GRÁTIS*  
├ 🎂 Brownie especial na compra
├ 📦 Frete grátis para qualquer valor
└ ⭐ PONTOS EM DOBRO por 7 dias

🏪 *RETIRAR SEU CAFÉ GRÁTIS:*
📍 Qualquer uma de nossas lojas
🆔 Apresente este cupom
⏰ Válido até: [DATA]

🛒 *APROVEITAR 30% OFF:*
🔗 mestrescafe.com.br/aniversario
🏷️ Cupom: NIVER30
📅 Válido por 7 dias

☕ *SUGESTÃO ESPECIAL:*
🥇 Geisha Premium - Perfeito para celebrar!
🎯 Com seu desconto fica R$ 62,93

📞 *AGENDAR RETIRADA:*
💬 WhatsApp: (55) 99999-9999
📧 Email: aniversarios@mestrescafe.com.br

🎉 *Que seu novo ano seja repleto de cafés especiais e momentos inesquecíveis!*

☕ Com carinho,
🌟 Toda equipe Mestres do Café

*Café grátis: Tradicional 100g nas lojas físicas`
    },
    event: {
      title: '🎪 Evento Especial | Mestres do Café',
      message: `┌─────────────────────────────┐
│   🎪 EVENTO ESPECIAL       │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! 🎭☕

🎯 *VOCÊ ESTÁ CONVIDADO(A) PARA:*

🎪 **FESTIVAL DO CAFÉ 2024**
📅 Data: [DATA]
🕐 Horário: 14h às 20h
📍 Local: Loja Centro - Rua do Acampamento, 123

🌟 *PROGRAMAÇÃO:*
├ 14h - Abertura e degustação
├ 15h - Workshop de métodos de preparo
├ 16h30 - Palestra sobre origens
├ 18h - Concurso de latte art
└ 19h - Sorteios e encerramento

🎁 *BENEFÍCIOS EXCLUSIVOS:*
├ 🎫 Entrada GRATUITA  
├ ☕ Degustação ilimitada
├ 🏷️ 20% OFF em compras no evento
├ 🎪 Brindes exclusivos
└ 📜 Certificado de participação

🏆 *CONCURSO LATTE ART:*
🥇 1º lugar: Kit barista completo
🥈 2º lugar: 1kg de café premium  
🥉 3º lugar: Xícara personalizada

📝 *CONFIRMAR PRESENÇA:*
💬 WhatsApp: (55) 99999-9999
🔗 mestrescafe.com.br/eventos
📧 eventos@mestrescafe.com.br

🎪 Venha viver uma experiência única no mundo do café!

☕ Te esperamos lá!
🌟 Equipe Mestres do Café`
    }
  };
};

export default {
  sendEmailNewsletter,
  sendWhatsAppNewsletter,
  getWhatsAppStatus,
  getNewsletterStats,
  sendCompleteNewsletter,
  validateNewsletterData,
  getNewsletterTemplates
}; 