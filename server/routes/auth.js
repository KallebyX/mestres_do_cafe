const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate a more secure fallback if JWT_SECRET is not set
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  WARNING: JWT_SECRET environment variable not set in auth.js. Using generated fallback. Set JWT_SECRET for production!');
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex') + Date.now().toString();
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const DB_FILE = path.join(__dirname, '../data/db.json');

// Funções de banco JSON
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { users: [], products: [], orders: [] };
      writeDB(initialData);
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco JSON:', error);
    return { users: [], products: [], orders: [] };
  }
}

function writeDB(data) {
  try {
    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao escrever banco JSON:', error);
  }
}

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
      userId: user.id,
      id: user.id, 
      email: user.email, 
      user_type: user.user_type,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
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

    const database = readDB();

    // Verificar se email já existe
    const existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    try {
      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Gerar ID único
      const userId = require('crypto').randomUUID();

      const newUser = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        user_type,
        phone,
        cpf_cnpj,
        address,
        city,
        state,
        zip_code,
        points: 0,
        level: 'Bronze',
        role: 'customer',
        permissions: JSON.stringify(['read']),
        is_active: true,
        created_at: new Date().toISOString()
      };

      database.users.push(newUser);
      writeDB(database);

      const token = generateToken(newUser);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        access_token: token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          user_type: newUser.user_type,
          phone: newUser.phone,
          cpf_cnpj: newUser.cpf_cnpj,
          address: newUser.address,
          city: newUser.city,
          state: newUser.state,
          zip_code: newUser.zip_code,
          points: newUser.points,
          is_active: newUser.is_active
        }
      });
    } catch (hashError) {
      console.error('Password hash error:', hashError);
      res.status(500).json({ error: 'Erro ao processar senha' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login de usuário
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    const database = readDB();
    console.log('🔍 Login attempt for:', email);
    console.log('📊 Total users in database:', database.users.length);
    
    // Buscar usuário por email
    const user = database.users.find(u => u.email === email && u.is_active !== false);
    console.log('👤 User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('📧 User email matches:', user.email === email);
      console.log('✅ User is active:', user.is_active);
    }

    if (!user) {
      console.log('❌ Login failed: User not found');
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify-token', authenticateToken, (req, res) => {
  const database = readDB();
  const user = database.users.find(u => u.id === req.user.id && u.is_active !== false);

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

// Obter perfil do usuário
router.get('/profile', authenticateToken, (req, res) => {
  const database = readDB();
  const user = database.users.find(u => u.id === req.user.id);

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
  
  const database = readDB();
  const userIndex = database.users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Atualizar usuário
  const updatedUser = {
    ...database.users[userIndex],
    name: name || database.users[userIndex].name,
    phone: phone || database.users[userIndex].phone,
    cpf_cnpj: cpf_cnpj || database.users[userIndex].cpf_cnpj,
    address: address || database.users[userIndex].address,
    city: city || database.users[userIndex].city,
    state: state || database.users[userIndex].state,
    zip_code: zip_code || database.users[userIndex].zip_code,
    updated_at: new Date().toISOString()
  };

  database.users[userIndex] = updatedUser;
  writeDB(database);

  res.json({ message: 'Perfil atualizado com sucesso' });
});

// Debug endpoint - only available in development/test
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  router.post('/test-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔍 TEST LOGIN - Email:', email);
      console.log('🔍 TEST LOGIN - Password: [REDACTED]'); // Security fix: never log passwords
      
      const database = readDB();
      console.log('📊 Total users:', database.users.length);
      
      const allUsers = database.users.map(u => ({
        id: u.id,
        email: u.email,
        user_type: u.user_type,
        is_active: u.is_active
      }));
      console.log('👥 All users:', JSON.stringify(allUsers, null, 2));
      
      const user = database.users.find(u => u.email === email);
      console.log('👤 User found by email:', user ? 'YES' : 'NO');
      
      if (user) {
        console.log('🔑 Password hash available:', !!user.password); // Security fix: don't log actual hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('🔐 Password matches:', passwordMatch);
        
        return res.json({
          success: true,
          userFound: true,
          passwordMatch,
          userDetails: {
            id: user.id,
            email: user.email,
            user_type: user.user_type,
            is_active: user.is_active
          }
        });
      }
      
      res.json({
        success: false,
        userFound: false,
        passwordMatch: false,
        allEmails: database.users.map(u => u.email)
      });
      
    } catch (error) {
      console.error('❌ Test login error:', error);
      res.status(500).json({ error: error.message });
    }
  });
} else {
  // In production, return 404 for debug endpoints
  router.post('/test-login', (req, res) => {
    res.status(404).json({ error: 'Debug endpoint not available in production' });
  });
}

module.exports = router; 