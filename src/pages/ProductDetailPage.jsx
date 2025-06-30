import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ShoppingCart, Heart, Share2, Minus, Plus, Coffee, 
  Award, Truck, Shield, ChevronLeft, ChevronRight, Eye, ArrowLeft
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { productsAPI } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { getProductById, getAllProducts } from '../lib/supabase-products';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useSupabaseAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getProductById(id);
      
      if (result.success) {
        console.log('✅ Produto carregado:', result.data);
        setProduct(result.data);
        await loadRelatedProducts(result.data.category);
      } else {
        throw new Error(result.error || 'Produto não encontrado');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar produto:', err);
      setError('Produto não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (category) => {
    try {
      const result = await getAllProducts();
      if (result.success) {
        const related = result.data
          .filter(p => p.id !== id && p.category === category)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos relacionados:', err);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      alert(`${quantity}x ${product.name} adicionado ao carrinho!`);
    } catch (error) {
      alert('Erro ao adicionar produto ao carrinho');
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const weightOptions = [
    { value: '250g', label: '250g', priceMultiplier: 1 },
    { value: '500g', label: '500g', priceMultiplier: 1.8 },
    { value: '1kg', label: '1kg', priceMultiplier: 3.5 }
  ];

  const currentWeightOption = weightOptions.find(w => w.value === selectedWeight);
  const currentPrice = product ? product.price * currentWeightOption.priceMultiplier : 0;

  const productImages = product?.images || [product?.image || '/default-coffee.jpg'];

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aqui você poderia salvar no backend se logado
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Carregando Produto...</h2>
            <p className="text-slate-600">Buscando informações detalhadas</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-600 text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Produto Não Encontrado</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/marketplace')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
              >
                Ver Outros Produtos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discount = getDiscountPercentage(product.original_price, product.price);
  const isInStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-amber-600">
            Início
          </button>
          <span>/</span>
          <button onClick={() => navigate('/marketplace')} className="hover:text-amber-600">
            Marketplace
          </button>
          <span>/</span>
          <span className="text-slate-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <span className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    ⭐ Destaque
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
                {!isInStock && (
                  <span className="bg-gray-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Esgotado
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-slate-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index 
                        ? 'border-amber-500' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category || 'Café Especial'}
                </span>
                {product.is_featured && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Destaque
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
              <p className="text-slate-600 mb-4">{product.description}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={`${i < product.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-slate-600">({product.reviews_count || 0} avaliações)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  R$ {currentPrice.toFixed(2)}
                </span>
                {currentWeightOption.priceMultiplier !== 1 && (
                  <span className="text-lg text-slate-500 line-through">
                    R$ {(product.price * currentWeightOption.priceMultiplier * 1.2).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Weight Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Peso
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {weightOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedWeight(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        selectedWeight === option.value
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-slate-600">
                        R$ {(product.price * option.priceMultiplier).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Quantidade
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-slate-200 rounded-xl">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-slate-600">
                    Total: R$ {(currentPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 ${
                  isInStock
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isInStock ? `Adicionar ${quantity}x ao Carrinho` : 'Produto Esgotado'}
              </button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <Award className="mx-auto text-amber-600 mb-2" size={24} />
                <div className="text-sm font-medium text-slate-900">Origem</div>
                <div className="text-xs text-slate-600">{product.origin || 'Brasil'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Coffee className="mx-auto text-amber-600 mb-2" size={24} />
                <div className="text-sm font-medium text-slate-900">Intensidade</div>
                <div className="text-xs text-slate-600">{product.intensity || 4}/5</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Truck className="mx-auto text-amber-600 mb-2" size={24} />
                <div className="text-sm font-medium text-slate-900">Entrega</div>
                <div className="text-xs text-slate-600">2-5 dias úteis</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Shield className="mx-auto text-amber-600 mb-2" size={24} />
                <div className="text-sm font-medium text-slate-900">Garantia</div>
                <div className="text-xs text-slate-600">Satisfação 100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Descrição Detalhada</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {product.detailed_description || product.description}
                </p>
                
                {product.tasting_notes && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Notas de Degustação</h4>
                    <p className="text-slate-600">{product.tasting_notes}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Especificações</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tipo:</span>
                    <span className="font-medium">{product.type || 'Café Torrado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Origem:</span>
                    <span className="font-medium">{product.origin || 'Brasil'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Processo:</span>
                    <span className="font-medium">{product.process || 'Natural'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Intensidade:</span>
                    <span className="font-medium">{product.intensity || 4}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Altitude:</span>
                    <span className="font-medium">{product.altitude || '1200m'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                    {relatedProduct.image && relatedProduct.image.match(/^[\u{1F300}-\u{1F9FF}]/u) ? (
                      // Display emoji as large icon
                      <div className="text-6xl">{relatedProduct.image}</div>
                    ) : (
                      // Display regular image
                      <img 
                        src={relatedProduct.image || '/default-coffee.jpg'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">{relatedProduct.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{relatedProduct.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">
                        R$ {relatedProduct.price.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => navigate(`/produto/${relatedProduct.id}`)}
                        className="bg-slate-100 hover:bg-amber-600 hover:text-white p-2 rounded-full transition-all duration-300"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage; 