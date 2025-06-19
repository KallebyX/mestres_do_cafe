const express = require('express');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Criar pedido
router.post('/', authenticateToken, (req, res) => {
  const { payment_method, shipping_address } = req.body;

  if (!payment_method || !shipping_address) {
    return res.status(400).json({ error: 'Método de pagamento e endereço são obrigatórios' });
  }

  // Buscar itens do carrinho
  const cartSql = `SELECT ci.*, p.name, p.price, p.stock_quantity
                   FROM cart_items ci
                   JOIN products p ON ci.product_id = p.id
                   WHERE ci.user_id = ? AND p.is_active = 1`;

  db.all(cartSql, [req.user.id], (err, cartItems) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar carrinho' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Verificar estoque
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Produto "${item.name}" não tem estoque suficiente` 
        });
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Criar pedido
    const orderSql = `INSERT INTO orders (user_id, total_amount, payment_method, shipping_address) 
                      VALUES (?, ?, ?, ?)`;

    db.run(orderSql, [req.user.id, totalAmount, payment_method, shipping_address], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro ao criar pedido' });
      }

      const orderId = this.lastID;

      // Inserir itens do pedido
      const orderItemPromises = cartItems.map(item => {
        return new Promise((resolve, reject) => {
          const itemSql = `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                           VALUES (?, ?, ?, ?, ?)`;
          const totalPrice = item.price * item.quantity;
          
          db.run(itemSql, [orderId, item.product_id, item.quantity, item.price, totalPrice], (err) => {
            if (err) {
              reject(err);
            } else {
              // Atualizar estoque
              db.run('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', 
                     [item.quantity, item.product_id], (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          });
        });
      });

      Promise.all(orderItemPromises)
        .then(() => {
          // Limpar carrinho
          db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id], (err) => {
            if (err) {
              console.error('Erro ao limpar carrinho:', err);
            }

            res.status(201).json({
              message: 'Pedido criado com sucesso',
              order_id: orderId,
              total_amount: totalAmount
            });
          });
        })
        .catch((error) => {
          console.error('Erro ao processar itens do pedido:', error);
          res.status(500).json({ error: 'Erro ao processar pedido' });
        });
    });
  });
});

// Listar pedidos do usuário
router.get('/', authenticateToken, (req, res) => {
  const { status, limit = 10, offset = 0 } = req.query;
  
  let sql = 'SELECT * FROM orders WHERE user_id = ?';
  const params = [req.user.id];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, orders) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }

    res.json({ orders, total: orders.length });
  });
});

// Obter pedido específico
router.get('/:id', authenticateToken, (req, res) => {
  const orderSql = 'SELECT * FROM orders WHERE id = ? AND user_id = ?';
  
  db.get(orderSql, [req.params.id, req.user.id], (err, order) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao buscar pedido' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Buscar itens do pedido
    const itemsSql = `SELECT oi.*, p.name, p.image_url
                      FROM order_items oi
                      JOIN products p ON oi.product_id = p.id
                      WHERE oi.order_id = ?`;

    db.all(itemsSql, [req.params.id], (err, items) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro ao buscar itens do pedido' });
      }

      res.json({ ...order, items });
    });
  });
});

// Cancelar pedido
router.put('/:id/cancel', authenticateToken, (req, res) => {
  // Verificar se pedido existe e pertence ao usuário
  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, order) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Pedido já está cancelado' });
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({ error: 'Não é possível cancelar pedidos enviados ou entregues' });
    }

    // Cancelar pedido
    db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           ['cancelled', req.params.id], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro ao cancelar pedido' });
      }

      // Restaurar estoque
      const itemsSql = 'SELECT product_id, quantity FROM order_items WHERE order_id = ?';
      db.all(itemsSql, [req.params.id], (err, items) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Erro ao restaurar estoque' });
        }

        const restorePromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                   [item.quantity, item.product_id], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(restorePromises)
          .then(() => {
            res.json({ message: 'Pedido cancelado com sucesso' });
          })
          .catch((error) => {
            console.error('Erro ao restaurar estoque:', error);
            res.json({ 
              message: 'Pedido cancelado, mas houve erro ao restaurar estoque',
              warning: 'Entre em contato com o suporte'
            });
          });
      });
    });
  });
});

module.exports = router; 