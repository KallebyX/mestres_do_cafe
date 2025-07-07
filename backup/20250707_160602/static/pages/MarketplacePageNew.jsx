import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, ShoppingCart, Star, Coffee } from 'lucide-react';
import { getAllProducts } from "../lib/api.js"

const MarketplacePageNew = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Carregar dados do usuário e produtos
  useEffect(() => {
    loadUserData();
    loadProducts();
  }, [loadProducts]);

  // Filtrar produtos quando houver mudanças
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const loadUserData = () => {
    try {
      const data = localStorage.getItem('mestresCafeData');
      if (data) {
        const parsed = JSON.parse(data);
        setCurrentUser(parsed.currentUser);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      // Usar API do Supabase para carregar produtos
      const response = await getAllProducts();
      
      if (response.success && response.data) {
        setProducts(response.data);
        console.log('✅ Produtos carregados do Supabase:', response.data.length);
      } else {
        console.error('❌ Erro ao carregar produtos do Supabase:', response.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);



  const filterProducts = useCallback(() => {
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
  }, [products, searchTerm, selectedCategory, sortBy]);

  const addToCart = (product) => {
    // Integrar com o sistema de carrinho global
    if (window.app) {
      window.app.addToCart(product.id, product.name, product.price);
    } else {
      alert(`${product.name} adicionado ao carrinho!`);
    }
  };

  const handleAdminAction = (action, product = null) => {
    if (!currentUser || currentUser.role !== 'admin') {
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
          'Authorization': `Bearer ${currentUser?.access_token}`
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
        rating: editingProduct?.rating || 0,
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
          'Authorization': `Bearer ${currentUser?.access_token}`
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

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2B3A42] flex items-center justify-center">
        <div className="text-center">
          <Coffee className="mx-auto mb-4 w-12 h-12 text-[#C8956D] animate-pulse" />
          <p className="text-white text-lg">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B3A42] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Market<span className="text-[#C8956D]">place</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Descubra nossa seleção premium de cafés especiais, diretamente dos melhores produtores do Brasil.
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-[#1A2328] rounded-xl p-6 mb-8 border border-[#C8956D]/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cafés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#2B3A42] border border-[#C8956D]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#C8956D]"
              />
            </div>

            {/* Categoria */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#2B3A42] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D] appearance-none"
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
                className="w-full px-4 py-3 bg-[#2B3A42] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D] appearance-none"
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
            <div className="flex justify-between items-center pt-4 border-t border-[#C8956D]/20">
              <span className="text-[#C8956D] font-medium">Painel Administrativo</span>
              <button
                onClick={() => handleAdminAction('add')}
                className="flex items-center gap-2 px-4 py-2 bg-[#C8956D] text-[#2B3A42] rounded-lg font-medium hover:bg-[#C8956D]/90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </button>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-300">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            {searchTerm && (
              <span className="text-[#C8956D]"> para "{searchTerm}"</span>
            )}
          </p>
        </div>

        {/* Grid de Produtos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="mx-auto mb-4 w-16 h-16 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou termo de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#1A2328] rounded-xl overflow-hidden border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all hover:transform hover:scale-105"
              >
                {/* Imagem do Produto */}
                <div className="aspect-square bg-gradient-to-br from-[#C8956D]/20 to-[#C8956D]/10 flex items-center justify-center relative">
                  <Coffee className="w-16 h-16 text-[#C8956D]" />
                  
                  {/* Badge de Destaque */}
                  {product.is_featured && (
                    <div className="absolute top-3 left-3 bg-[#C8956D] text-[#2B3A42] px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ Destaque
                    </div>
                  )}

                  {/* Ações Admin */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => handleAdminAction('edit', product)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Editar produto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Informações do Produto */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white text-lg line-clamp-2">{product.name}</h3>
                  </div>

                  {/* Avaliação */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 font-medium">{product.rating}</span>
                      <span className="text-gray-400 text-sm">(Reviews)</span>
                    </div>
                  )}

                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">{product.description}</p>

                  {/* Detalhes */}
                  <div className="space-y-1 mb-4 text-sm">
                    {product.origin && (
                      <p className="text-gray-400">
                        <span className="text-[#C8956D]">Origem:</span> {product.origin}
                      </p>
                    )}
                    {product.roast_level && (
                      <p className="text-gray-400">
                        <span className="text-[#C8956D]">Torra:</span> {product.roast_level}
                      </p>
                    )}
                    {product.flavor_notes && (
                      <p className="text-gray-400">
                        <span className="text-[#C8956D]">Notas:</span> {product.flavor_notes}
                      </p>
                    )}
                  </div>

                  {/* Preços */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-[#C8956D]">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-gray-400 line-through text-sm">
                        R$ {product.original_price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>

                  {/* Estoque */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-400">
                      Estoque: {product.stock_quantity || 0} unidades
                    </span>
                  </div>

                  {/* Botão Adicionar ao Carrinho */}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.stock_quantity || product.stock_quantity === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C8956D] text-[#2B3A42] rounded-lg font-semibold hover:bg-[#C8956D]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2B3A42] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#C8956D]/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {product ? 'Editar Produto' : 'Adicionar Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#C8956D] mb-2">Nome do Produto *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
              />
            </div>

            <div>
              <label className="block text-[#C8956D] mb-2">Categoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
              >
                <option value="especial">Cafés Especiais</option>
                <option value="premium">Premium</option>
                <option value="tradicional">Tradicional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#C8956D] mb-2">Descrição *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#C8956D] mb-2">Preço (R$) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
              />
            </div>

            <div>
              <label className="block text-[#C8956D] mb-2">Preço Original (R$)</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#C8956D] mb-2">Origem</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Ex: Cerrado Mineiro, MG"
                className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
              />
            </div>

            <div>
              <label className="block text-[#C8956D] mb-2">Nível de Torra</label>
              <select
                name="roast_level"
                value={formData.roast_level}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
              >
                <option value="Claro">Claro</option>
                <option value="Médio-Claro">Médio-Claro</option>
                <option value="Médio">Médio</option>
                <option value="Médio-Escuro">Médio-Escuro</option>
                <option value="Escuro">Escuro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#C8956D] mb-2">Notas de Sabor</label>
            <input
              type="text"
              name="flavor_notes"
              value={formData.flavor_notes}
              onChange={handleChange}
              placeholder="Ex: Chocolate, Caramelo, Nozes"
              className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
            />
          </div>

          <div>
            <label className="block text-[#C8956D] mb-2">Quantidade em Estoque *</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-3 bg-[#1A2328] border border-[#C8956D]/30 rounded-lg text-white focus:outline-none focus:border-[#C8956D]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_featured"
              id="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 text-[#C8956D] bg-[#1A2328] border-[#C8956D]/30 rounded focus:ring-[#C8956D]"
            />
            <label htmlFor="is_featured" className="text-white">
              Produto em destaque
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[#C8956D]/30 text-white rounded-lg hover:bg-[#C8956D]/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#C8956D] text-[#2B3A42] rounded-lg font-semibold hover:bg-[#C8956D]/90 transition-all"
            >
              {product ? 'Atualizar' : 'Criar'} Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplacePageNew; 