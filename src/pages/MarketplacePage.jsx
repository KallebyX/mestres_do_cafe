import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Award,
  Coffee,
  Truck,
  Shield
} from 'lucide-react';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('nome');
  const [priceRange, setPriceRange] = useState([0, 200]);

  // Mock products data
  const mockProducts = [
    {
      id: 1,
      name: "Bourbon Amarelo Premium",
      description: "Notas de chocolate e caramelo, corpo encorpado com acidez equilibrada.",
      price: 45.90,
      originalPrice: 52.90,
      category: "especiais",
      rating: 4.8,
      reviews: 127,
      image: "☕",
      badge: "Mais Vendido",
      origin: "Montanhas de Minas",
      altitude: "1200m",
      process: "Natural",
      roast: "Médio",
      score: 85,
      inStock: true,
      discount: 13
    },
    {
      id: 2,
      name: "Geisha Especial",
      description: "Perfil floral e cítrico excepcional, uma experiência única.",
      price: 89.90,
      originalPrice: 89.90,
      category: "premium",
      rating: 4.9,
      reviews: 89,
      image: "🌟",
      badge: "Premium",
      origin: "Fazenda São Benedito",
      altitude: "1400m",
      process: "Lavado",
      roast: "Claro",
      score: 92,
      inStock: true,
      discount: 0
    },
    {
      id: 3,
      name: "Blend Signature",
      description: "Equilíbrio perfeito entre doçura natural e corpo cremoso.",
      price: 39.90,
      originalPrice: 44.90,
      category: "blends",
      rating: 4.7,
      reviews: 203,
      image: "🏆",
      badge: "Novo",
      origin: "Seleção Especial",
      altitude: "1000-1300m",
      process: "Semi-lavado",
      roast: "Médio-escuro",
      score: 82,
      inStock: true,
      discount: 11
    },
    {
      id: 4,
      name: "Catuaí Vermelho",
      description: "Doce natural com notas de frutas vermelhas e chocolate ao leite.",
      price: 42.90,
      originalPrice: 42.90,
      category: "especiais",
      rating: 4.6,
      reviews: 156,
      image: "🔴",
      badge: "Certificado",
      origin: "Cerrado Mineiro",
      altitude: "1100m",
      process: "Pulped Natural",
      roast: "Médio",
      score: 84,
      inStock: true,
      discount: 0
    },
    {
      id: 5,
      name: "Décaféinado Especial",
      description: "Todo sabor sem cafeína. Processo Swiss Water preserva aromas.",
      price: 48.90,
      originalPrice: 55.90,
      category: "decaf",
      rating: 4.4,
      reviews: 78,
      image: "🌙",
      badge: "Sem Cafeína",
      origin: "Sul de Minas",
      altitude: "1200m",
      process: "Swiss Water",
      roast: "Médio",
      score: 81,
      inStock: true,
      discount: 12
    },
    {
      id: 6,
      name: "Expresso Premium",
      description: "Blend especial para expresso, crema densa e sabor intenso.",
      price: 36.90,
      originalPrice: 41.90,
      category: "blends",
      rating: 4.8,
      reviews: 312,
      image: "⚡",
      badge: "Para Expresso",
      origin: "Blend Especial",
      altitude: "900-1200m",
      process: "Misto",
      roast: "Escuro",
      score: 83,
      inStock: false,
      discount: 12
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos os Cafés', count: 6 },
    { id: 'especiais', name: 'Cafés Especiais', count: 2 },
    { id: 'premium', name: 'Premium', count: 1 },
    { id: 'blends', name: 'Blends', count: 2 },
    { id: 'decaf', name: 'Descafeinados', count: 1 }
  ];

  const features = [
    {
      icon: Award,
      title: "Certificação SCA",
      description: "Pontuação acima de 80"
    },
    {
      icon: Truck,
      title: "Frete Grátis",
      description: "Acima de R$ 99"
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Proteção total"
    },
    {
      icon: Coffee,
      title: "Frescor Garantido",
      description: "Torra sob demanda"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.origin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nome':
          return a.name.localeCompare(b.name);
        case 'preco-asc':
          return a.price - b.price;
        case 'preco-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'score':
          return b.score - a.score;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  const ProductCard = ({ product }) => (
    <Link 
      to={`/produto/${product.id}`}
      className="block group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100 cursor-pointer"
    >
      {/* Product Header */}
      <div className="relative mb-6">
        {/* Badge */}
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            product.badge === 'Premium' ? 'bg-purple-100 text-purple-800' :
            product.badge === 'Mais Vendido' ? 'bg-green-100 text-green-800' :
            product.badge === 'Novo' ? 'bg-blue-100 text-blue-800' :
            'bg-amber-100 text-amber-800'
          }`}>
            {product.badge}
          </span>
          
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">{product.image}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-slate-600">{product.rating}</span>
            <span className="text-xs text-slate-500">({product.reviews})</span>
          </div>
        </div>

        {/* Heart Icon */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle favorite logic here
          }}
          className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Heart className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">{product.name}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="text-slate-500">Origem</div>
            <div className="font-medium text-slate-700">{product.origin}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="text-slate-500">Pontuação SCA</div>
            <div className="font-medium text-slate-700">{product.score} pts</div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {product.discount > 0 && (
              <div className="text-sm text-slate-500 line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </div>
            )}
            <div className="text-2xl font-bold text-slate-900">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle add to cart logic here
              if (product.inStock) {
                console.log('Adicionando ao carrinho:', product.name);
              }
            }}
            disabled={!product.inStock}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              product.inStock
                ? 'bg-amber-600 hover:bg-amber-700 text-white transform hover:scale-105'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inStock ? 'Adicionar' : 'Esgotado'}
          </button>
        </div>

        {/* View Details Hint */}
        <div className="text-center pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 group-hover:text-amber-600 transition-colors">
            Clique para ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando cafés especiais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2 mb-6">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Marketplace Premium</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Cafés <span className="text-amber-400">Especiais</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Descubra nossa seleção exclusiva de cafés com pontuação SCA acima de 80 pontos. 
              Torrefação artesanal, frescor garantido e entrega em todo o Brasil.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-white font-semibold text-sm">{feature.title}</div>
                  <div className="text-slate-400 text-xs">{feature.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cafés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="nome">Ordenar por Nome</option>
                <option value="preco-asc">Menor Preço</option>
                <option value="preco-desc">Maior Preço</option>
                <option value="rating">Melhor Avaliado</option>
                <option value="score">Maior Pontuação</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'café encontrado' : 'cafés encontrados'}
              </h2>
              {searchTerm && (
                <p className="text-slate-600 mt-1">
                  Resultados para: "{searchTerm}"
                </p>
              )}
            </div>

            <button className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros Avançados
            </button>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Nenhum café encontrado</h3>
              <p className="text-slate-600 mb-6">
                Tente ajustar os filtros ou fazer uma nova busca.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('todos');
                  setPriceRange([0, 200]);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-slate-900 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors">
                Carregar Mais Cafés
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="text-5xl">📧</div>
            <h2 className="text-3xl font-bold text-slate-900">
              Receba Ofertas Exclusivas
            </h2>
            <p className="text-xl text-slate-600">
              Seja o primeiro a saber sobre novos cafés, promoções e conteúdo exclusivo sobre café especial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Inscrever
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketplacePage; 