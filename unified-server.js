/* eslint-disable no-undef */
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Para usar require() em ESM quando necessário
const require = createRequire(import.meta.url);

// Equivalente ao __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS para desenvolvimento e produção
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://*.onrender.com',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir arquivos estáticos do frontend (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Importar e usar as rotas do backend (simulando a API)
// Como o server.js é CommonJS, vamos recriar as rotas principais aqui

// Mock data simples
const mockProducts = [
  {
    id: '1',
    name: 'Café Bourbon Amarelo Premium',
    description: 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo.',
    price: 45.90,
    image: '☕',
    is_active: true
  },
  {
    id: '2', 
    name: 'Café Geisha Especial',
    description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
    price: 89.90,
    image: '🌸',
    is_active: true
  }
];

// Rotas básicas da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    services: {
      frontend: 'OK',
      backend: 'OK', 
      unified: true
    }
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: mockProducts,
    total: mockProducts.length
  });
});

app.get('/api/products/featured', (req, res) => {
  res.json({
    products: mockProducts.slice(0, 2),
    total: 2
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json({ success: true, product });
});

// Rota para autenticação demo
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login simples
  if (email === 'admin@mestrescafe.com.br' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: 1,
        name: 'Administrador',
        email: email,
        user_type: 'admin'
      },
      access_token: 'demo_token_12345'
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Health check unificado na raiz
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      frontend: 'OK',
      backend: 'OK',
      unified: true
    }
  });
});

// Catch all para SPA - deve ser a última rota
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor unificado
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Unificado Mestres do Café`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 Backend API: http://localhost:${PORT}/api`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
  console.log(`☕ Endpoints disponíveis:`);
  console.log(`   GET  /health - Status unificado`);
  console.log(`   GET  /api/health - Status da API`);
  console.log(`   GET  /api/products - Lista de produtos`);
  console.log(`   POST /api/auth/login - Login demo`);
  console.log(`   GET  /* - Frontend React (SPA)`);
});

export default app; 