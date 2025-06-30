/**
 * 📧📱 Newsletter Routes - Mestres do Café
 * Rotas para envio de newsletters via Email e WhatsApp
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Importar o WhatsApp Service existente
const WhatsAppService = require('../services/WhatsAppService');

// Inicializar serviços
let whatsappService = null;
let emailTransporter = null;

// Inicializar WhatsApp Service
try {
  whatsappService = new WhatsAppService();
  console.log('✅ WhatsApp Service inicializado para newsletter');
} catch (error) {
  console.log('⚠️ WhatsApp Service em modo mock para newsletter:', error.message);
}

// Configurar transporter de email (usando variáveis de ambiente)
const initEmailService = () => {
  try {
    emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'seu-email@gmail.com',
        pass: process.env.SMTP_PASS || 'sua-senha-app'
      }
    });
    console.log('✅ Serviço de email configurado');
  } catch (error) {
    console.log('⚠️ Erro ao configurar email service:', error.message);
  }
};

// Inicializar email service
initEmailService();

/**
 * 📤 Enviar newsletter por email
 */
router.post('/email', async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de destinatários é obrigatória'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Assunto e mensagem são obrigatórios'
      });
    }

    // Simular envio em desenvolvimento
    if (!emailTransporter) {
      console.log('📧 [SIMULAÇÃO] Newsletter por email enviada para:', recipients.length, 'destinatários');
      console.log('📧 Assunto:', subject);
      console.log('📧 Destinatários:', recipients.map(r => r.email).join(', '));
      
      return res.json({
        success: true,
        sent: recipients.length,
        message: `Newsletter enviada com sucesso para ${recipients.length} destinatários (modo simulação)`,
        timestamp: new Date().toISOString()
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Enviar emails
    for (const recipient of recipients) {
      try {
        const personalizedMessage = recipient.message || message;
        
        await emailTransporter.sendMail({
          from: `"Mestres do Café" <${process.env.SMTP_USER}>`,
          to: recipient.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">☕ Mestres do Café</h1>
              </div>
              <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1f2937;">${subject}</h2>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
                  ${personalizedMessage.replace(/\*/g, '<strong>').replace(/\n/g, '<br>')}
                </div>
              </div>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>© 2024 Mestres do Café - Santa Maria/RS</p>
                <p>Este email foi enviado porque você é cliente da nossa loja.</p>
              </div>
            </div>
          `
        });

        successCount++;
        console.log(`📧 Email enviado para ${recipient.email}`);
      } catch (error) {
        errorCount++;
        errors.push({
          email: recipient.email,
          error: error.message
        });
        console.error(`❌ Erro ao enviar email para ${recipient.email}:`, error.message);
      }
    }

    res.json({
      success: true,
      sent: successCount,
      failed: errorCount,
      errors,
      message: `Newsletter enviada: ${successCount} sucessos, ${errorCount} falhas`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no envio de newsletter por email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor: ' + error.message
    });
  }
});

/**
 * 📱 Enviar newsletter por WhatsApp
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const { recipients, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de destinatários é obrigatória'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    if (!whatsappService) {
      return res.status(503).json({
        success: false,
        error: 'Serviço do WhatsApp não disponível'
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Enviar mensagens WhatsApp
    for (const recipient of recipients) {
      try {
        // Formatear número para WhatsApp
        const cleanPhone = recipient.phone.replace(/\D/g, '');
        const whatsappId = `55${cleanPhone}@c.us`; // Formato Brasil
        
        const personalizedMessage = recipient.message || message;
        
        await whatsappService.sendTextMessage(whatsappId, personalizedMessage);
        
        successCount++;
        console.log(`📱 WhatsApp enviado para ${recipient.phone}`);
        
        // Delay entre mensagens para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        errors.push({
          phone: recipient.phone,
          error: error.message
        });
        console.error(`❌ Erro ao enviar WhatsApp para ${recipient.phone}:`, error.message);
      }
    }

    res.json({
      success: true,
      sent: successCount,
      failed: errorCount,
      errors,
      message: `Newsletter WhatsApp enviada: ${successCount} sucessos, ${errorCount} falhas`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no envio de newsletter por WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor: ' + error.message
    });
  }
});

/**
 * 🔄 Status do WhatsApp
 */
router.get('/whatsapp/status', async (req, res) => {
  try {
    if (!whatsappService) {
      return res.json({
        connected: false,
        error: 'Serviço do WhatsApp não inicializado',
        timestamp: new Date().toISOString()
      });
    }

    const status = await whatsappService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('❌ Erro ao obter status do WhatsApp:', error);
    res.status(500).json({
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 📊 Estatísticas da newsletter
 */
router.get('/stats', async (req, res) => {
  try {
    // Aqui você poderia implementar um banco de dados para armazenar estatísticas
    // Por enquanto, retornamos dados simulados
    res.json({
      totalSent: 0,
      totalEmails: 0,
      totalWhatsApp: 0,
      lastSent: null,
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 🧪 Testar conexões
 */
router.get('/test', async (req, res) => {
  const tests = {
    whatsapp: false,
    email: false,
    timestamp: new Date().toISOString()
  };

  // Testar WhatsApp
  try {
    if (whatsappService) {
      const status = await whatsappService.getStatus();
      tests.whatsapp = status.connected || status.mockMode;
    }
  } catch (error) {
    console.log('❌ Erro no teste WhatsApp:', error.message);
  }

  // Testar Email
  try {
    if (emailTransporter) {
      await emailTransporter.verify();
      tests.email = true;
    }
  } catch (error) {
    console.log('❌ Erro no teste Email:', error.message);
  }

  res.json({
    success: true,
    tests,
    message: `WhatsApp: ${tests.whatsapp ? '✅' : '❌'}, Email: ${tests.email ? '✅' : '❌'}`
  });
});

/**
 * 📝 Templates disponíveis
 */
router.get('/templates', (req, res) => {
  const templates = {
    promotion: {
      title: '🔥 OFERTA IMPERDÍVEL | Mestres do Café',
      category: 'marketing',
      description: 'Template premium para promoções e liquidações especiais'
    },
    newsletter: {
      title: '📰 Novidades Quentinhas | Mestres do Café',
      category: 'informativo',
      description: 'Newsletter semanal com novidades e dicas de café'
    },
    welcome: {
      title: '🎊 Seja Bem-Vindo(a) à Família! | Mestres do Café',
      category: 'boas-vindas',
      description: 'Boas-vindas completas com benefícios e programa de pontos'
    },
    birthday: {
      title: '🎂 Parabéns! Hoje é seu Dia Especial! | Mestres do Café',
      category: 'comemorativo',
      description: 'Mensagem especial de aniversário com presentes exclusivos'
    },
    event: {
      title: '🎪 Evento Especial | Mestres do Café',
      category: 'eventos',
      description: 'Convites para workshops, degustações e eventos especiais'
    }
  };

  res.json({
    success: true,
    templates,
    count: Object.keys(templates).length
  });
});

module.exports = router; 