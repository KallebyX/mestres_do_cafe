const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock database (depois será substituído por PostgreSQL)
let users = [
  {
    id: '1',
    tipo: 'admin',
    email: 'admin@mestrescafe.com.br',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2Q8nVLPjG.', // admin123
    nome_completo: 'Administrador',
    pontos_totais: 0,
    nivel: 'diamante',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Utility functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      tipo: user.tipo,
      nome: user.nome_completo || user.razao_social 
    },
    process.env.JWT_SECRET || 'mestres-cafe-super-secret-jwt-key-2025',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET || 'mestres-cafe-refresh-secret-key-2025',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Validation middleware
const validateRegister = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('tipo').isIn(['pessoa_fisica', 'pessoa_juridica']).withMessage('Tipo deve ser pessoa_fisica ou pessoa_juridica'),
  // Validações condicionais baseadas no tipo
  body('nome_completo').if(body('tipo').equals('pessoa_fisica')).notEmpty().withMessage('Nome completo é obrigatório para pessoa física'),
  body('cpf').if(body('tipo').equals('pessoa_fisica')).notEmpty().withMessage('CPF é obrigatório para pessoa física'),
  body('razao_social').if(body('tipo').equals('pessoa_juridica')).notEmpty().withMessage('Razão social é obrigatória para pessoa jurídica'),
  body('cnpj').if(body('tipo').equals('pessoa_juridica')).notEmpty().withMessage('CNPJ é obrigatório para pessoa jurídica')
];

const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password, tipo, nome_completo, cpf, razao_social, cnpj, phone } = req.body;

    // Verificar se email já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Verificar CPF/CNPJ duplicado
    if (tipo === 'pessoa_fisica' && cpf) {
      const existingCpf = users.find(u => u.cpf === cpf);
      if (existingCpf) {
        return res.status(400).json({ error: 'CPF já está cadastrado' });
      }
    }

    if (tipo === 'pessoa_juridica' && cnpj) {
      const existingCnpj = users.find(u => u.cnpj === cnpj);
      if (existingCnpj) {
        return res.status(400).json({ error: 'CNPJ já está cadastrado' });
      }
    }

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const newUser = {
      id: (users.length + 1).toString(),
      tipo,
      email,
      password_hash,
      nome_completo: tipo === 'pessoa_fisica' ? nome_completo : null,
      cpf: tipo === 'pessoa_fisica' ? cpf : null,
      razao_social: tipo === 'pessoa_juridica' ? razao_social : null,
      cnpj: tipo === 'pessoa_juridica' ? cnpj : null,
      phone,
      pontos_totais: 0,
      nivel: 'bronze',
      is_active: true,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    // Gerar tokens
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      access_token: token,
      refresh_token: refreshToken,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      access_token: token,
      refresh_token: refreshToken,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mestres-cafe-super-secret-jwt-key-2025');
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET || 'mestres-cafe-refresh-secret-key-2025');
    const user = users.find(u => u.id === decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      access_token: newToken,
      refresh_token: newRefreshToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    
    console.error('Erro no refresh:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 