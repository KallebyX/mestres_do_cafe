import { getAllProducts } from "@/lib/api";
import { ChevronDown, Coffee, Filter, Heart, Package, Search, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShippingTracker from '../components/ShippingTracker';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import analytics from '../services/analytics';
import { useDebouncedValue } from '../utils/debounce';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoast, setSelectedRoast] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState(new Set());
  const [showTracking, setShowTracking] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debounced search term para otimizar performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Carregar produtos do Supabase
  useEffect(() => {
    loadProducts();
    // Track page view para marketplace
    analytics.trackPageView('/marketplace');
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllProducts();
      
      if (result.success) {
        // API de produtos públicos retorna diretamente os dados
        const productsArray = result.data?.products || [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } else {
        throw new Error(result.error || 'Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros com debouncing para otimizar performance
  useEffect(() => {
    let filtered = [...products];

    // Filtro por termo de busca (usando debounced value)
    if (debouncedSearchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.origin?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtro por nível de torra
    if (selectedRoast !== 'all') {
      filtered = filtered.filter(product => product.roast_level === selectedRoast);
    }

    // Filtro por faixa de preço
    if (priceRange !== 'all' && typeof priceRange === 'string' && priceRange.includes('-')) {
      const parts = priceRange.split('-').map(Number);
      const [min, max] = parts.filter(n => !isNaN(n));
      
      if (min !== undefined) {
        filtered = filtered.filter(product => {
          const price = product.price;
          if (max !== undefined) {
            return price >= min && price <= max;
          } else {
            return price >= min;
          }
        });
      }
    } else if (priceRange !== 'all' && !isNaN(Number(priceRange))) {
      // Caso seja apenas um número (ex: "100" para "acima de 100")
      const min = Number(priceRange);
      filtered = filtered.filter(product => product.price >= min);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, debouncedSearchTerm, selectedCategory, selectedRoast, priceRange, sortBy]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      
      // Track add to cart event
      analytics.trackAddToCart({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1
      });
      
      alert(`${product.name} adicionado ao carrinho!`);
    } catch (error) {
      alert('Erro ao adicionar produto ao carrinho');
    }
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favoriteProducts);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavoriteProducts(newFavorites);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Obter categorias únicas dos produtos
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const roastLevels = [...new Set(products.map(p => p.roast_level))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Carregando Produtos...</h2>
            <p className="text-slate-600">Buscando os melhores cafés para você</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Erro ao Carregar</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={loadProducts}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              ☕ Marketplace de Cafés Especiais
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Descubra os melhores cafés especiais selecionados diretamente dos produtores. 
              Qualidade, origem e sabor únicos em cada grão.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <Coffee className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">{products.length}</div>
              <div className="text-slate-600">Cafés Disponíveis</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">86+</div>
              <div className="text-slate-600">Pontuação SCA Média</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
              <div className="text-slate-600">Cafés Especiais</div>
            </div>
          </div>

          {/* Rastreamento Rápido */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Rastrear Pedido</h3>
              </div>
              <button
                onClick={() => setShowTracking(!showTracking)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showTracking ? 'Fechar' : 'Rastrear'}
              </button>
            </div>
            
            {showTracking && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Digite o código de rastreamento..."
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      if (trackingCode.trim()) {
                        // Validar se o código existe antes de mostrar
                        setShowTracking(true);
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buscar
                  </button>
                </div>
                
                {trackingCode && trackingCode.length > 3 && (
                  <div className="mt-4">
                    <ShippingTracker 
                      trackingCode={trackingCode}
                      autoRefresh={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, origem ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Toggle Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Roast Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nível de Torra</label>
                  <select
                    value={selectedRoast}
                    onChange={(e) => setSelectedRoast(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">Todos os níveis</option>
                    {roastLevels.map(roast => (
                      <option key={roast} value={roast}>
                        {roast === 'light' ? 'Clara' : roast === 'medium' ? 'Média' : roast === 'medium-dark' ? 'Média-Escura' : 'Escura'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Faixa de Preço</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">Todos os preços</option>
                    <option value="0-40">Até R$ 40</option>
                    <option value="40-60">R$ 40 - R$ 60</option>
                    <option value="60-80">R$ 60 - R$ 80</option>
                    <option value="80-100">R$ 80 - R$ 100</option>
                    <option value="100">Acima de R$ 100</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ordenar Por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="name">Nome A-Z</option>
                    <option value="price-low">Menor Preço</option>
                    <option value="price-high">Maior Preço</option>
                    <option value="rating">Melhor Avaliação</option>
                    <option value="newest">Mais Recentes</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-slate-900">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </h3>
          
          {filteredProducts.length === 0 && products.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedRoast('all');
                setPriceRange('all');
                setSortBy('name');
              }}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const discount = getDiscountPercentage(product.original_price, product.price);
              const isInStock = (product.stock_quantity || product.stock || 0) > 0;
              const isFavorite = favoriteProducts.has(product.id);
              
              return (
                <div key={product.id} className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Coffee className="w-16 h-16 text-amber-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_featured && (
                        <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ⭐ Destaque
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      {!isInStock && (
                        <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Esgotado
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isFavorite 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {product.origin} • {product.weight || '500g'}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating and Score */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-slate-700">
                          {product.sca_score || 85} SCA
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Estoque: {product.stock_quantity || product.stock || 0}
                      </div>
                    </div>

                    {/* Flavor Notes */}
                    {product.flavor_notes && product.flavor_notes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">Notas de sabor:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.flavor_notes.slice(0, 3).map((note, index) => (
                            <span key={index} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-slate-500 line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Track product view event
                          analytics.trackProductView({
                            product_id: product.id,
                            product_name: product.name,
                            price: product.price,
                            category: product.category
                          });
                          navigate(`/produto/${product.id}`);
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!isInStock}
                        className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                          isInStock
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isInStock ? 'Comprar' : 'Esgotado'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-slate-600 mb-6">
              Tente ajustar os filtros ou remover alguns termos da busca.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedRoast('all');
                setPriceRange('all');
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage; 