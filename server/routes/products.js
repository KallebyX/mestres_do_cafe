const express = require('express');
const { db } = require('../database/init');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const _router = express.Router();

// Listar produtos
router.get('/', optionalAuth, (req, res) => {
  const { category, featured, search, limit = 20, offset = 0 } = req.query;
  
  let _sql = `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.is_active = 1`;
  const _params = [];

  if (category) {
    sql += ' AND p.category_id = ?';
    params.push(category);
  }

  if (featured === 'true') {
    sql += ' AND p.is_featured = 1';
  }

  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const _searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
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

// Obter produto específico
router.get('/:id', (req, res) => {
  const _sql = `SELECT p.*, c.name as category_name 
               FROM products p 
               LEFT JOIN categories c ON p.category_id = c.id 
               WHERE p.id = ? AND p.is_active = 1`;

  db.get(sql, [req.params.id], (err, product) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  });
});

// Listar categorias
router.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }

    res.json(categories);
  });
});

// Obter carrinho do usuário
router.get('/cart', authenticateToken, (req, res) => {
  const _sql = `SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
               FROM cart_items ci
               JOIN products p ON ci.product_id = p.id
               WHERE ci.user_id = ? AND p.is_active = 1`;

  db.all(sql, [req.user.id], (err, items) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar carrinho' });
    }

    const _total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ items, total, count: items.length });
  });
});

// Adicionar item ao carrinho
router.post('/cart', authenticateToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id || quantity < 1) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  // Verificar se produto existe e está ativo
  db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [product_id], (err, product) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Quantidade indisponível em estoque' });
    }

    // Verificar se item já existe no carrinho
    db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, product_id], (err, existingItem) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (existingItem) {
        // Atualizar quantidade
        const _newQuantity = existingItem.quantity + parseInt(quantity);
        
        if (product.stock_quantity < newQuantity) {
          return res.status(400).json({ error: 'Quantidade total indisponível em estoque' });
        }

        db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
               [newQuantity, existingItem.id], (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Erro ao atualizar carrinho' });
          }

          res.json({ message: 'Item atualizado no carrinho' });
        });
      } else {
        // Adicionar novo item
        db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
               [req.user.id, product_id, quantity], (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
          }

          res.status(201).json({ message: 'Item adicionado ao carrinho' });
        });
      }
    });
  });
});

// Atualizar item do carrinho
router.put('/cart/:itemId', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantidade inválida' });
  }

  // Verificar se item pertence ao usuário
  db.get('SELECT ci.*, p.stock_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?', 
         [itemId, req.user.id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (item.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Quantidade indisponível em estoque' });
    }

    db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
           [quantity, itemId], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro ao atualizar item' });
      }

      res.json({ message: 'Item atualizado com sucesso' });
    });
  });
});

// Remover item do carrinho
router.delete('/cart/:itemId', authenticateToken, (req, res) => {
  const { itemId } = req.params;

  db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, req.user.id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao remover item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ message: 'Item removido do carrinho' });
  });
});

// Limpar carrinho
router.delete('/cart/clear', authenticateToken, (req, res) => {
  db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao limpar carrinho' });
    }

    res.json({ message: 'Carrinho limpo com sucesso' });
  });
});

module.exports = router; 