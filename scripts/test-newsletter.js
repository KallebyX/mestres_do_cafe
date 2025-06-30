/**
 * 🧪 Teste da Newsletter - Mestres do Café
 * Script para testar a funcionalidade de newsletter
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api'; // ou sua URL de produção

// Dados de teste
const testNewsletter = {
  title: '🧪 TESTE DO SISTEMA | Mestres do Café',
  message: `┌─────────────────────────────┐
│  🧪 TESTE DO SISTEMA 🧪    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕🔧

🎯 *TESTE DE NEWSLETTER ATIVO!*

✅ *FUNCIONALIDADES TESTADAS:*
├ 📧 Envio por email
├ 📱 Envio por WhatsApp
├ 🎨 Templates personalizados
├ 👤 Personalização com nome
├ 📅 Substituição de data
└ 🔒 Validações de segurança

📊 *RESULTADOS ESPERADOS:*
🟢 Sistema: 100% operacional
🟢 Entrega: Instantânea
🟢 Personalização: Funcionando
🟢 Integração: WhatsApp + Email

📅 *Data do teste:* [DATA]
🏷️ *Versão:* Newsletter System v1.0

🎉 *Se você recebeu esta mensagem, nosso sistema está funcionando perfeitamente!*

☕ Equipe de Desenvolvimento
🌟 Mestres do Café - Santa Maria/RS`,
  sendMethod: 'both', // 'email', 'whatsapp', 'both'
  audience: 'all'
};

const testCustomers = [
  {
    id: 1,
    name: 'João da Silva',
    email: 'joao@teste.com',
    phone: '(55) 99999-1234',
    is_active: true
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@teste.com',
    phone: '(55) 99999-5678',
    is_active: true
  }
];

/**
 * 🔄 Testar status dos serviços
 */
async function testServices() {
  console.log('🔄 Testando serviços...\n');

  try {
    // Testar conexões
    const response = await fetch(`${API_BASE_URL}/newsletter/test`);
    const result = await response.json();

    console.log('📊 Status dos serviços:');
    console.log(`📧 Email: ${result.tests.email ? '✅ Funcionando' : '❌ Offline'}`);
    console.log(`📱 WhatsApp: ${result.tests.whatsapp ? '✅ Funcionando' : '❌ Offline'}`);
    console.log(`⏰ Timestamp: ${result.tests.timestamp}\n`);

    return result.tests;
  } catch (error) {
    console.error('❌ Erro ao testar serviços:', error.message);
    return { email: false, whatsapp: false };
  }
}

/**
 * 📝 Testar templates
 */
async function testTemplates() {
  console.log('📝 Testando templates...\n');

  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/templates`);
    const result = await response.json();

    if (result.success) {
      console.log(`✅ ${result.count} templates disponíveis:`);
      Object.keys(result.templates).forEach(key => {
        const template = result.templates[key];
        console.log(`  • ${key}: ${template.title} (${template.category})`);
      });
      console.log('');
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao testar templates:', error.message);
    return { success: false };
  }
}

/**
 * 📧 Testar envio de email
 */
async function testEmailNewsletter() {
  console.log('📧 Testando envio por email...\n');

  const emailRecipients = testCustomers.map(customer => ({
    name: customer.name,
    email: customer.email,
    message: testNewsletter.message
      .replace(/\[NOME\]/g, customer.name)
      .replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'))
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: emailRecipients,
        subject: testNewsletter.title,
        message: testNewsletter.message
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Emails enviados: ${result.sent}`);
      console.log(`❌ Emails falharam: ${result.failed || 0}`);
      console.log(`📨 Mensagem: ${result.message}\n`);
    } else {
      console.log(`❌ Erro no envio: ${result.error}\n`);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao testar email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 📱 Testar envio via WhatsApp
 */
async function testWhatsAppNewsletter() {
  console.log('📱 Testando envio via WhatsApp...\n');

  const whatsappRecipients = testCustomers
    .filter(customer => customer.phone)
    .map(customer => ({
      name: customer.name,
      phone: customer.phone,
      message: testNewsletter.message
        .replace(/\[NOME\]/g, customer.name)
        .replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'))
    }));

  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: whatsappRecipients,
        message: testNewsletter.message
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ WhatsApp enviados: ${result.sent}`);
      console.log(`❌ WhatsApp falharam: ${result.failed || 0}`);
      console.log(`📨 Mensagem: ${result.message}\n`);
    } else {
      console.log(`❌ Erro no envio: ${result.error}\n`);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao testar WhatsApp:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🎯 Testar newsletter completa
 */
async function testCompleteNewsletter() {
  console.log('🎯 Testando newsletter completa (Email + WhatsApp)...\n');

  // Simular dados que viriam do frontend
  const newsletterData = {
    ...testNewsletter,
    template: 'custom'
  };

  const customers = testCustomers;

  try {
    // Aqui simularíamos a chamada da API do frontend
    console.log('📧📱 Simulando envio completo...');
    console.log(`🎯 Método: ${newsletterData.sendMethod}`);
    console.log(`👥 Destinatários: ${customers.length}`);
    console.log(`📝 Título: ${newsletterData.title}`);
    console.log(`📱 Com telefone: ${customers.filter(c => c.phone).length}`);
    console.log(`📧 Com email: ${customers.filter(c => c.email).length}\n`);

    // Testar validação (seria chamada pelo frontend)
    const hasEmail = customers.some(c => c.email);
    const hasPhone = customers.some(c => c.phone);

    if (newsletterData.sendMethod === 'email' && !hasEmail) {
      console.log('❌ Erro: Nenhum cliente com email para envio por email');
      return { success: false };
    }

    if (newsletterData.sendMethod === 'whatsapp' && !hasPhone) {
      console.log('❌ Erro: Nenhum cliente com telefone para envio por WhatsApp');
      return { success: false };
    }

    console.log('✅ Validações passaram! Newsletter pode ser enviada.\n');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste completo:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Executar todos os testes
 */
async function runAllTests() {
  console.log('🧪 ===== TESTE DA NEWSLETTER - MESTRES DO CAFÉ ===== 🧪\n');

  const results = {
    services: await testServices(),
    templates: await testTemplates(),
    email: await testEmailNewsletter(),
    whatsapp: await testWhatsAppNewsletter(),
    complete: await testCompleteNewsletter()
  };

  console.log('📊 ===== RESUMO DOS TESTES ===== 📊\n');
  console.log(`🔧 Serviços: Email ${results.services.email ? '✅' : '❌'}, WhatsApp ${results.services.whatsapp ? '✅' : '❌'}`);
  console.log(`📝 Templates: ${results.templates.success ? '✅' : '❌'}`);
  console.log(`📧 Email: ${results.email.success ? '✅' : '❌'}`);
  console.log(`📱 WhatsApp: ${results.whatsapp.success ? '✅' : '❌'}`);
  console.log(`🎯 Newsletter Completa: ${results.complete.success ? '✅' : '❌'}\n`);

  const allPassed = Object.values(results).every(result => result.success !== false);
  console.log(allPassed ? '🎉 Todos os testes passaram!' : '⚠️ Alguns testes falharam');
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testServices,
  testTemplates,
  testEmailNewsletter,
  testWhatsAppNewsletter,
  testCompleteNewsletter
}; 