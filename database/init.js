const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './database/mestres_cafe.db';
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL DEFAULT 'cliente_pf',
        phone TEXT,
        cpf_cnpj TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela users:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Tabela users criada/verificada');
      });

      // Tabela de categorias
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela categories:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Tabela categories criada/verificada');
      });

      // Tabela de produtos
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category_id INTEGER,
        image_url TEXT,
        origin TEXT,
        roast_level TEXT,
        flavor_notes TEXT,
        processing_method TEXT,
        altitude TEXT,
        stock_quantity INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela products:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Tabela products criada/verificada');
      });

      // Tabela de carrinho
      db.run(`CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )`, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela cart_items:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Tabela cart_items criada/verificada');
      });

      // Tabela de pedidos
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        shipping_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela orders:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Tabela orders criada/verificada');
      });

      // Tabela de itens do pedido
      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela order_items:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Tabela order_items criada/verificada');
        resolve();
      });
    });
  });
};

module.exports = { db, initializeDatabase }; 