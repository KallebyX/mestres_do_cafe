const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

// Mock database de produtos (depois será substituído por PostgreSQL)
let products = [
  {
    id: '1',
    name: 'Café Bourbon Amarelo Premium',
    description: 'Café especial da região do Cerrado Mineiro com notas de chocolate e caramelo.',
    price: 45.90,
    original_price: 52.90,
    origin: 'Cerrado Mineiro, MG',
    roast_level: 'Médio',
    flavor_notes: 'Chocolate, Caramelo, Nozes',
    acidity: 'média',
    bitterness: 'médio',
    stock_quantity: 50,
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400'
    ],
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Café Geisha Especial',
    description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com notas florais únicas.',
    price: 89.90,
    original_price: 105.90,
    origin: 'Sul de Minas, MG',
    roast_level: 'Claro',
    flavor_notes: 'Floral, Cítrico, Bergamota',
    acidity: 'alta',
    bitterness: 'suave',
    stock_quantity: 25,
    images: [
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
    ],
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Café Arábica Tradicional',
    description: 'Blend especial da casa com grãos selecionados de diferentes regiões.',
    price: 35.90,
    original_price: 39.90,
    origin: 'Blend Nacional',
    roast_level: 'Médio',
    flavor_notes: 'Equilibrado, Doce, Suave',
    acidity: 'baixa',
    bitterness: 'suave',
    stock_quantity: 100,
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
    ],
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Validation middleware
const validateProductQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('search').optional().isString().trim(),
  query('origin').optional().isString().trim(),
  query('roast_level').optional().isString().trim(),
  query('acidity').optional().isIn(['baixa', 'média', 'alta']).withMessage('Acidez deve ser baixa, média ou alta'),
  query('bitterness').optional().isIn(['suave', 'médio', 'intenso']).withMessage('Amargor deve ser suave, médio ou intenso'),
  query('featured').optional().isBoolean().withMessage('Featured deve ser true ou false'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Preço mínimo deve ser positivo'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Preço máximo deve ser positivo')
];

// GET /api/products - Listar produtos com filtros
router.get('/', validateProductQuery, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      origin,
      roast_level,
      acidity,
      bitterness,
      featured,
      min_price,
      max_price,
      sort = 'name'
    } = req.query;

    let filteredProducts = products.filter(p => p.is_active);

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.flavor_notes.toLowerCase().includes(searchLower) ||
        p.origin.toLowerCase().includes(searchLower)
      );
    }

    if (origin) {
      filteredProducts = filteredProducts.filter(p => 
        p.origin.toLowerCase().includes(origin.toLowerCase())
      );
    }

    if (roast_level) {
      filteredProducts = filteredProducts.filter(p => 
        p.roast_level.toLowerCase() === roast_level.toLowerCase()
      );
    }

    if (acidity) {
      filteredProducts = filteredProducts.filter(p => p.acidity === acidity);
    }

    if (bitterness) {
      filteredProducts = filteredProducts.filter(p => p.bitterness === bitterness);
    }

    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      filteredProducts = filteredProducts.filter(p => p.is_featured === isFeatured);
    }

    if (min_price) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(min_price));
    }

    if (max_price) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(max_price));
    }

    // Ordenação
    switch (sort) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Paginação
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      products: paginatedProducts,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_products: totalProducts,
        products_per_page: parseInt(limit),
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1
      },
      filters_applied: {
        search: search || null,
        origin: origin || null,
        roast_level: roast_level || null,
        acidity: acidity || null,
        bitterness: bitterness || null,
        featured: featured !== undefined ? featured === 'true' : null,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null,
        sort
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/products/featured - Produtos em destaque
router.get('/featured', (req, res) => {
  try {
    const featuredProducts = products.filter(p => p.is_featured && p.is_active);
    
    res.json({
      products: featuredProducts,
      total: featuredProducts.length
    });

  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/products/:id - Detalhes de um produto
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const product = products.find(p => p.id === id && p.is_active);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Produtos relacionados (mesma origem ou nível de torra)
    const relatedProducts = products
      .filter(p => 
        p.id !== id && 
        p.is_active && 
        (p.origin === product.origin || p.roast_level === product.roast_level)
      )
      .slice(0, 4);

    res.json({
      product,
      related_products: relatedProducts
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/products/filters/options - Opções para filtros
router.get('/filters/options', (req, res) => {
  try {
    const activeProducts = products.filter(p => p.is_active);
    
    const origins = [...new Set(activeProducts.map(p => p.origin))].sort();
    const roastLevels = [...new Set(activeProducts.map(p => p.roast_level))].sort();
    const acidityLevels = [...new Set(activeProducts.map(p => p.acidity))].sort();
    const bitternessLevels = [...new Set(activeProducts.map(p => p.bitterness))].sort();
    
    const priceRange = {
      min: Math.min(...activeProducts.map(p => p.price)),
      max: Math.max(...activeProducts.map(p => p.price))
    };

    res.json({
      origins,
      roast_levels: roastLevels,
      acidity_levels: acidityLevels,
      bitterness_levels: bitternessLevels,
      price_range: priceRange,
      total_products: activeProducts.length
    });

  } catch (error) {
    console.error('Erro ao buscar opções de filtros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 