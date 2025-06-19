import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, ShoppingCart, Star, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MarketplacePage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Carregar produtos e parâmetros de busca da URL
  useEffect(() => {
    loadProducts();
    
    // Verificar se há parâmetros de busca na URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location]);

  // Filtrar produtos quando houver mudanças
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        console.error('Erro ao carregar produtos:', data.error);
        // Fallback para produtos mockados
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const getMockProducts = () => [
    {
      id: '1',
      name: 'Café Bourbon Amarelo Premium',
      description: 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo.',
      price: 45.90,
      original_price: 52.90,
      origin: 'Cerrado Mineiro, MG',
      roast_level: 'Médio',
      flavor_notes: 'Chocolate, Caramelo, Nozes',
      category: 'especial',
      stock_quantity: 50,
      rating: 4.8,
      is_featured: true,
      is_active: true
    },
    {
      id: '2',
      name: 'Café Geisha Especial',
      description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
      price: 89.90,
      original_price: 105.90,
      origin: 'Sul de Minas, MG',
      roast_level: 'Claro',
      flavor_notes: 'Floral, Cítrico, Bergamota',
      category: 'premium',
      stock_quantity: 25,
      rating: 4.9,
      is_featured: true,
      is_active: true
    },
    {
      id: '3',
      name: 'Café Arábica Torrado Artesanal',
      description: 'Blend exclusivo de grãos selecionados com torra artesanal para um sabor equilibrado.',
      price: 32.90,
      original_price: 38.90,
      origin: 'Mogiana, SP',
      roast_level: 'Médio-Escuro',
      flavor_notes: 'Chocolate Amargo, Baunilha',
      category: 'tradicional',
      stock_quantity: 80,
      rating: 4.6,
      is_featured: false,
      is_active: true
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
      is_featured: true,
      is_active: true
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
      is_featured: false,
      is_active: true
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
      is_featured: true,
      is_active: true
    }
  ];

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.flavor_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.origin?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory || 
        (selectedCategory === 'featured' && product.is_featured)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: null,
      description: product.description,
      weight: 500
    });
    
    // Feedback visual opcional
    const button = document.querySelector(`[data-product-id="${product.id}"]`);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Adicionado!';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }
  };

  const handleAdminAction = (action, product = null) => {
    if (!user || user.user_type !== 'admin') {
      alert('Acesso negado. Apenas administradores podem realizar esta ação.');
      return;
    }

    setEditingProduct(product);
    setShowAdminModal(true);
  };

  const saveProduct = async (productData) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `http://localhost:5000/api/admin/products/${editingProduct.id}`
        : 'http://localhost:5000/api/admin/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        await loadProducts(); // Recarregar lista
        setShowAdminModal(false);
        setEditingProduct(null);
        alert(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      
      // Simulação local para quando API não estiver disponível
      const newProduct = {
        id: editingProduct?.id || Date.now().toString(),
        ...productData,
        rating: editingProduct?.rating || 4.5,
        is_active: true
      };

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
      } else {
        setProducts(prev => [...prev, newProduct]);
      }

      setShowAdminModal(false);
      setEditingProduct(null);
      alert(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });

      if (response.ok) {
        await loadProducts();
        alert('Produto excluído com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      
      // Simulação local
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Produto excluído!');
    }
  };

  const isAdmin = user?.user_type === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat">
        <Header />
        <main className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-gold mx-auto mb-4"></div>
            <p className="text-coffee-gray text-lg">Carregando marketplace...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header do Marketplace */}
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              Market<span className="text-coffee-gold">place</span>
            </h1>
            <p className="text-coffee-gray text-lg max-w-2xl mx-auto">
              Descubra nossa seleção premium de cafés especiais, diretamente dos melhores produtores do Brasil.
            </p>
          </div>

          {/* Filtros e Busca */}
          <div className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Busca */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-gray w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar cafés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense placeholder-coffee-gray focus:outline-none focus:border-coffee-gold focus:bg-coffee-white transition-all"
                />
              </div>

              {/* Categoria */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-gray w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense focus:outline-none focus:border-coffee-gold focus:bg-coffee-white transition-all appearance-none"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="especial">Cafés Especiais</option>
                  <option value="premium">Premium</option>
                  <option value="tradicional">Tradicional</option>
                  <option value="featured">Em Destaque</option>
                </select>
              </div>

              {/* Ordenação */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense focus:outline-none focus:border-coffee-gold focus:bg-coffee-white transition-all appearance-none"
                >
                  <option value="name">Nome A-Z</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                  <option value="rating">Melhor Avaliado</option>
                </select>
              </div>
            </div>

            {/* Botão Admin */}
            {isAdmin && (
              <div className="flex justify-between items-center pt-6 border-t border-coffee-cream">
                <span className="text-coffee-gold font-medium">Painel Administrativo</span>
                <button
                  onClick={() => handleAdminAction('add')}
                  className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </button>
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <p className="text-coffee-gray">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && (
                <span className="text-coffee-gold"> para "{searchTerm}"</span>
              )}
            </p>
          </div>

          {/* Grid de Produtos */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-12 h-12 text-coffee-gold" />
              </div>
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-2">Nenhum produto encontrado</h3>
              <p className="text-coffee-gray">Tente ajustar os filtros ou termo de busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card hover:shadow-gold hover:transform hover:scale-105 transition-all duration-300 relative"
                >
                  {/* Link para página do produto */}
                  <Link to={`/produto/${product.id}`} className="block">
                    {/* Imagem do Produto */}
                    <div className="aspect-square bg-gradient-coffee/10 flex items-center justify-center relative rounded-t-lg">
                      <Coffee className="w-16 h-16 text-coffee-gold" />
                      
                      {/* Badge de Destaque */}
                      {product.is_featured && (
                        <div className="absolute top-3 left-3 bg-coffee-gold text-coffee-white px-3 py-1 rounded-full text-xs font-bold">
                          ⭐ Destaque
                        </div>
                      )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="p-6 pb-20">
                      <h3 className="font-cormorant font-bold text-coffee-intense text-xl mb-2 line-clamp-2 hover:text-coffee-gold transition-colors">
                        {product.name}
                      </h3>

                      {/* Avaliação */}
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-yellow-600 font-medium">{product.rating}</span>
                          <span className="text-coffee-gray text-sm">(Avaliações)</span>
                        </div>
                      )}

                      <p className="text-coffee-gray text-sm mb-4 line-clamp-3">{product.description}</p>

                      {/* Detalhes */}
                      <div className="space-y-1 mb-4 text-sm">
                        {product.origin && (
                          <p className="text-coffee-gray">
                            <span className="text-coffee-gold font-medium">Origem:</span> {product.origin}
                          </p>
                        )}
                        {product.roast_level && (
                          <p className="text-coffee-gray">
                            <span className="text-coffee-gold font-medium">Torra:</span> {product.roast_level}
                          </p>
                        )}
                        {product.flavor_notes && (
                          <p className="text-coffee-gray">
                            <span className="text-coffee-gold font-medium">Notas:</span> {product.flavor_notes}
                          </p>
                        )}
                      </div>

                      {/* Preços */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-cormorant font-bold text-2xl text-coffee-gold">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-coffee-gray line-through text-sm">
                            R$ {product.original_price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      {/* Estoque */}
                      <div className="mb-4">
                        <span className="text-sm text-coffee-gray">
                          Estoque: {product.stock_quantity || 0} unidades
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Ações Admin - Posicionadas absolutamente */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAdminAction('edit', product);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Editar produto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteProduct(product.id);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Botão Adicionar ao Carrinho - Posicionado absolutamente */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <button
                      data-product-id={product.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.stock_quantity || product.stock_quantity === 0}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock_quantity > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal Admin */}
      {showAdminModal && (
        <AdminProductModal
          product={editingProduct}
          onSave={saveProduct}
          onClose={() => {
            setShowAdminModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Modal para Adicionar/Editar Produtos (Admin)
const AdminProductModal = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    origin: product?.origin || '',
    roast_level: product?.roast_level || 'Médio',
    flavor_notes: product?.flavor_notes || '',
    category: product?.category || 'especial',
    stock_quantity: product?.stock_quantity || '',
    is_featured: product?.is_featured || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock_quantity: parseInt(formData.stock_quantity)
    };

    onSave(processedData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-coffee-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-cormorant font-bold text-2xl text-coffee-intense">
              {product ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>
            <button
              onClick={onClose}
              className="text-coffee-gray hover:text-coffee-intense text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-intense font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-coffee-intense font-medium mb-2">Preço *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-coffee-intense font-medium mb-2">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-intense font-medium mb-2">Preço Original</label>
                <input
                  type="number"
                  step="0.01"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-coffee-intense font-medium mb-2">Estoque</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-intense font-medium mb-2">Origem</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-coffee-intense font-medium mb-2">Nível de Torra</label>
                <select
                  name="roast_level"
                  value={formData.roast_level}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                >
                  <option value="Claro">Claro</option>
                  <option value="Médio">Médio</option>
                  <option value="Médio-Escuro">Médio-Escuro</option>
                  <option value="Escuro">Escuro</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-coffee-intense font-medium mb-2">Notas de Sabor</label>
                <input
                  type="text"
                  name="flavor_notes"
                  value={formData.flavor_notes}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-coffee-intense font-medium mb-2">Categoria</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:outline-none"
                >
                  <option value="especial">Especial</option>
                  <option value="premium">Premium</option>
                  <option value="tradicional">Tradicional</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-coffee-gold bg-coffee-cream border-coffee-cream rounded focus:ring-coffee-gold"
              />
              <label htmlFor="is_featured" className="ml-2 text-coffee-intense font-medium">
                Produto em destaque
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1 py-3"
              >
                {product ? 'Atualizar' : 'Criar'} Produto
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6 py-3"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage; 