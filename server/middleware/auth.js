const jwt = require('jsonwebtoken');
const _fs = require('fs');
const _path = require('path');

// Generate a more secure fallback if JWT_SECRET is not set
const _JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  WARNING: JWT_SECRET environment variable not set in middleware/auth.js. Using generated fallback. Set JWT_SECRET for production!');
  const _crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex') + Date.now().toString();
})();
const _DB_FILE = path.join(__dirname, '../data/db.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const _initialData = { users: [], products: [], orders: [] };
      const _dbDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const _data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler banco JSON:', error);
    return { users: [], products: [], orders: [] };
  }
}

const _authenticateToken = (req, res, next) => {
  const _authHeader = req.headers['authorization'];
  const _token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

const _requireAdmin = (req, res, next) => {
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

const _validateAdmin = (req, res, next) => {
  // Primeiro autentica o token
  authenticateToken(req, res, (err) => {
    if (err) return;
    
    // Depois valida se é admin
    requireAdmin(req, res, next);
  });
};

const _optionalAuth = (req, res, next) => {
  const _authHeader = req.headers['authorization'];
  const _token = authHeader && authHeader.split(' ')[1];

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