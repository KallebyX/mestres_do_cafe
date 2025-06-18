import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { productsAPI } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  const loadCategories = async () => {
    try {
      const data = await productsAPI.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 12,
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        sort_by: sortBy
      };
      
      const data = await productsAPI.getProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Faça login para adicionar produtos ao carrinho');
      return;
    }
    addToCart(product);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-[#C8956D] fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2B3A42] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B3A42]">
      {/* Header Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-r from-[#C8956D]/10 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Marketplace de <span className="text-[#C8956D]">Cafés Especiais</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra nossa seleção exclusiva de cafés especiais, torrados artesanalmente para proporcionar a melhor experiência sensorial.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#1A2328] rounded-xl p-4 sm:p-6 border border-[#C8956D]/20">
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cafés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#2B3A42] border border-[#C8956D]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#C8956D] transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center w-full px-4 py-3 bg-[#C8956D]/10 border border-[#C8956D]/30 rounded-lg text-[#C8956D] font-medium transition-colors hover:bg-[#C8956D]/20"
              >
                <Filter className="w-5 h-5 mr-2" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>

            {/* Filters */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${showFilters || 'hidden lg:grid'}`}>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#2B3A42] border border-[#C8956D]/20 rounded-lg text-white focus:outline-none focus:border-[#C8956D] transition-colors text-sm sm:text-base"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#2B3A42] border border-[#C8956D]/20 rounded-lg text-white focus:outline-none focus:border-[#C8956D] transition-colors text-sm sm:text-base"
                >
                  <option value="name">Nome A-Z</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                  <option value="created_at">Mais recentes</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {products.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#C8956D]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-[#C8956D]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Nenhum produto encontrado</h3>
              <p className="text-gray-300 mb-4 sm:mb-6">Tente ajustar os filtros ou buscar por outros termos.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#C8956D] text-[#2B3A42] font-semibold rounded-lg hover:bg-[#C8956D]/90 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-[#1A2328] rounded-xl overflow-hidden border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-[#2B3A42] flex items-center justify-center p-4 sm:p-6">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#C8956D]/10 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-[#C8956D]" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-[#C8956D] transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Attributes */}
                    {product.attributes && (
                      <div className="space-y-2 mb-4">
                        {product.attributes.doçura && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Doçura</span>
                            <div className="flex">{renderStars(product.attributes.doçura)}</div>
                          </div>
                        )}
                        {product.attributes.acidez && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Acidez</span>
                            <div className="flex">{renderStars(product.attributes.acidez)}</div>
                          </div>
                        )}
                        {product.attributes.intensidade && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Intensidade</span>
                            <div className="flex">{renderStars(product.attributes.intensidade)}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Origin */}
                    {product.origin && (
                      <p className="text-[#C8956D] text-sm font-medium mb-3 sm:mb-4">
                        {product.origin}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl sm:text-3xl font-bold text-[#C8956D]">
                        R$ {product.price?.toFixed(2)}
                      </span>
                      {product.weight && (
                        <span className="text-gray-400 text-sm">
                          {product.weight}g
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 px-4 py-2.5 border border-[#C8956D] text-[#C8956D] rounded-lg hover:bg-[#C8956D] hover:text-[#2B3A42] transition-all duration-200 text-center font-medium text-sm sm:text-base"
                      >
                        Ver Detalhes
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 px-4 py-2.5 bg-[#C8956D] text-[#2B3A42] rounded-lg hover:bg-[#C8956D]/90 transition-all duration-200 font-semibold flex items-center justify-center text-sm sm:text-base"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 bg-[#1A2328] border border-[#C8956D]/20 rounded-lg text-gray-300 hover:text-[#C8956D] hover:border-[#C8956D]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Anterior
                </button>
                
                <span className="px-4 py-2 text-white text-sm sm:text-base">
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 bg-[#1A2328] border border-[#C8956D]/20 rounded-lg text-gray-300 hover:text-[#C8956D] hover:border-[#C8956D]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketplacePage;

