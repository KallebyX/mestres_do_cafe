const bcrypt = require('bcryptjs');
const { db } = require('../database/init');

async function seedData() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário admin
    const _adminPassword = await bcrypt.hash('admin123', 12);
    
    const _adminSql = `INSERT OR IGNORE INTO users (
      name, email, password, user_type, phone, is_active
    ) VALUES (?, ?, ?, ?, ?, ?)`;
    
    await new Promise((resolve, reject) => {
      db.run(adminSql, [
        'Administrador',
        'admin@mestrescafe.com.br',
        adminPassword,
        'admin',
        '(11) 99999-9999',
        1
      ], function(err) {
        if (err) reject(err);
        else {
          console.log('✅ Usuário admin criado');
          resolve();
        }
      });
    });

    // Criar categorias
    const _categories = [
      {
        name: 'Cafés Especiais',
        description: 'Cafés com pontuação acima de 80 pontos pela SCA',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300'
      },
      {
        name: 'Café Gourmet',
        description: 'Cafés premium com sabores únicos',
        image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300'
      },
      {
        name: 'Café Orgânico',
        description: 'Cafés cultivados sem agrotóxicos',
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300'
      },
      {
        name: 'Café Torrado',
        description: 'Cafés torrados na hora para máximo frescor',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'
      }
    ];

    const _categoryIds = [];
    for (const category of categories) {
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO categories (name, description, image_url) VALUES (?, ?, ?)',
               [category.name, category.description, category.image_url], function(err) {
          if (err) reject(err);
          else {
            categoryIds.push(this.lastID || 1);
            console.log(`✅ Categoria "${category.name}" criada`);
            resolve();
          }
        });
      });
    }

    // Criar produtos
    const _products = [
      {
        name: 'Café Bourbon Amarelo Premium',
        description: 'Café especial da região do Cerrado Mineiro, com notas de chocolate e caramelo. Pontuação SCA: 84 pontos.',
        price: 45.90,
        original_price: 52.90,
        category_id: categoryIds[0] || 1,
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        origin: 'Cerrado Mineiro, MG',
        roast_level: 'Médio',
        flavor_notes: 'Chocolate, Caramelo, Nozes',
        processing_method: 'Via Seca',
        altitude: '1.200m',
        stock_quantity: 50,
        is_featured: 1
      },
      {
        name: 'Café Geisha Especial',
        description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas, sabor floral e cítrico único.',
        price: 89.90,
        original_price: 105.90,
        category_id: categoryIds[0] || 1,
        image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        origin: 'Sul de Minas, MG',
        roast_level: 'Claro',
        flavor_notes: 'Floral, Cítrico, Bergamota',
        processing_method: 'Via Úmida',
        altitude: '1.400m',
        stock_quantity: 25,
        is_featured: 1
      },
      {
        name: 'Café Orgânico Fazenda Verde',
        description: 'Café 100% orgânico certificado, cultivado com práticas sustentáveis.',
        price: 38.90,
        original_price: null,
        category_id: categoryIds[2] || 3,
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        origin: 'Mogiana, SP',
        roast_level: 'Médio',
        flavor_notes: 'Frutas Vermelhas, Mel',
        processing_method: 'Via Seca',
        altitude: '1.000m',
        stock_quantity: 75,
        is_featured: 0
      },
      {
        name: 'Café Catuaí Vermelho',
        description: 'Café tradicional brasileiro com corpo encorpado e baixa acidez.',
        price: 28.90,
        original_price: 34.90,
        category_id: categoryIds[1] || 2,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        origin: 'Zona da Mata, MG',
        roast_level: 'Médio-Escuro',
        flavor_notes: 'Chocolate Amargo, Castanhas',
        processing_method: 'Via Seca',
        altitude: '900m',
        stock_quantity: 100,
        is_featured: 0
      },
      {
        name: 'Café Pacamara Microlote',
        description: 'Microlote especial da variedade Pacamara, notas complexas e perfil sensorial único.',
        price: 75.90,
        original_price: null,
        category_id: categoryIds[0] || 1,
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        origin: 'Mantiqueira, MG',
        roast_level: 'Médio-Claro',
        flavor_notes: 'Frutas Tropicais, Baunilha',
        processing_method: 'Honey',
        altitude: '1.300m',
        stock_quantity: 15,
        is_featured: 1
      },
      {
        name: 'Café Blend Torrado Especial',
        description: 'Blend harmonioso de diferentes origens, torrado artesanalmente.',
        price: 32.90,
        original_price: 39.90,
        category_id: categoryIds[3] || 4,
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        origin: 'Blend Brasil',
        roast_level: 'Médio',
        flavor_notes: 'Equilibrado, Doce, Suave',
        processing_method: 'Misto',
        altitude: 'Variado',
        stock_quantity: 80,
        is_featured: 0
      }
    ];

    for (const product of products) {
      await new Promise((resolve, reject) => {
        const _sql = `INSERT OR IGNORE INTO products (
          name, description, price, original_price, category_id,
          image_url, origin, roast_level, flavor_notes, processing_method,
          altitude, stock_quantity, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
          product.name, product.description, product.price, product.original_price,
          product.category_id, product.image_url, product.origin, product.roast_level,
          product.flavor_notes, product.processing_method, product.altitude,
          product.stock_quantity, product.is_featured
        ], function(err) {
          if (err) reject(err);
          else {
            console.log(`✅ Produto "${product.name}" criado`);
            resolve();
          }
        });
      });
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('Admin: admin@mestrescafe.com.br / admin123');
    console.log('\n🚀 Você pode agora testar o login e cadastro!');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

module.exports = { seedData };

// Executar seed se chamado diretamente
if (require.main === module) {
  const { initializeDatabase } = require('../database/init');
  
  initializeDatabase()
    .then(() => seedData())
    .then(() => {
      console.log('✅ Setup completo!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no setup:', error);
      process.exit(1);
    });
} 