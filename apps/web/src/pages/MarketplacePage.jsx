import { getAllProducts } from "../services/api.js";
import {
  ChevronDown, Coffee, Filter, Heart, Package, Search,
  ShoppingCart, Star, TrendingUp, X, SlidersHorizontal,
  ArrowUpDown, MapPin, Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    loadProducts();
    analytics.trackPageView('/marketplace');
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllProducts();
      if (result.success) {
        const productsArray = result.data?.products || [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } else {
        throw new Error(result.error || 'Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    if (debouncedSearchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.origin?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedRoast !== 'all') {
      filtered = filtered.filter(product => product.roast_level === selectedRoast);
    }

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
      const min = Number(priceRange);
      filtered = filtered.filter(product => product.price >= min);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'newest': return new Date(b.created_at) - new Date(a.created_at);
        default: return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, debouncedSearchTerm, selectedCategory, selectedRoast, priceRange, sortBy]);

  const handleAddToCart = async (product) => {
    try {
      const defaultProductPrice = product.product_prices?.[0];
      if (!defaultProductPrice) {
        alert('Produto sem opcoes de peso disponiveis');
        return;
      }

      const result = await addToCart(product, 1, {
        productPriceId: defaultProductPrice.id,
        weight: defaultProductPrice.weight
      });

      if (result.success) {
        analytics.trackAddToCart({
          product_id: product.id,
          product_name: product.name,
          price: defaultProductPrice.price,
          category: product.category,
          quantity: 1,
          weight: defaultProductPrice.weight,
          product_price_id: defaultProductPrice.id
        });
        alert(`${product.name} (${defaultProductPrice.weight}) adicionado ao carrinho!`);
      } else {
        alert(result.message || 'Erro ao adicionar produto ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedRoast('all');
    setPriceRange('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedRoast !== 'all' || priceRange !== 'all';

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const roastLevels = [...new Set(products.map(p => p.roast_level))].filter(Boolean);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-responsive section">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Coffee className="w-10 h-10 text-brand-brown animate-pulse" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Carregando Produtos...</h2>
            <p className="text-muted-foreground">Buscando os melhores cafes para voce</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-responsive section">
          <div className="text-center py-20">
            <div className="card-base max-w-md mx-auto p-8 border-error-200 dark:border-error-500/20">
              <div className="w-16 h-16 bg-error-100 dark:bg-error-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-8 h-8 text-error-500" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Erro ao Carregar</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button onClick={loadProducts} className="btn-primary">
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-cream to-background dark:from-brand-dark dark:to-background border-b border-border">
        <div className="container-responsive py-12 lg:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-brown/10 text-brand-brown text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Cafes Especiais Selecionados
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Marketplace de Cafes
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubra os melhores cafes especiais selecionados diretamente dos produtores.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mt-10">
            <div className="text-center">
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Cafes</div>
            </div>
            <div className="text-center">
              <div className="stat-value">86+</div>
              <div className="stat-label">SCA Media</div>
            </div>
            <div className="text-center">
              <div className="stat-value">100%</div>
              <div className="stat-label">Especiais</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-responsive py-8">
        {/* Tracking Section */}
        <div className="card-base p-5 mb-8 border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Rastrear Pedido</h3>
                <p className="text-sm text-muted-foreground">Acompanhe sua entrega em tempo real</p>
              </div>
            </div>
            <button
              onClick={() => setShowTracking(!showTracking)}
              className="btn-ghost text-sm"
            >
              {showTracking ? 'Fechar' : 'Rastrear'}
            </button>
          </div>

          {showTracking && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Digite o codigo de rastreamento..."
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="input-base flex-1"
                />
                <button className="btn-primary" onClick={() => trackingCode.trim() && setShowTracking(true)}>
                  Buscar
                </button>
              </div>
              {trackingCode && trackingCode.length > 3 && (
                <div className="mt-4">
                  <ShippingTracker trackingCode={trackingCode} autoRefresh={false} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search and Filters Bar */}
        <div className="card-base p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, origem ou descricao..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-12"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-base py-2.5 w-44"
              >
                <option value="name">Nome A-Z</option>
                <option value="price-low">Menor Preco</option>
                <option value="price-high">Maior Preco</option>
                <option value="rating">Melhor Avaliacao</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-brand-brown/10 border-brand-brown text-brand-brown' : ''}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand-brown rounded-full" />
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-base"
                  >
                    <option value="all">Todas</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Roast Level */}
                <div className="form-group">
                  <label className="form-label">Nivel de Torra</label>
                  <select
                    value={selectedRoast}
                    onChange={(e) => setSelectedRoast(e.target.value)}
                    className="input-base"
                  >
                    <option value="all">Todos</option>
                    {roastLevels.map(roast => (
                      <option key={roast} value={roast}>
                        {roast === 'light' ? 'Clara' : roast === 'medium' ? 'Media' : roast === 'medium-dark' ? 'Media-Escura' : 'Escura'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="form-group">
                  <label className="form-label">Faixa de Preco</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="input-base"
                  >
                    <option value="all">Todos</option>
                    <option value="0-40">Ate R$ 40</option>
                    <option value="40-60">R$ 40 - R$ 60</option>
                    <option value="60-80">R$ 60 - R$ 80</option>
                    <option value="80-100">R$ 80 - R$ 100</option>
                    <option value="100">Acima de R$ 100</option>
                  </select>
                </div>

                {/* Sort - Mobile */}
                <div className="form-group lg:hidden">
                  <label className="form-label">Ordenar</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-base"
                  >
                    <option value="name">Nome A-Z</option>
                    <option value="price-low">Menor Preco</option>
                    <option value="price-high">Maior Preco</option>
                    <option value="rating">Melhor Avaliacao</option>
                    <option value="newest">Mais Recentes</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button onClick={clearFilters} className="text-sm text-brand-brown hover:text-brand-brown/80 font-medium">
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discount = getDiscountPercentage(product.original_price, product.price);
              const isInStock = (product.stock_quantity || product.stock || 0) > 0;
              const isFavorite = favoriteProducts.has(product.id);

              return (
                <div key={product.id} className="group card-interactive overflow-hidden">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-coffee-100 to-coffee-200">
                        <Coffee className="w-16 h-16 text-coffee-400" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_featured && (
                        <span className="badge bg-brand-brown text-white px-2.5 py-1 text-xs">
                          Destaque
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="badge bg-error-500 text-white px-2.5 py-1 text-xs">
                          -{discount}%
                        </span>
                      )}
                      {!isInStock && (
                        <span className="badge bg-muted-foreground text-white px-2.5 py-1 text-xs">
                          Esgotado
                        </span>
                      )}
                    </div>

                    {/* Score Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-md">
                      <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                      <span className="text-sm font-bold text-foreground">{product.sca_score || 85}</span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                        isFavorite
                          ? 'bg-error-500 text-white'
                          : 'bg-white/90 dark:bg-gray-900/90 text-muted-foreground hover:text-error-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 md:p-5 space-y-3">
                    {/* Origin */}
                    {product.origin && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{product.origin}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2 group-hover:text-brand-brown transition-colors">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Flavor Notes */}
                    {product.flavor_notes && product.flavor_notes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {product.flavor_notes.slice(0, 3).map((note, index) => (
                          <span key={index} className="badge-primary text-xs">
                            {note}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-end gap-2 pt-2 border-t border-border">
                      <span className="text-xl font-bold text-foreground">
                        {product.product_prices && product.product_prices.length > 0
                          ? formatPrice(product.product_prices[0].price)
                          : formatPrice(product.price)
                        }
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Weight Info */}
                    {product.product_prices && product.product_prices.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        A partir de {product.product_prices[0].weight}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        to={`/produto/${product.id}`}
                        className="flex-1 btn-secondary py-2.5 text-sm justify-center"
                        onClick={() => {
                          analytics.trackProductView({
                            product_id: product.id,
                            product_name: product.name,
                            price: product.price,
                            category: product.category
                          });
                        }}
                      >
                        Ver Detalhes
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!isInStock}
                        className={`flex-1 py-2.5 text-sm justify-center ${
                          isInStock ? 'btn-primary' : 'btn bg-muted text-muted-foreground cursor-not-allowed'
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
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Tente ajustar os filtros ou remover alguns termos da busca.
            </p>
            <button onClick={clearFilters} className="btn-primary">
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
