import 'dotenv/config';
import { supabaseAdmin, insertRecord, getAll } from '../src/lib/supabaseClient.js';

console.log('🌱 Iniciando seed do Supabase...');

// Verificar se temos acesso admin
if (!supabaseAdmin) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

// =============================================
// DADOS DE SEED
// =============================================

const seedProducts = [
  {
    name: 'Café Bourbon Amarelo Premium',
    description: 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo.',
    price: 45.90,
    original_price: 52.90,
    category: 'especial',
    origin: 'Cerrado Mineiro, MG',
    roast_level: 'medium',
    sca_score: 86,
    flavor_notes: ['Chocolate', 'Caramelo', 'Nozes'],
    processing_method: 'Natural',
    altitude: '1.000-1.200m',
    stock: 50,
    is_featured: true,
    is_active: true
  },
  {
    name: 'Café Geisha Especial',
    description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
    price: 89.90,
    original_price: 105.90,
    category: 'premium',
    origin: 'Sul de Minas, MG',
    roast_level: 'light',
    sca_score: 92,
    flavor_notes: ['Floral', 'Cítrico', 'Bergamota'],
    processing_method: 'Honey',
    altitude: '1.400m',
    stock: 25,
    is_featured: true,
    is_active: true
  },
  {
    name: 'Café Arábica Tradicional',
    description: 'Blend exclusivo de grãos selecionados com torra artesanal para um sabor equilibrado.',
    price: 32.90,
    original_price: 38.90,
    category: 'tradicional',
    origin: 'Mogiana, SP',
    roast_level: 'medium-dark',
    sca_score: 82,
    flavor_notes: ['Chocolate Amargo', 'Baunilha'],
    processing_method: 'Via Seca',
    altitude: '900m',
    stock: 80,
    is_featured: false,
    is_active: true
  },
  {
    name: 'Café Orgânico Fazenda Verde',
    description: 'Café 100% orgânico certificado, cultivado com práticas sustentáveis.',
    price: 56.90,
    original_price: 65.90,
    category: 'organico',
    origin: 'Chapada Diamantina, BA',
    roast_level: 'medium',
    sca_score: 88,
    flavor_notes: ['Frutas Vermelhas', 'Mel', 'Cítrico'],
    processing_method: 'Natural',
    altitude: '1.200m',
    stock: 35,
    is_featured: true,
    is_active: true
  },
  {
    name: 'Café Catuaí Vermelho',
    description: 'Café tradicional brasileiro com corpo encorpado e baixa acidez.',
    price: 28.90,
    original_price: null,
    category: 'tradicional',
    origin: 'Zona da Mata, MG',
    roast_level: 'medium-dark',
    sca_score: 80,
    flavor_notes: ['Chocolate Amargo', 'Castanhas'],
    processing_method: 'Via Seca',
    altitude: '900m',
    stock: 100,
    is_featured: false,
    is_active: true
  },
  {
    name: 'Café Microlote Especial',
    description: 'Edição limitada de microlote especial com pontuação SCAA acima de 85 pontos.',
    price: 120.90,
    original_price: 135.90,
    category: 'premium',
    origin: 'Mantiqueira, MG',
    roast_level: 'light',
    sca_score: 94,
    flavor_notes: ['Frutas Tropicais', 'Floral', 'Mel'],
    processing_method: 'Honey',
    altitude: '1.300m',
    stock: 15,
    is_featured: true,
    is_active: true
  }
];

const seedBlogPosts = [
  {
    title: 'Guia Completo para Iniciantes no Café Especial',
    content: 'O mundo dos cafés especiais pode parecer complexo no início, mas com as informações certas, qualquer pessoa pode aprender a apreciar essas bebidas excepcionais...',
    excerpt: 'Descubra como começar sua jornada no mundo dos cafés especiais com este guia abrangente.',
    author: 'Equipe Mestres do Café',
    category: 'educativo',
    status: 'published',
    is_featured: true
  },
  {
    title: 'A Arte da Torra: Como ela Afeta o Sabor do Café',
    content: 'A torrefação é uma das etapas mais importantes na produção do café. É durante este processo que os grãos desenvolvem os sabores e aromas que conhecemos...',
    excerpt: 'Entenda como diferentes níveis de torra influenciam o perfil sensorial do seu café.',
    author: 'Mestre Torredor João Silva',
    category: 'tecnico',
    status: 'published',
    is_featured: true
  },
  {
    title: 'Métodos de Preparo: V60, Chemex e Prensa Francesa',
    content: 'Cada método de preparo extrai diferentes características do café. Neste artigo, comparamos três métodos populares...',
    excerpt: 'Compare os métodos de preparo mais populares e escolha o ideal para seu paladar.',
    author: 'Barista Ana Paula',
    category: 'preparo',
    status: 'published',
    is_featured: false
  }
];

const seedUsers = [
  {
    email: 'admin@mestrescafe.com',
    name: 'Administrador',
    user_type: 'admin',
    points: 0,
    level: 'admin',
    is_active: true
  },
  {
    email: 'cliente@email.com',
    name: 'Cliente Exemplo',
    user_type: 'customer',
    points: 150,
    level: 'bronze',
    is_active: true
  }
];

// =============================================
// FUNÇÕES DE SEED
// =============================================

async function seedTable(tableName, data, options = {}) {
  const { skipIfExists = true, identifierField = 'name' } = options;
  
  console.log(`\n📦 Seeding tabela: ${tableName}`);
  
  // Verificar se já existem dados
  if (skipIfExists) {
    const existing = await getAll(tableName);
    if (existing.success && existing.data.length > 0) {
      console.log(`⏭️ Tabela ${tableName} já possui ${existing.data.length} registros, pulando...`);
      return existing.data;
    }
  }
  
  const results = [];
  
  for (const item of data) {
    try {
      // Adicionar timestamps
      const record = {
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const result = await insertRecord(tableName, record);
      
      if (result.success) {
        results.push(result.data);
        console.log(`✅ ${tableName}: ${record[identifierField] || record.id || 'registro'} criado`);
      } else {
        console.error(`❌ Erro ao criar ${record[identifierField]}:`, result.error);
      }
      
      // Pequena pausa para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Erro no seed de ${tableName}:`, error);
    }
  }
  
  console.log(`✅ ${tableName}: ${results.length}/${data.length} registros criados`);
  return results;
}

async function clearTable(tableName) {
  console.log(`🗑️ Limpando tabela: ${tableName}`);
  
  try {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .neq('id', 0); // Deletar tudo
    
    if (error) {
      console.error(`❌ Erro ao limpar ${tableName}:`, error);
    } else {
      console.log(`✅ Tabela ${tableName} limpa`);
    }
  } catch (error) {
    console.error(`❌ Erro ao limpar ${tableName}:`, error);
  }
}

async function showStats() {
  console.log('\n📊 ESTATÍSTICAS FINAIS:');
  console.log('==================================================');
  
  const tables = ['products', 'blog_posts', 'users', 'orders'];
  
  for (const table of tables) {
    const result = await getAll(table);
    if (result.success) {
      console.log(`📋 ${table}: ${result.data.length} registros`);
    }
  }
  
  console.log('==================================================');
}

// =============================================
// EXECUÇÃO PRINCIPAL
// =============================================

async function main() {
  try {
    console.log('🚀 Iniciando processo de seed...');
    console.log('==================================================');
    
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');
    const shouldForce = args.includes('--force');
    
    if (shouldClear) {
      console.log('🗑️ Limpando dados existentes...');
      await clearTable('products');
      await clearTable('blog_posts');
      // Não limpar users para preservar dados de login
    }
    
    // Seed em ordem de dependência
    await seedTable('products', seedProducts, { 
      skipIfExists: !shouldForce,
      identifierField: 'name' 
    });
    
    await seedTable('blog_posts', seedBlogPosts, { 
      skipIfExists: !shouldForce,
      identifierField: 'title' 
    });
    
    // Users apenas se não existirem
    await seedTable('users', seedUsers, { 
      skipIfExists: true,
      identifierField: 'email' 
    });
    
    // Estatísticas finais
    await showStats();
    
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('==================================================');
    console.log('✅ Banco de dados populado com dados de teste');
    console.log('📝 Execute npm run export:supabase para verificar');
    console.log('🌐 Acesse o app para ver os novos dados');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as seedSupabase, seedTable, clearTable }; 