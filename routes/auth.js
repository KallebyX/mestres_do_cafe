const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('user_type').isIn(['cliente_pf', 'cliente_pj', 'admin']).withMessage('Tipo de usuário inválido'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

// Função para gerar JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Registro de usuário
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { name, email, password, user_type, phone, cpf_cnpj, address, city, state, zip_code } = req.body;

    // Verificar se email já existe
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      try {
        // Hash da senha
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Inserir usuário
        const sql = `INSERT INTO users (name, email, password, user_type, phone, cpf_cnpj, address, city, state, zip_code) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [name, email, hashedPassword, user_type, phone, cpf_cnpj, address, city, state, zip_code], function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
          }

          const newUser = {
            id: this.lastID,
            name,
            email,
            user_type,
            phone,
            cpf_cnpj,
            address,
            city,
            state,
            zip_code,
            points: 0,
            is_active: 1
          };

          const token = generateToken(newUser);

          res.status(201).json({
            message: 'Usuário criado com sucesso',
            access_token: token,
            user: {
              ...newUser,
              password: undefined // Não retornar senha
            }
          });
        });
      } catch (hashError) {
        console.error('Password hash error:', hashError);
        res.status(500).json({ error: 'Erro ao processar senha' });
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login de usuário
router.post('/login', loginValidation, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const token = generateToken(user);

        res.json({
          message: 'Login realizado com sucesso',
          access_token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            phone: user.phone,
            cpf_cnpj: user.cpf_cnpj,
            address: user.address,
            city: user.city,
            state: user.state,
            zip_code: user.zip_code,
            points: user.points,
            is_active: user.is_active
          }
        });
      } catch (compareError) {
        console.error('Password compare error:', compareError);
        res.status(500).json({ error: 'Erro ao verificar senha' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify-token', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ? AND is_active = 1', [req.user.id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(401).json({ valid: false, error: 'Usuário não encontrado' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        phone: user.phone,
        cpf_cnpj: user.cpf_cnpj,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
        points: user.points,
        is_active: user.is_active
      }
    });
  });
});

// Obter perfil do usuário
router.get('/profile', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      phone: user.phone,
      cpf_cnpj: user.cpf_cnpj,
      address: user.address,
      city: user.city,
      state: user.state,
      zip_code: user.zip_code,
      points: user.points,
      is_active: user.is_active,
      created_at: user.created_at
    });
  });
});

// Atualizar perfil
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Dados inválidos', 
      details: errors.array() 
    });
  }

  const { name, phone, cpf_cnpj, address, city, state, zip_code } = req.body;
  
  const sql = `UPDATE users 
               SET name = COALESCE(?, name), 
                   phone = COALESCE(?, phone),
                   cpf_cnpj = COALESCE(?, cpf_cnpj),
                   address = COALESCE(?, address),
                   city = COALESCE(?, city),
                   state = COALESCE(?, state),
                   zip_code = COALESCE(?, zip_code),
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [name, phone, cpf_cnpj, address, city, state, zip_code, req.user.id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    res.json({ message: 'Perfil atualizado com sucesso' });
  });
});

module.exports = router; 