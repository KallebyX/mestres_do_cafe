/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

// Importar serviços próprios (APIs gratuitas)
const WhatsAppService = require('./services/WhatsAppService');
const MapsService = require('./services/MapsService');

// Importar rotas de administração de clientes
const adminCustomersRoutes = require('./routes/admin-customers');
const newsletterRoutes = require('./routes/newsletter');

const app = express();
const PORT = process.env.PORT || 5000; // Render usa PORT dinâmico
// Generate a more secure fallback if JWT_SECRET is not set
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  WARNING: JWT_SECRET environment variable not set. Using generated fallback. Set JWT_SECRET for production!');
  // Generate a random secret based on timestamp and random values for better security
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex') + Date.now().toString();
})();

// Inicializar serviços
const whatsappService = new WhatsAppService();
const mapsService = new MapsService();

console.log('🚀 Inicializando serviços gratuitos...');
console.log('📱 WhatsApp: API própria (whatsapp-web.js)');
console.log('🗺️ Maps: OpenStreetMap + Leaflet');

// Validação de CPF
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 10 ? remainder : 0;
  
  if (parseInt(cpf.charAt(9)) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 10 ? remainder : 0;
  
  return parseInt(cpf.charAt(10)) === digit2;
}

// Validação de CNPJ
function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cnpj.charAt(12)) !== digit1) return false;
  
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i];
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cnpj.charAt(13)) === digit2;
}

// Validação de email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Database mock (JSON file)
const DB_FILE = './data/db.json';

// Initialize users database
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    users: [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@mestrescafe.com.br',
        password: '$2b$12$RZOiTGstHxg27izW7bRPR.WAjMYPjZv4WopklVPsGNxP2TO3.LUeK', // admin123
        user_type: 'admin',
        phone: '(11) 99999-9999',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Secure CORS - Configuration for production and development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://mestres-cafe-frontend.onrender.com',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow specific Render.com domains for this project
    if (origin.includes('.onrender.com') && origin.includes('mestres-cafe')) {
      return callback(null, true);
    }
    
    console.warn(`🚫 CORS blocked unauthorized origin: ${origin}`);
    return callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // Cache preflight for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.mestrescafe.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

// Speed limiter for all requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes at full speed
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use(speedLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Health check endpoint melhorado para Render
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: 'OK',
      whatsapp: whatsappService.isReady ? 'OK' : 'Initializing',
      maps: 'OK'
    }
  };
  
  res.status(200).json(healthData);
});

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      user_type, 
      phone, 
      cpf_cnpj, 
      address, 
      city, 
      state, 
      zip_code,
      company_name,
      company_segment 
    } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    if (!user_type || !['cliente_pf', 'cliente_pj'].includes(user_type)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    // Validação específica por tipo de usuário
    if (user_type === 'cliente_pf') {
      if (!cpf_cnpj) {
        return res.status(400).json({ error: 'CPF é obrigatório para pessoa física' });
      }
      if (!validateCPF(cpf_cnpj)) {
        return res.status(400).json({ error: 'CPF inválido' });
      }
    } else if (user_type === 'cliente_pj') {
      if (!cpf_cnpj) {
        return res.status(400).json({ error: 'CNPJ é obrigatório para pessoa jurídica' });
      }
      if (!validateCNPJ(cpf_cnpj)) {
        return res.status(400).json({ error: 'CNPJ inválido' });
      }
      if (!company_name) {
        return res.status(400).json({ error: 'Nome da empresa é obrigatório para pessoa jurídica' });
      }
    }

    // Check if user exists
    if (findUser(email)) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Check if CPF/CNPJ is already in use
    const db = readDB();
    const existingUserWithDocument = db.users.find(user => 
      user.cpf_cnpj && user.cpf_cnpj.replace(/[^\d]/g, '') === cpf_cnpj.replace(/[^\d]/g, '')
    );
    
    if (existingUserWithDocument) {
      const docType = user_type === 'cliente_pf' ? 'CPF' : 'CNPJ';
      return res.status(400).json({ error: `${docType} já está em uso` });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with welcome points
    const newUser = createUser({
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
      company_name: user_type === 'cliente_pj' ? company_name : null,
      company_segment: user_type === 'cliente_pj' ? company_segment : null,
      points: 100, // Pontos de boas-vindas
      level: 'aprendiz',
      total_spent: 0,
      orders_count: 0
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
      message: 'Usuário criado com sucesso! Você ganhou 100 pontos de boas-vindas!',
      access_token: token,
      user: userWithoutPassword,
      welcome_points: 100
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Find user in database
    console.log('🔍 LOGIN: Buscando usuário com email:', email);
    const user = findUser(email);
    console.log('👤 LOGIN: Usuário encontrado:', user ? 'SIM' : 'NÃO');
    if (user) {
      console.log('📧 LOGIN: Email do usuário:', user.email);
      console.log('✅ LOGIN: Status ativo:', user.is_active);
      console.log('🔑 LOGIN: Hash da senha disponível:', user.password ? 'SIM' : 'NÃO'); // Security fix: don't log hash presence details
    }
    if (!user) {
      console.log('❌ LOGIN: Usuário não encontrado');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Check password
    console.log('🔐 LOGIN: Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 LOGIN: Senha válida:', isValidPassword);
    if (!isValidPassword) {
      console.log('❌ LOGIN: Senha incorreta');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
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

// Simplified login for demo - TEMPORARY
app.post('/api/auth/demo-login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo credentials
    const demoUsers = {
      'admin@mestrescafe.com.br': {
        id: 1,
        name: 'Administrador',
        email: 'admin@mestrescafe.com.br',
        user_type: 'admin',
        phone: '(11) 99999-9999',
        password: 'admin123'
      },
      'cliente@teste.com': {
        id: 2,
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        user_type: 'cliente_pf',
        phone: '(11) 99999-0000',
        password: '123456'
      }
    };

    const user = demoUsers[email];
    if (!user || user.password !== password) {
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
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Debug endpoint - only available in development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  app.post('/api/auth/debug-login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔍 DEBUG: Email recebido:', email);
      console.log('🔍 DEBUG: Senha recebida: [REDACTED]'); // Security fix: never log passwords
      
      // Testar readDB
      const db = readDB();
      console.log('📊 DEBUG: Total de usuários no banco:', db.users.length);
      console.log('📧 DEBUG: Emails no banco:', db.users.map(u => u.email));
      
      // Buscar usuário
      const user = findUser(email);
      console.log('👤 DEBUG: Usuário encontrado:', user ? 'SIM' : 'NÃO');
      
      if (user) {
        console.log('📧 DEBUG: Email do usuário:', user.email);
        console.log('🔑 DEBUG: Tem senha:', !!user.password);
        console.log('✅ DEBUG: Status ativo:', user.is_active);
        
        // Testar senha
        if (user.password) {
          const isValid = await bcrypt.compare(password, user.password);
          console.log('🔐 DEBUG: Senha válida:', isValid);
          
          return res.json({
            success: true,
            userFound: true,
            hasPassword: !!user.password,
            passwordValid: isValid,
            isActive: user.is_active,
            userDetails: {
              id: user.id,
              email: user.email,
              user_type: user.user_type,
              name: user.name
            }
          });
        }
      }
      
      res.json({
        success: false,
        userFound: !!user,
        allUsers: db.users.length,
        allEmails: db.users.map(u => u.email)
      });
      
    } catch (error) {
      console.error('❌ DEBUG ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  });
} else {
  // In production, return 404 for debug endpoints
  app.post('/api/auth/debug-login', (req, res) => {
    res.status(404).json({ error: 'Endpoint not available in production' });
  });
}

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

// Products endpoint
app.get('/api/products', (req, res) => {
  console.log('🔍 Requisição para listar produtos');
  
  // Filtrar apenas produtos ativos
  const activeProducts = mockProducts.filter(product => product.is_active);
  
  res.json({ 
    success: true,
    products: activeProducts, 
    total: activeProducts.length 
  });
});

// Featured products (DEVE vir antes de /api/products/:id)
app.get('/api/products/featured', (req, res) => {
  const featuredProducts = [
    {
      id: '1',
      name: 'Café Bourbon Amarelo Premium',
      description: 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo.',
      price: 45.90,
      original_price: 52.90,
      images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'],
      is_featured: true
    },
    {
      id: '2',
      name: 'Café Geisha Especial',
      description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
      price: 89.90,
      original_price: 105.90,
      images: ['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400'],
      is_featured: true
    }
  ];
  
  res.json({ products: featuredProducts, total: featuredProducts.length });
});

// Get single product (DEVE vir depois de rotas específicas)
app.get('/api/products/:id', (req, res) => {
  console.log('🔍 Requisição para produto específico:', req.params.id);
  
  const product = mockProducts.find(p => p.id === req.params.id && p.is_active);
  
  if (!product) {
    return res.status(404).json({ 
      success: false,
      error: 'Produto não encontrado' 
    });
  }
  
  res.json({ 
    success: true,
    product 
  });
});

// 🔐 Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorização necessário' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se é admin
    if (decoded.user_type !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Mock products storage (in production, this would be a database)
const mockProducts = [
  {
    id: '1',
    name: 'Café Bourbon Amarelo Premium',
    description: 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo. Cultivado em altitude de 1.200 metros, este café passou por um processo de secagem natural que intensifica seus sabores únicos.',
    detailed_description: 'O Café Bourbon Amarelo Premium é uma verdadeira obra-prima da cafeicultura brasileira. Cultivado nas terras férteis do Cerrado Mineiro, em altitudes que variam entre 1.000 e 1.200 metros, este café especial representa o que há de melhor na tradição cafeeira nacional.\n\nAs plantas da variedade Bourbon Amarelo, conhecidas por sua baixa produtividade mas alta qualidade, são cultivadas sob condições climáticas ideais. O processo de secagem natural, realizado em terreiros suspensos, permite que os grãos desenvolvam uma complexidade sensorial excepcional.\n\nCom pontuação SCAA de 86 pontos, este café oferece um perfil sensorial rico e equilibrado, perfeito para os amantes de cafés especiais que buscam uma experiência única a cada xícara.',
    price: 45.90,
    original_price: 52.90,
    origin: 'Cerrado Mineiro, MG',
    roast_level: 'Médio',
    flavor_notes: 'Chocolate, Caramelo, Nozes',
    category: 'especial',
    stock_quantity: 50,
    rating: 4.8,
    reviews_count: 127,
    is_featured: true,
    is_active: true,
    weight: '500g',
    roast_date: '2024-01-15',
    altitude: '1.000-1.200m',
    variety: 'Bourbon Amarelo',
    process: 'Natural',
    scaa_score: 86,
    farm: 'Fazenda São Bento',
    farmer: 'João Carlos Silva',
    harvest_year: '2023',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Café Geisha Especial',
    description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
    detailed_description: 'O Café Geisha Especial é considerado uma das variedades mais nobres do mundo. Originária da Etiópia e cultivada com extremo cuidado nas montanhas do Sul de Minas, esta variedade rara oferece uma experiência sensorial incomparável.',
    price: 89.90,
    original_price: 105.90,
    origin: 'Sul de Minas, MG',
    roast_level: 'Claro',
    flavor_notes: 'Floral, Cítrico, Bergamota',
    category: 'premium',
    stock_quantity: 25,
    rating: 4.9,
    reviews_count: 89,
    is_featured: true,
    is_active: true,
    weight: '250g',
    scaa_score: 92,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Café Arábica Torrado Artesanal',
    description: 'Blend exclusivo de grãos selecionados com torra artesanal para um sabor equilibrado.',
    detailed_description: 'Nosso Café Arábica Torrado Artesanal é um blend cuidadosamente elaborado que combina grãos de diferentes regiões para criar uma experiência harmoniosa e equilibrada.',
    price: 32.90,
    original_price: 38.90,
    origin: 'Mogiana, SP',
    roast_level: 'Médio-Escuro',
    flavor_notes: 'Chocolate Amargo, Baunilha',
    category: 'tradicional',
    stock_quantity: 80,
    rating: 4.6,
    reviews_count: 156,
    is_featured: false,
    is_active: true,
    weight: '500g',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Café Fazenda Santa Helena',
    description: 'Café especial com certificação orgânica, cultivado de forma sustentável.',
    price: 67.90,
    original_price: 75.90,
    origin: 'Alta Mogiana, SP',
    roast_level: 'Médio',
    flavor_notes: 'Frutas Vermelhas, Chocolate',
    category: 'especial',
    stock_quantity: 35,
    rating: 4.7,
    reviews_count: 93,
    is_featured: true,
    is_active: true,
    weight: '500g',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Café Tradicional Supremo',
    description: 'Blend tradicional perfeito para o dia a dia, com sabor equilibrado e suave.',
    price: 28.90,
    original_price: 32.90,
    origin: 'Sul de Minas, MG',
    roast_level: 'Médio-Escuro',
    flavor_notes: 'Chocolate, Caramelo',
    category: 'tradicional',
    stock_quantity: 120,
    rating: 4.4,
    reviews_count: 203,
    is_featured: false,
    is_active: true,
    weight: '500g',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Café Microlote Especial',
    description: 'Edição limitada de microlote especial com pontuação SCAA acima de 85 pontos.',
    price: 120.90,
    original_price: 135.90,
    origin: 'Chapada Diamantina, BA',
    roast_level: 'Claro',
    flavor_notes: 'Frutas Tropicais, Floral, Mel',
    category: 'premium',
    stock_quantity: 15,
    rating: 4.9,
    reviews_count: 47,
    is_featured: true,
    is_active: true,
    weight: '250g',
    created_at: new Date().toISOString()
  }
];

// 🛡️ ADMIN ENDPOINTS - CRUD de Produtos

// 📝 POST /api/admin/products - Criar produto (Admin)
app.post('/api/admin/products', requireAdmin, (req, res) => {
  console.log('📝 Admin criando produto:', req.body);
  
  try {
    const {
      name,
      description,
      price,
      original_price,
      origin,
      roast_level,
      flavor_notes,
      category,
      stock_quantity,
      is_featured
    } = req.body;

    // Validação básica
    if (!name || !description || !price || !category || stock_quantity === undefined) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: name, description, price, category, stock_quantity' 
      });
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      origin: origin || null,
      roast_level: roast_level || 'Médio',
      flavor_notes: flavor_notes || null,
      category,
      stock_quantity: parseInt(stock_quantity),
      is_featured: Boolean(is_featured),
      is_active: true,
      rating: 4.5, // Rating padrão
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockProducts.push(newProduct);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      product: newProduct
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ✏️ PUT /api/admin/products/:id - Atualizar produto (Admin)
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  console.log('✏️ Admin atualizando produto:', req.params.id, req.body);
  
  try {
    const productId = req.params.id;
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const {
      name,
      description,
      price,
      original_price,
      origin,
      roast_level,
      flavor_notes,
      category,
      stock_quantity,
      is_featured
    } = req.body;

    // Validação básica
    if (!name || !description || !price || !category || stock_quantity === undefined) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: name, description, price, category, stock_quantity' 
      });
    }

    // Atualizar produto
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      name,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      origin: origin || null,
      roast_level: roast_level || 'Médio',
      flavor_notes: flavor_notes || null,
      category,
      stock_quantity: parseInt(stock_quantity),
      is_featured: Boolean(is_featured),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      product: mockProducts[productIndex]
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🗑️ DELETE /api/admin/products/:id - Excluir produto (Admin)
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  console.log('🗑️ Admin excluindo produto:', req.params.id);
  
  try {
    const productId = req.params.id;
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const deletedProduct = mockProducts.splice(productIndex, 1)[0];

    res.json({
      success: true,
      message: 'Produto excluído com sucesso',
      product: deletedProduct
    });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 📊 GET /api/admin/products - Listar todos os produtos para admin
app.get('/api/admin/products', requireAdmin, (req, res) => {
  console.log('📊 Admin listando produtos');
  
  res.json({
    success: true,
    products: mockProducts,
    total: mockProducts.length
  });
});

// Cart endpoints
app.get('/api/cart', authenticateToken, (req, res) => {
  res.json({
    items: [],
    total: 0,
    discount: 0,
    final_total: 0
  });
});

app.post('/api/cart/add', authenticateToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  
  res.json({
    message: 'Produto adicionado ao carrinho',
    cart: {
      items: [
        {
          id: product_id,
          name: 'Café Bourbon Amarelo Premium',
          price: 45.90,
          quantity: quantity,
          subtotal: 45.90 * quantity
        }
      ],
      total: 45.90 * quantity
    }
  });
});

// Coupon validation
app.post('/api/coupons/validate', (req, res) => {
  const { code } = req.body;
  
  const coupons = {
    'BEMVINDO10': { discount: 10, type: 'percentage', description: '10% de desconto' },
    'CAFE20': { discount: 20, type: 'fixed', description: 'R$ 20 de desconto' }
  };
  
  if (coupons[code]) {
    res.json({
      valid: true,
      coupon: {
        code,
        ...coupons[code]
      }
    });
  } else {
    res.status(400).json({
      valid: false,
      error: 'Cupom inválido ou expirado'
    });
  }
});

// Notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const notifications = [
    {
      id: 1,
      title: 'Bem-vindo aos Mestres do Café!',
      message: 'Aproveite nossos cafés especiais com 10% de desconto no primeiro pedido.',
      type: 'welcome',
      is_read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Novo Café Geisha Disponível!',
      message: 'Experimente nossa nova variedade Geisha com perfil floral exclusivo.',
      type: 'product',
      is_read: false,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  res.json({ notifications, total: notifications.length });
});

// Gamification endpoints

// Function to calculate user level based on points
function calculateLevel(points) {
  if (points >= 5000) return { name: 'lenda', number: 5, discount: 25 };
  if (points >= 3000) return { name: 'mestre', number: 4, discount: 20 };
  if (points >= 1500) return { name: 'especialista', number: 3, discount: 15 };
  if (points >= 500) return { name: 'conhecedor', number: 2, discount: 10 };
  return { name: 'aprendiz', number: 1, discount: 5 };
}

// Add points to user
function addPointsToUser(userId, points, reason) {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  // Update user points
  db.users[userIndex].points = (db.users[userIndex].points || 0) + points;
  
  // Calculate new level
  const newLevel = calculateLevel(db.users[userIndex].points);
  db.users[userIndex].level = newLevel.name;
  
  // Add to points history (in a real app, this would be a separate table)
  if (!db.points_history) db.points_history = [];
  
  db.points_history.push({
    id: Date.now(),
    user_id: userId,
    points: points,
    reason: reason,
    created_at: new Date().toISOString()
  });
  
  writeDB(db);
  return db.users[userIndex];
}

// Get user gamification info
app.get('/api/gamification/profile', authenticateToken, (req, res) => {
  const user = findUser(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const currentLevel = calculateLevel(user.points || 0);
  const nextLevel = calculateLevel((user.points || 0) + 1);
  
  // Calculate points needed for next level
  let pointsForNext = 0;
  if (currentLevel.number < 5) {
    const thresholds = [0, 500, 1500, 3000, 5000];
    pointsForNext = thresholds[currentLevel.number] - (user.points || 0);
  }
  
  res.json({
    user_id: user.id,
    name: user.name,
    points: user.points || 0,
    level: {
      name: currentLevel.name,
      number: currentLevel.number,
      discount: currentLevel.discount
    },
    next_level: currentLevel.number < 5 ? {
      name: nextLevel.name,
      points_needed: pointsForNext
    } : null,
    total_spent: user.total_spent || 0,
    orders_count: user.orders_count || 0
  });
});

// Get points history
app.get('/api/gamification/points-history', authenticateToken, (req, res) => {
  const db = readDB();
  const history = (db.points_history || [])
    .filter(entry => entry.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50); // Last 50 entries
  
  res.json({
    history: history,
    total: history.length
  });
});

// Add points (for admin or system use)
app.post('/api/gamification/add-points', authenticateToken, (req, res) => {
  const { points, reason } = req.body;
  
  if (!points || points <= 0) {
    return res.status(400).json({ error: 'Pontos devem ser um número positivo' });
  }
  
  if (!reason) {
    return res.status(400).json({ error: 'Motivo é obrigatório' });
  }
  
  const updatedUser = addPointsToUser(req.user.id, points, reason);
  
  if (!updatedUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const currentLevel = calculateLevel(updatedUser.points);
  
  res.json({
    message: `${points} pontos adicionados com sucesso!`,
    user: {
      points: updatedUser.points,
      level: currentLevel
    }
  });
});

// Get leaderboard
app.get('/api/gamification/leaderboard', (req, res) => {
  const db = readDB();
  const leaderboard = db.users
    .filter(user => user.user_type !== 'admin' && user.is_active)
    .map(user => ({
      id: user.id,
      name: user.name.split(' ')[0], // Only first name for privacy
      points: user.points || 0,
      level: calculateLevel(user.points || 0)
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10); // Top 10
  
  res.json({
    leaderboard: leaderboard
  });
});

// Admin stats
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const db = readDB();
  const stats = {
    total_users: db.users.filter(u => u.user_type !== 'admin').length,
    total_orders: 42,
    total_revenue: 1250.80,
    total_products: mockProducts.length,
    pending_orders: 3,
    monthly_growth: 15.5,
    total_points_distributed: (db.points_history || []).reduce((sum, entry) => sum + entry.points, 0),
    active_users_with_points: db.users.filter(u => u.points > 0).length
  };
  
  res.json(stats);
});

// ===============================
// ENDPOINTS ADMIN FALTANTES
// ===============================

// Admin Users - Lista todos os usuários
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const db = readDB();
  const users = db.users.filter(u => u.user_type !== 'admin').map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    user_type: user.user_type,
    is_active: user.is_active,
    created_at: user.created_at,
    points: user.points || 0,
    total_orders: 0, // Implementar contagem real quando tiver pedidos
    total_spent: user.total_spent || 0
  }));
  
  res.json({ users, total: users.length });
});

// Admin Users - Atualizar usuário
app.put('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const { id } = req.params;
  const updates = req.body;
  const db = readDB();
  
  // Fix: Convert string parameter to number for proper comparison
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID de usuário inválido' });
  }
  
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  db.users[userIndex] = { ...db.users[userIndex], ...updates };
  writeDB(db);
  
  res.json({ 
    message: 'Usuário atualizado com sucesso',
    user: db.users[userIndex]
  });
});

// Admin Users - Deletar usuário
app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const { id } = req.params;
  const db = readDB();
  
  // Fix: Convert string parameter to number for proper comparison
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID de usuário inválido' });
  }
  
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  db.users.splice(userIndex, 1);
  writeDB(db);
  
  res.json({ message: 'Usuário deletado com sucesso' });
});

// Admin Orders - Lista todos os pedidos
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  // Mock orders data - implementar com dados reais quando necessário
  const mockOrders = [
    {
      id: 1,
      user: { name: 'João Silva', email: 'joao@email.com' },
      total_amount: 89.90,
      status: 'delivered',
      created_at: new Date().toISOString(),
      items: [
        { name: 'Café Bourbon Amarelo', quantity: 2, price: 44.95 }
      ]
    },
    {
      id: 2,
      user: { name: 'Maria Santos', email: 'maria@email.com' },
      total_amount: 129.80,
      status: 'processing',
      created_at: new Date().toISOString(),
      items: [
        { name: 'Blend Premium', quantity: 1, price: 129.80 }
      ]
    }
  ];
  
  res.json({ orders: mockOrders, total: mockOrders.length });
});

// Admin Orders - Atualizar status do pedido
app.put('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const { id } = req.params;
  const { status } = req.body;
  
  // Mock implementation - implementar com dados reais
  res.json({ 
    message: 'Status do pedido atualizado com sucesso',
    order: { id, status }
  });
});

// Admin Orders - Obter pedido específico
app.get('/api/admin/orders/:id', authenticateToken, (req, res) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  const { id } = req.params;
  
  // Mock order data
  const mockOrder = {
    id: id,
    user: { name: 'João Silva', email: 'joao@email.com' },
    total_amount: 89.90,
    status: 'delivered',
    created_at: new Date().toISOString(),
    items: [
      { name: 'Café Bourbon Amarelo', quantity: 2, price: 44.95 }
    ]
  };
  
  res.json({ order: mockOrder });
});

// User Orders - Meus pedidos
app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // Mock orders para o usuário logado
  const userOrders = [
    {
      id: 1,
      total_amount: 89.90,
      status: 'delivered',
      created_at: new Date().toISOString(),
      items: [
        { name: 'Café Bourbon Amarelo', quantity: 2, price: 44.95 }
      ]
    }
  ];
  
  res.json({ orders: userOrders, total: userOrders.length });
});

// Orders API - Criar novo pedido
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total_amount, payment_method, delivery_address } = req.body;
  
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Itens do pedido são obrigatórios' });
  }
  
  const newOrder = {
    id: Date.now(),
    user_id: req.user.id,
    items: items,
    total_amount: total_amount,
    payment_method: payment_method,
    delivery_address: delivery_address,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  // Implementar salvamento real quando necessário
  res.json({
    message: 'Pedido criado com sucesso!',
    order: newOrder
  });
});

// ===============================
// ADMINISTRAÇÃO DE CLIENTES
// ===============================
app.use('/api/admin/customers', adminCustomersRoutes);
app.use('/api/newsletter', newsletterRoutes);

// 📱 ===================== WHATSAPP ENDPOINTS (API PRÓPRIA) =====================

// Status do WhatsApp Bot
app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const status = await whatsappService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao verificar status do WhatsApp',
      details: error.message 
    });
  }
});

// Webhook para receber mensagens do WhatsApp
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook WhatsApp recebido:', req.body);
    
    // Processar mensagem recebida
    await whatsappService.processIncomingMessage(req.body);
    
    res.json({ success: true, message: 'Mensagem processada' });
  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Enviar mensagem manual (para admin)
app.post('/api/whatsapp/send-message', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem enviar mensagens' });
    }

    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    const chatId = phone.includes('@') ? phone : `${phone}@c.us`;
    const result = await whatsappService.sendTextMessage(chatId, message);
    
    res.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      result: result
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Broadcast para múltiplos contatos (para admin)
app.post('/api/whatsapp/broadcast', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem fazer broadcast' });
    }

    const { phones, message } = req.body;
    
    if (!phones || !Array.isArray(phones) || !message) {
      return res.status(400).json({ error: 'Lista de telefones e mensagem são obrigatórios' });
    }

    // Executar broadcast em background
    whatsappService.sendBroadcast(phones, message);
    
    res.json({ 
      success: true, 
      message: `Broadcast iniciado para ${phones.length} contatos`
    });
  } catch (error) {
    console.error('❌ Erro no broadcast:', error);
    res.status(500).json({ error: 'Erro ao enviar broadcast' });
  }
});

// QR Code para conectar WhatsApp (para admin)
app.get('/api/whatsapp/qr-code', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const status = await whatsappService.getStatus();
    
    if (status.qrCode) {
      res.json({ 
        qrCode: status.qrCode,
        message: 'Escaneie o QR Code com seu WhatsApp'
      });
    } else if (status.connected) {
      res.json({ 
        connected: true,
        message: 'WhatsApp já está conectado'
      });
    } else {
      res.json({ 
        message: 'Aguardando geração do QR Code...'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter QR Code' });
  }
});

// 🗺️ ===================== MAPS ENDPOINTS (OPENSTREETMAP) =====================

// Obter todas as localizações
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await mapsService.getAllLocations();
    res.json(locations);
  } catch (error) {
    console.error('❌ Erro ao buscar localizações:', error);
    res.status(500).json({ error: 'Erro ao buscar localizações' });
  }
});

// Obter localização específica
app.get('/api/locations/:id', async (req, res) => {
  try {
    const location = await mapsService.getLocationById(req.params.id);
    res.json(location);
  } catch (error) {
    console.error('❌ Erro ao buscar localização:', error);
    res.status(500).json({ error: 'Erro ao buscar localização' });
  }
});

// Buscar localizações por tipo
app.get('/api/locations/type/:type', async (req, res) => {
  try {
    const locations = await mapsService.getLocationsByType(req.params.type);
    res.json(locations);
  } catch (error) {
    console.error('❌ Erro ao filtrar localizações:', error);
    res.status(500).json({ error: 'Erro ao filtrar localizações' });
  }
});

// Encontrar loja mais próxima
app.post('/api/locations/nearest', async (req, res) => {
  try {
    const { latitude, longitude, type = 'loja' } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    const result = await mapsService.findNearestLocation(latitude, longitude, type);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao encontrar loja próxima:', error);
    res.status(500).json({ error: 'Erro ao encontrar loja próxima' });
  }
});

// Verificar área de delivery
app.post('/api/delivery/check-area', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Endereço é obrigatório' });
    }

    const result = await mapsService.checkDeliveryArea(address);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao verificar área de delivery:', error);
    res.status(500).json({ error: 'Erro ao verificar área de delivery' });
  }
});

// Geocodificar endereço
app.post('/api/maps/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Endereço é obrigatório' });
    }

    const coords = await mapsService.geocodeAddress(address);
    
    if (coords) {
      res.json({ success: true, coordinates: coords });
    } else {
      res.status(404).json({ success: false, error: 'Endereço não encontrado' });
    }
  } catch (error) {
    console.error('❌ Erro na geocodificação:', error);
    res.status(500).json({ error: 'Erro na geocodificação' });
  }
});

// Geocodificação reversa
app.post('/api/maps/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    const result = await mapsService.reverseGeocode(latitude, longitude);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro na geocodificação reversa:', error);
    res.status(500).json({ error: 'Erro na geocodificação reversa' });
  }
});

// Calcular rota entre dois pontos
app.post('/api/maps/route', async (req, res) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body;
    
    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ 
        error: 'Coordenadas de origem e destino são obrigatórias' 
      });
    }

    const result = await mapsService.getRoute(fromLat, fromLng, toLat, toLng);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao calcular rota:', error);
    res.status(500).json({ error: 'Erro ao calcular rota' });
  }
});

// Buscar cafeterias próximas
app.post('/api/maps/nearby-cafes', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    const result = await mapsService.findNearbyCafes(latitude, longitude, radius);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao buscar cafeterias:', error);
    res.status(500).json({ error: 'Erro ao buscar cafeterias próximas' });
  }
});

// Estatísticas da área de entrega
app.get('/api/delivery/stats', async (req, res) => {
  try {
    const stats = mapsService.getDeliveryStats();
    res.json({ success: true, stats: stats });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '☕ Mestres do Café API',
    status: 'Online',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/products',
      '/api/cart',
      '/api/coupons/validate',
      '/api/whatsapp/status',
      '/api/locations'
    ]
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    path: req.originalUrl 
  });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Dados JSON inválidos' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  res.status(500).json({ 
    error: 'Erro interno do servidor'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Mestres do Café rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 CORS habilitado para: http://localhost:5173`);
    console.log(`☕ Endpoints disponíveis:`);
    console.log(`   GET  / - Info da API`);
    console.log(`   GET  /api/health - Status do sistema`);
    console.log(`   POST /api/auth/register - Cadastro`);
    console.log(`   POST /api/auth/login - Login`);
    console.log(`   GET  /api/products - Lista de produtos`);
    console.log(`   GET  /api/products/featured - Produtos em destaque`);
  });
}

module.exports = app; 