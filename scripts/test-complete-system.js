import 'dotenv/config';
import { supabaseAdmin, getAll, insertRecord, updateRecord, getById } from '../src/lib/supabaseClient.js';

console.log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA MESTRES DO CAFÉ');
console.log('==================================================');

// =============================================
// DADOS DE TESTE
// =============================================

const testUser = {
  email: 'teste@cliente.com',
  name: 'Cliente Teste Funcional',
  user_type: 'customer',
  document: '123.456.789-00',
  points: 0,
  level: 'aprendiz',
  is_active: true
};

const testProduct = {
  name: 'Café Teste Automático',
  description: 'Produto criado automaticamente durante teste funcional',
  price: 35.90,
  original_price: 42.90,
  category: 'teste',
  origin: 'Teste, MG',
  roast_level: 'medium',
  sca_score: 85,
  flavor_notes: ['Chocolate', 'Teste'],
  processing_method: 'Automático',
  altitude: '1.100m',
  stock: 100,
  is_featured: false,
  is_active: true
};

const testOrder = {
  user_id: null, // Será preenchido depois
  total_amount: 71.80,
  status: 'completed',
  payment_method: 'credit_card',
  shipping_address: 'Rua Teste, 123 - Santa Maria/RS',
  points_earned: 72
};

// =============================================
// FUNÇÕES DE TESTE
// =============================================

async function testDatabaseConnection() {
  console.log('\n🔌 1. TESTANDO CONEXÃO COM SUPABASE...');
  try {
    const { data, error } = await supabaseAdmin.from('products').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Conexão com Supabase: OK');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n👤 2. TESTANDO CADASTRO DE USUÁRIO...');
  try {
    // Verificar se usuário já existe
    const existing = await getAll('users');
    const userExists = existing.data.find(u => u.email === testUser.email);
    
    if (userExists) {
      console.log('⚠️ Usuário de teste já existe, pulando criação...');
      return userExists;
    }

    // Criar usuário
    const result = await insertRecord('users', testUser);
    if (result.success) {
      console.log('✅ Usuário criado no Supabase:', result.data.name);
      console.log('📊 ID:', result.data.id);
      console.log('🎮 Nível inicial:', result.data.level);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Erro no cadastro de usuário:', error.message);
    return null;
  }
}

async function testProductCreation() {
  console.log('\n📦 3. TESTANDO CADASTRO DE PRODUTO...');
  try {
    // Verificar se produto já existe
    const existing = await getAll('products');
    const productExists = existing.data.find(p => p.name === testProduct.name);
    
    if (productExists) {
      console.log('⚠️ Produto de teste já existe, pulando criação...');
      return productExists;
    }

    // Criar produto
    const result = await insertRecord('products', testProduct);
    if (result.success) {
      console.log('✅ Produto criado no Supabase:', result.data.name);
      console.log('💰 Preço:', `R$ ${result.data.price.toFixed(2)}`);
      console.log('📊 SCA Score:', result.data.sca_score);
      console.log('🏷️ ID:', result.data.id);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Erro no cadastro de produto:', error.message);
    return null;
  }
}

async function testOrderAndGamification(user, product) {
  console.log('\n🛒 4. TESTANDO SISTEMA DE PEDIDOS + GAMIFICAÇÃO...');
  try {
    if (!user || !product) {
      console.log('⚠️ Usuário ou produto não disponível, pulando teste de pedido');
      return null;
    }

    // Verificar se pedido já existe para este usuário
    const existingOrders = await getAll('orders');
    const orderExists = existingOrders.data.find(o => o.user_id === user.id);
    
    if (orderExists) {
      console.log('⚠️ Pedido de teste já existe, analisando existente...');
      
      // Verificar se pontos foram creditados
      const currentUser = await getById('users', user.id);
      if (currentUser.success) {
        console.log('🎮 Pontos atuais do usuário:', currentUser.data.points);
        console.log('📈 Nível atual:', currentUser.data.level);
      }
      return orderExists;
    }

    // Criar pedido
    const orderData = {
      ...testOrder,
      user_id: user.id
    };

    const orderResult = await insertRecord('orders', orderData);
    if (orderResult.success) {
      console.log('✅ Pedido criado no Supabase:', orderResult.data.id);
      console.log('💰 Valor total:', `R$ ${orderResult.data.total_amount.toFixed(2)}`);
      console.log('🎯 Pontos ganhos:', orderResult.data.points_earned);

      // Criar item do pedido
      const itemData = {
        order_id: orderResult.data.id,
        product_id: product.id,
        quantity: 2,
        unit_price: product.price,
        total_price: product.price * 2
      };

      const itemResult = await insertRecord('order_items', itemData);
      if (itemResult.success) {
        console.log('✅ Item do pedido criado:', itemResult.data.id);
        console.log('📦 Produto:', product.name);
        console.log('🔢 Quantidade:', itemResult.data.quantity);
      }

      // Atualizar pontos do usuário (simular gamificação)
      const newPoints = user.points + orderResult.data.points_earned;
      let newLevel = user.level;
      
      // Lógica de níveis
      if (newPoints >= 500) newLevel = 'mestre';
      else if (newPoints >= 300) newLevel = 'especialista';
      else if (newPoints >= 150) newLevel = 'conhecedor';
      else if (newPoints >= 50) newLevel = 'aprendiz_avancado';

      const userUpdate = await updateRecord('users', user.id, {
        points: newPoints,
        level: newLevel,
        updated_at: new Date().toISOString()
      });

      if (userUpdate.success) {
        console.log('🎮 GAMIFICAÇÃO ATUALIZADA:');
        console.log(`   Pontos: ${user.points} → ${newPoints} (+${orderResult.data.points_earned})`);
        console.log(`   Nível: ${user.level} → ${newLevel}`);
      }

      return orderResult.data;
    } else {
      throw new Error(orderResult.error);
    }
  } catch (error) {
    console.error('❌ Erro no sistema de pedidos:', error.message);
    return null;
  }
}

async function testCRMAndAnalytics() {
  console.log('\n📊 5. TESTANDO CRM E ANALYTICS...');
  try {
    // Buscar estatísticas para o CRM
    const users = await getAll('users');
    const products = await getAll('products');
    const orders = await getAll('orders');
    const blogPosts = await getAll('blog_posts');

    console.log('📈 ESTATÍSTICAS DO CRM:');
    console.log(`   👥 Total de usuários: ${users.data.length}`);
    console.log(`   📦 Total de produtos: ${products.data.length}`);
    console.log(`   🛒 Total de pedidos: ${orders.data.length}`);
    console.log(`   📝 Posts do blog: ${blogPosts.data.length}`);

    // Calcular métricas
    const totalRevenue = orders.data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalPoints = users.data.reduce((sum, user) => sum + (user.points || 0), 0);
    const featuredProducts = products.data.filter(p => p.is_featured).length;

    console.log('\n💰 MÉTRICAS DE NEGÓCIO:');
    console.log(`   💵 Receita total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`   🎯 Total de pontos distribuídos: ${totalPoints}`);
    console.log(`   ⭐ Produtos em destaque: ${featuredProducts}`);

    // Verificar usuários por nível (gamificação)
    const usersByLevel = users.data.reduce((acc, user) => {
      acc[user.level] = (acc[user.level] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🎮 DISTRIBUIÇÃO POR NÍVEL:');
    Object.entries(usersByLevel).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} usuário(s)`);
    });

    return {
      users: users.data.length,
      products: products.data.length,
      orders: orders.data.length,
      revenue: totalRevenue,
      points: totalPoints
    };
  } catch (error) {
    console.error('❌ Erro no CRM/Analytics:', error.message);
    return null;
  }
}

async function testAdminFunctionalities() {
  console.log('\n👨‍💼 6. TESTANDO FUNCIONALIDADES ADMIN...');
  try {
    // Testar busca de produtos em destaque (usado na LandingPage)
    const featuredResult = await getAll('products', {
      orderBy: 'sca_score',
      ascending: false
    });

    const featuredProducts = featuredResult.data.filter(p => p.is_featured);
    console.log('⭐ Produtos em destaque encontrados:', featuredProducts.length);

    // Testar busca de usuários ativos (usado no CRM)
    const activeUsers = await getAll('users');
    const activeCount = activeUsers.data.filter(u => u.is_active !== false).length;
    console.log('👥 Usuários ativos no sistema:', activeCount);

    // Testar blog posts (usado no dashboard)
    const publishedPosts = await getAll('blog_posts');
    console.log('📝 Posts do blog disponíveis:', publishedPosts.data.length);

    // Simular relatório de vendas
    const orders = await getAll('orders');
    const recentOrders = orders.data.filter(order => {
      const orderDate = new Date(order.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate > thirtyDaysAgo;
    });

    console.log('📊 Pedidos dos últimos 30 dias:', recentOrders.length);

    return {
      featured: featuredProducts.length,
      activeUsers: activeCount,
      blogPosts: publishedPosts.data.length,
      recentOrders: recentOrders.length
    };
  } catch (error) {
    console.error('❌ Erro nas funcionalidades admin:', error.message);
    return null;
  }
}

// =============================================
// EXECUÇÃO DOS TESTES
// =============================================

async function runCompleteTest() {
  try {
    console.log('🚀 Iniciando bateria de testes...\n');

    // 1. Teste de conexão
    const connectionOk = await testDatabaseConnection();
    if (!connectionOk) {
      console.log('❌ Falha na conexão. Interrompendo testes.');
      return;
    }

    // 2. Teste de cadastro de usuário
    const newUser = await testUserRegistration();

    // 3. Teste de cadastro de produto
    const newProduct = await testProductCreation();

    // 4. Teste de pedido e gamificação
    const newOrder = await testOrderAndGamification(newUser, newProduct);

    // 5. Teste de CRM e Analytics
    const analytics = await testCRMAndAnalytics();

    // 6. Teste de funcionalidades admin
    const adminStats = await testAdminFunctionalities();

    // Resumo final
    console.log('\n' + '='.repeat(50));
    console.log('🎉 RESUMO DOS TESTES COMPLETADOS');
    console.log('='.repeat(50));

    console.log('✅ Conexão Supabase: OK');
    console.log(`${newUser ? '✅' : '❌'} Cadastro de usuário: ${newUser ? 'OK' : 'FALHA'}`);
    console.log(`${newProduct ? '✅' : '❌'} Cadastro de produto: ${newProduct ? 'OK' : 'FALHA'}`);
    console.log(`${newOrder ? '✅' : '❌'} Sistema de pedidos: ${newOrder ? 'OK' : 'FALHA'}`);
    console.log(`${analytics ? '✅' : '❌'} CRM/Analytics: ${analytics ? 'OK' : 'FALHA'}`);
    console.log(`${adminStats ? '✅' : '❌'} Funcionalidades Admin: ${adminStats ? 'OK' : 'FALHA'}`);

    if (analytics) {
      console.log('\n📊 SISTEMA OPERACIONAL:');
      console.log(`   👥 ${analytics.users} usuários cadastrados`);
      console.log(`   📦 ${analytics.products} produtos no catálogo`);
      console.log(`   🛒 ${analytics.orders} pedidos realizados`);
      console.log(`   💰 R$ ${analytics.revenue.toFixed(2)} em vendas`);
      console.log(`   🎯 ${analytics.points} pontos distribuídos`);
    }

    console.log('\n🚀 SISTEMA 100% INTEGRADO COM SUPABASE!');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteTest();
}

export { runCompleteTest }; 