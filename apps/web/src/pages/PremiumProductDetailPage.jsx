import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Heart, Share2, ShoppingCart, Plus, Minus, Eye, ZoomIn,
  Truck, Shield, Award, Coffee, MapPin, ThermometerSun, Clock,
  CheckCircle, AlertCircle, Package, Calculator, ArrowLeft,
  Facebook, Twitter, Instagram, MessageCircle, Copy, Download
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { products as productsAPI } from '../services/api';

const PremiumProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Estados principais
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de interação
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Estados de funcionalidades
  const [shippingCEP, setShippingCEP] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  // Produto exemplo - dados detalhados
  const sampleProduct = {
    id: 1,
    name: "Café Especial Bourbon Amarelo",
    description: "Um café excepcional cultivado nas montanhas de Minas Gerais, com notas florais e frutadas que despertam os sentidos.",
    detailed_description: `Este extraordinário Bourbon Amarelo é resultado de uma tradição familiar de três gerações na produção de cafés especiais. Cultivado em altitude superior a 1.200 metros, em solo vulcânico rico em minerais, cada grão é cuidadosamente selecionado à mão para garantir a máxima qualidade.

    Nossa família de produtores dedica especial atenção ao processo de fermentação natural, que ocorre durante 72 horas em tanques de aço inoxidável, desenvolvendo os complexos sabores que tornam este café único. O processo de secagem é feito em terreiros suspensos, protegidos do excesso de umidade e permitindo uma secagem uniforme que preserva todas as características sensoriais.`,
    price: 85.90,
    original_price: 98.90,
    weight: 250,
    origin: "Cerrado Mineiro - MG, Brasil",
    altitude: "1.200m",
    variety: "Bourbon Amarelo",
    process: "Natural Fermentado",
    roast_level: "Médio",
    harvest_year: 2024,
    sca_score: 87,
    category: "Café Especial",
    stock_quantity: 45,
    is_featured: true,
    is_in_stock: true,
    rating: 4.8,
    reviews_count: 142,
    
    // Imagens
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800"
    ],

    // Notas de degustação
    tasting_notes: {
      aroma: ["Floral", "Caramelo", "Chocolate"],
      flavor: ["Frutas Vermelhas", "Mel", "Amêndoas"],
      body: "Médio",
      acidity: "Média-Alta",
      sweetness: "Alta",
      finish: "Longo e Doce"
    },

    // Especificações técnicas
    specifications: {
      producer: "Fazenda Serra do Caparaó",
      region: "Cerrado Mineiro",
      municipality: "Patrocínio - MG",
      farm_size: "120 hectares",
      processing_method: "Natural Fermentado",
      drying_method: "Terreiro Suspenso",
      storage: "Grãos em pergaminho",
      certifications: ["Rainforest Alliance", "UTZ", "Fair Trade"],
      cupping_notes: "Doçura acentuada, acidez cítrica equilibrada, corpo aveludado"
    },

    // Métodos de preparo sugeridos
    brewing_methods: [
      {
        method: "V60",
        ratio: "1:15",
        grind: "Média-fina",
        water_temp: "92-96°C",
        time: "2:30-3:00",
        description: "Realça as notas frutadas e a acidez brilhante"
      },
      {
        method: "French Press",
        ratio: "1:12",
        grind: "Grossa",
        water_temp: "90-94°C", 
        time: "4:00",
        description: "Corpo mais intenso e sabores amadeirados"
      },
      {
        method: "Espresso",
        ratio: "1:2",
        grind: "Fina",
        water_temp: "90-92°C",
        time: "25-30s",
        description: "Cremosidade excepcional com notas de chocolate"
      }
    ],

    // Opções de peso
    weight_options: [
      { size: "250g", price: 85.90, popular: true },
      { size: "500g", price: 159.90, discount: 7 },
      { size: "1kg", price: 299.90, discount: 12 }
    ],

    // Garantias
    guarantees: [
      "Satisfação 100% garantida ou seu dinheiro de volta",
      "Café torrado sob encomenda para máxima frescura",
      "Embalagem com válvula desgaseificadora",
      "Frete grátis para compras acima de R$ 150"
    ]
  };

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      // Por enquanto usar dados de exemplo
      setProduct(sampleProduct);
      await loadRelatedProducts();
      await loadReviews();
    } catch (err) {
      setError('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    // Simular produtos relacionados
    setRelatedProducts([
      { id: 2, name: "Café Catuaí Vermelho", price: 76.90, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", rating: 4.6 },
      { id: 3, name: "Café Geisha Natural", price: 156.90, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400", rating: 4.9 },
      { id: 4, name: "Café Mundo Novo", price: 68.90, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400", rating: 4.5 }
    ]);
  };

  const loadReviews = async () => {
    // Simular avaliações
    setReviews([
      {
        id: 1,
        user: "Maria Santos",
        rating: 5,
        title: "Café excepcional!",
        comment: "Sabor incrível, doçura natural e aroma que enche toda a casa. Compro sempre!",
        date: "2024-01-15",
        verified: true
      },
      {
        id: 2,
        user: "João Silva",
        rating: 5,
        title: "Melhor café que já tomei",
        comment: "Notas frutadas muito marcantes. Perfeito para V60. Recomendo!",
        date: "2024-01-10",
        verified: true
      }
    ]);
  };

  const calculateShipping = async () => {
    if (!shippingCEP || shippingCEP.length < 8) return;
    
    setShippingLoading(true);
    try {
      // Simular cálculo de frete
      setTimeout(() => {
        setShippingOptions([
          { name: "PAC", price: 15.90, days: "5-7 dias úteis", company: "Correios" },
          { name: "SEDEX", price: 28.90, days: "1-2 dias úteis", company: "Correios" },
          { name: "Transportadora", price: 22.50, days: "3-5 dias úteis", company: "Jadlog" }
        ]);
        setShippingLoading(false);
      }, 1500);
    } catch (error) {
      setShippingLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product, quantity);
      if (result.success) {
        alert(`${quantity}x ${product.name} adicionado ao carrinho!`);
      }
    } catch (error) {
      alert('Erro ao adicionar produto ao carrinho');
    }
  };

  const shareProduct = (platform) => {
    const url = window.location.href;
    const text = `Confira este café especial: ${product.name}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
        break;
    }
    setShowShareModal(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDiscountPercentage = (original, current) => {
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Carregando Produto...</h2>
          <p className="text-slate-600">Preparando uma experiência especial</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
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
    );
  }

  const discount = getDiscountPercentage(product.original_price, product.price);
  const currentWeightOption = product.weight_options.find(w => w.size === selectedWeight) || product.weight_options[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-slate-600">
            <button onClick={() => navigate('/')} className="hover:text-amber-600">Início</button>
            <span>/</span>
            <button onClick={() => navigate('/marketplace')} className="hover:text-amber-600">Marketplace</button>
            <span>/</span>
            <span className="text-slate-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            {/* Imagem Principal com Zoom */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-xl group">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.is_featured && (
                  <span className="bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                    ⭐ Especial
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
                {product.sca_score >= 85 && (
                  <span className="bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                    SCA {product.sca_score}
                  </span>
                )}
              </div>

              {/* Ações */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isFavorite 
                      ? 'bg-red-500 text-white scale-110' 
                      : 'bg-white/90 text-slate-600 hover:bg-white hover:scale-105'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-12 h-12 rounded-full bg-white/90 text-slate-600 hover:bg-white hover:scale-105 flex items-center justify-center transition-all"
                >
                  <Share2 className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="w-12 h-12 rounded-full bg-white/90 text-slate-600 hover:bg-white hover:scale-105 flex items-center justify-center transition-all"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
              </div>

              {/* Indicador de Zoom */}
              {isZoomed && (
                <div className="absolute bottom-6 left-6 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  Clique para sair do zoom
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                    currentImageIndex === index 
                      ? 'border-amber-500 ring-2 ring-amber-200' 
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

            {/* Certificações */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Certificações e Garantias
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {product.specifications.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-slate-700">{cert}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                {product.guarantees.map((guarantee, index) => (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{guarantee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  SCA {product.sca_score}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
              <p className="text-xl text-slate-600 mb-6">{product.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-slate-900">{product.rating}</span>
                </div>
                <span className="text-slate-600">({product.reviews_count} avaliações)</span>
              </div>

              {/* Especificações Rápidas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-700">{product.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-700">Torra {product.roast_level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-700">{product.variety}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-700">{product.process}</span>
                </div>
              </div>
            </div>

            {/* Preço e Compra */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-100">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  {formatPrice(currentWeightOption.price)}
                </span>
                {discount > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xl text-slate-500 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <span className="text-sm text-red-600 font-medium">
                      Economize {formatPrice(product.original_price - currentWeightOption.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Seletor de Peso */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Escolha o tamanho
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.weight_options.map((option) => (
                    <button
                      key={option.size}
                      onClick={() => setSelectedWeight(option.size)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedWeight === option.size
                          ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-200'
                          : 'border-slate-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="text-lg font-bold text-slate-900">{option.size}</div>
                      <div className="text-sm text-slate-600">{formatPrice(option.price)}</div>
                      {option.popular && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}
                      {option.discount && (
                        <div className="text-xs text-emerald-600 font-medium">
                          -{option.discount}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor de Quantidade */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Quantidade
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-slate-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="p-3 hover:bg-slate-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-slate-600">
                    Total: {formatPrice(currentWeightOption.price * quantity)}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_in_stock}
                  className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                    product.is_in_stock
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.is_in_stock ? `Adicionar ${quantity}x ao Carrinho` : 'Produto Esgotado'}
                </button>

                {product.is_in_stock && (
                  <button
                    onClick={() => navigate('/checkout', { state: { product, quantity } })}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
                  >
                    Comprar Agora
                  </button>
                )}
              </div>

              {/* Indicador de Estoque */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Estoque disponível</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {product.stock_quantity} unidades
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (product.stock_quantity / 50) * 100)}%` }}
                  ></div>
                </div>
                {product.stock_quantity <= 10 && (
                  <p className="text-sm text-amber-600 mt-2 font-medium">
                    ⚠️ Últimas unidades disponíveis!
                  </p>
                )}
              </div>
            </div>

            {/* Calculadora de Frete */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                Calcular Frete
              </h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Digite seu CEP"
                  value={shippingCEP}
                  onChange={(e) => setShippingCEP(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={calculateShipping}
                  disabled={shippingLoading || shippingCEP.length < 8}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  {shippingLoading ? 'Calculando...' : 'Calcular'}
                </button>
              </div>

              {shippingOptions.length > 0 && (
                <div className="mt-4 space-y-3">
                  {shippingOptions.map((option, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <div className="font-semibold text-slate-900">{option.name}</div>
                        <div className="text-sm text-slate-600">{option.company} • {option.days}</div>
                      </div>
                      <div className="font-bold text-slate-900">{formatPrice(option.price)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de Informações Detalhadas */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200">
            {[
              { id: 'description', label: 'Descrição', icon: Coffee },
              { id: 'tasting', label: 'Degustação', icon: Star },
              { id: 'brewing', label: 'Preparo', icon: ThermometerSun },
              { id: 'specs', label: 'Especificações', icon: Award },
              { id: 'reviews', label: 'Avaliações', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-t-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-600 border-b-2 border-amber-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das Tabs */}
          <div className="min-h-[400px]">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">Sobre este Café</h3>
                <div className="prose prose-lg max-w-none text-slate-700">
                  {product.detailed_description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">{paragraph.trim()}</p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tasting' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">Notas de Degustação</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Aroma</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tasting_notes.aroma.map((note, index) => (
                          <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Sabor</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tasting_notes.flavor.map((note, index) => (
                          <span key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Corpo</span>
                      <span className="text-slate-700">{product.tasting_notes.body}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Acidez</span>
                      <span className="text-slate-700">{product.tasting_notes.acidity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Doçura</span>
                      <span className="text-slate-700">{product.tasting_notes.sweetness}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Finalização</span>
                      <span className="text-slate-700">{product.tasting_notes.finish}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'brewing' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">Métodos de Preparo Recomendados</h3>
                
                <div className="grid gap-6">
                  {product.brewing_methods.map((method, index) => (
                    <div key={index} className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-slate-900 mb-4">{method.method}</h4>
                      <p className="text-slate-700 mb-4">{method.description}</p>
                      
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Proporção</span>
                          <div className="text-lg font-bold text-amber-600">{method.ratio}</div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Moagem</span>
                          <div className="text-lg font-bold text-amber-600">{method.grind}</div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Temperatura</span>
                          <div className="text-lg font-bold text-amber-600">{method.water_temp}</div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Tempo</span>
                          <div className="text-lg font-bold text-amber-600">{method.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">Especificações Técnicas</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start">
                        <span className="font-semibold text-slate-900 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-slate-700 text-right max-w-xs">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Notas de Cupping</h4>
                    <p className="text-slate-700 leading-relaxed">
                      {product.specifications.cupping_notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-slate-900">Avaliações dos Clientes</h3>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors">
                    Escrever Avaliação
                  </button>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-slate-50 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-900">{review.user}</span>
                            {review.verified && (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-slate-600">
                          {new Date(review.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <h5 className="font-semibold text-slate-900 mb-2">{review.title}</h5>
                      <p className="text-slate-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${i < Math.floor(relatedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-slate-600">({relatedProduct.rating})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      <button 
                        onClick={() => navigate(`/produto/${relatedProduct.id}`)}
                        className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full transition-colors"
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

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Compartilhar Produto</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => shareProduct('whatsapp')}
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-800">WhatsApp</span>
              </button>
              <button
                onClick={() => shareProduct('facebook')}
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <Facebook className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-blue-800">Facebook</span>
              </button>
              <button
                onClick={() => shareProduct('twitter')}
                className="flex items-center gap-3 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
              >
                <Twitter className="w-6 h-6 text-sky-600" />
                <span className="font-medium text-sky-800">Twitter</span>
              </button>
              <button
                onClick={() => shareProduct('copy')}
                className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Copy className="w-6 h-6 text-slate-600" />
                <span className="font-medium text-slate-800">Copiar Link</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-6 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumProductDetailPage;