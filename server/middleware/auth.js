const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'mestres-cafe-super-secret-jwt-key-2025';
const DB_FILE = path.join(__dirname, '../data/db.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { users: [], products: [], orders: [] };
      const dbDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco JSON:', error);
    return { users: [], products: [], orders: [] };
  }
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

const requireAdmin = (req, res, next) => {
  // Verificar se o usuário está autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  // Verificar se é admin
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  
  next();
};

const validateAdmin = (req, res, next) => {
  // Primeiro autentica o token
  authenticateToken(req, res, (err) => {
    if (err) return;
    
    // Depois valida se é admin
    requireAdmin(req, res, next);
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  validateAdmin,
  optionalAuth
}; 