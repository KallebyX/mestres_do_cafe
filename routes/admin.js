const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard - estatísticas gerais
router.get('/dashboard', (req, res) => {
  const stats = {};
  
  // Total de usuários
  db.get('SELECT COUNT(*) as total FROM users WHERE is_active = 1', (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
    
    stats.total_users = result.total;
    
    // Total de produtos
    db.get('SELECT COUNT(*) as total FROM products WHERE is_active = 1', (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
      }
      
      stats.total_products = result.total;
      
      // Total de pedidos
      db.get('SELECT COUNT(*) as total, SUM(total_amount) as revenue FROM orders', (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
        
        stats.total_orders = result.total || 0;
        stats.total_revenue = result.revenue || 0;
        
        // Pedidos por status
        db.all('SELECT status, COUNT(*) as count FROM orders GROUP BY status', (err, statusResults) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
          }
          
          stats.orders_by_status = statusResults;
          res.json(stats);
        });
      });
    });
  });
});

// Gerenciar usuários
router.get('/users', (req, res) => {
  const { page = 1, limit = 20, search, user_type } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = 'SELECT id, name, email, user_type, phone, is_active, created_at FROM users WHERE 1=1';
  const params = [];
  
  if (search) {
    sql += ' AND (name LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  if (user_type) {
    sql += ' AND user_type = ?';
    params.push(user_type);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    
    res.json({ users, total: users.length });
  });
});

// Ativar/desativar usuário
router.put('/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT is_active FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const newStatus = user.is_active ? 0 : 1;
    
    db.run('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           [newStatus, id], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
      
      res.json({ 
        message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
        is_active: newStatus 
      });
    });
  });
});

// Gerenciar produtos
router.get('/products', (req, res) => {
  const { page = 1, limit = 20, search, category_id } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE 1=1`;
  const params = [];
  
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  if (category_id) {
    sql += ' AND p.category_id = ?';
    params.push(category_id);
  }
  
  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, products) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    
    res.json({ products, total: products.length });
  });
});

// Criar produto
router.post('/products', (req, res) => {
  const {
    name, description, price, original_price, category_id,
    image_url, origin, roast_level, flavor_notes, processing_method,
    altitude, stock_quantity, is_featured
  } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }
  
  const sql = `INSERT INTO products (
    name, description, price, original_price, category_id,
    image_url, origin, roast_level, flavor_notes, processing_method,
    altitude, stock_quantity, is_featured
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [
    name, description, price, original_price, category_id,
    image_url, origin, roast_level, flavor_notes, processing_method,
    altitude, stock_quantity || 0, is_featured ? 1 : 0
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao criar produto' });
    }
    
    res.status(201).json({
      message: 'Produto criado com sucesso',
      product_id: this.lastID
    });
  });
});

// Atualizar produto
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const {
    name, description, price, original_price, category_id,
    image_url, origin, roast_level, flavor_notes, processing_method,
    altitude, stock_quantity, is_featured, is_active
  } = req.body;
  
  const sql = `UPDATE products SET
    name = COALESCE(?, name),
    description = COALESCE(?, description),
    price = COALESCE(?, price),
    original_price = COALESCE(?, original_price),
    category_id = COALESCE(?, category_id),
    image_url = COALESCE(?, image_url),
    origin = COALESCE(?, origin),
    roast_level = COALESCE(?, roast_level),
    flavor_notes = COALESCE(?, flavor_notes),
    processing_method = COALESCE(?, processing_method),
    altitude = COALESCE(?, altitude),
    stock_quantity = COALESCE(?, stock_quantity),
    is_featured = COALESCE(?, is_featured),
    is_active = COALESCE(?, is_active),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;
  
  db.run(sql, [
    name, description, price, original_price, category_id,
    image_url, origin, roast_level, flavor_notes, processing_method,
    altitude, stock_quantity, is_featured ? 1 : 0, is_active ? 1 : 0, id
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto atualizado com sucesso' });
  });
});

// Gerenciar pedidos
router.get('/orders', (req, res) => {
  const { page = 1, limit = 20, status, user_id } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `SELECT o.*, u.name as user_name, u.email as user_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE 1=1`;
  const params = [];
  
  if (status) {
    sql += ' AND o.status = ?';
    params.push(status);
  }
  
  if (user_id) {
    sql += ' AND o.user_id = ?';
    params.push(user_id);
  }
  
  sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, orders) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
    
    res.json({ orders, total: orders.length });
  });
});

// Atualizar status do pedido
router.put('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  
  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
         [status, id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    res.json({ message: 'Status do pedido atualizado com sucesso' });
  });
});

// Criar categoria
router.post('/categories', (req, res) => {
  const { name, description, image_url } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
  }
  
  db.run('INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
         [name, description, image_url], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao criar categoria' });
    }
    
    res.status(201).json({
      message: 'Categoria criada com sucesso',
      category_id: this.lastID
    });
  });
});

module.exports = router; 