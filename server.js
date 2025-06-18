const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'mestres_do_cafe_jwt_secret_key_2024';

// Database mock (JSON file)
const DB_FILE = './users.json';

// Initialize users database
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@mestrescafe.com.br',
        password: '$2a$12$D8X8h9LvqVl8OvZ2k3LhOeJ.ZQKa9Qq7/HdVR3/3Lc8Fj.K9/8nSi', // admin123
        user_type: 'admin',
        phone: '(11) 99999-9999',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Helper functions
function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function findUser(email) {
  const db = readDB();
  return db.users.find(user => user.email === email);
}

function createUser(userData) {
  const db = readDB();
  const newUser = {
    id: db.users.length + 1,
    ...userData,
    is_active: true,
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando!' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, user_type, phone, cpf_cnpj, address, city, state, zip_code } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Check if user exists
    if (findUser(email)) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = createUser({
      name,
      email,
      password: hashedPassword,
      user_type: user_type || 'cliente_pf',
      phone,
      cpf_cnpj,
      address,
      city,
      state,
      zip_code,
      points: 0
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, user_type: newUser.user_type, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      access_token: token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Find user
    const user = findUser(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      access_token: token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verify token
app.get('/api/auth/verify-token', authenticateToken, (req, res) => {
  const user = findUser(req.user.email);
  if (!user) {
    return res.status(401).json({ valid: false, error: 'Usuário não encontrado' });
  }

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    valid: true,
    user: userWithoutPassword
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 CORS permitido para: http://localhost:5173`);
  console.log('📝 Credenciais admin: admin@mestrescafe.com.br / admin123');
  console.log('✅ Backend pronto para login e cadastro!');
}); 