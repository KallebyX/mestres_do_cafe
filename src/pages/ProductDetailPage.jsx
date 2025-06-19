import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, ShoppingCart, Heart, Share2, Minus, Plus, Coffee, 
  Award, Truck, Shield, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Mock products data (same as MarketplacePage)
  const mockProducts = [
    {
      id: 1,
      name: "Bourbon Amarelo Premium",
      description: "Notas de chocolate e caramelo, corpo encorpado com acidez equilibrada.",
      detailed_description: "O Café Bourbon Amarelo Premium é uma verdadeira obra-prima da cafeicultura brasileira. Cultivado nas terras férteis das Montanhas de Minas, em altitudes que variam entre 1.000 e 1.200 metros, este café especial representa o que há de melhor na tradição cafeeira nacional. As plantas da variedade Bourbon Amarelo, conhecidas por sua baixa produtividade mas alta qualidade, são cultivadas sob condições climáticas ideais. O processo de secagem natural, realizado em terreiros suspensos, permite que os grãos desenvolvam uma complexidade sensorial excepcional. Com pontuação SCAA de 85 pontos, este café oferece um perfil sensorial rico e equilibrado, perfeito para os amantes de cafés especiais que buscam uma experiência única a cada xícara.",
      price: 45.90,
      originalPrice: 52.90,
      category: "especiais",
      rating: 4.8,
      reviews: 127,
      reviews_count: 127,
      image: "☕",
      images: ["☕", "☕", "☕"],
      badge: "Mais Vendido",
      origin: "Montanhas de Minas",
      altitude: "1200m",
      process: "Natural",
      roast: "Médio",
      score: 85,
      inStock: true,
      discount: 13,
      intensity: 4,
      type: "Café Especial",
      tasting_notes: "Chocolate, caramelo, nozes e frutas secas com final prolongado e doce."
    },
    {
      id: 2,
      name: "Geisha Especial",
      description: "Perfil floral e cítrico excepcional, uma experiência única.",
      detailed_description: "O Café Geisha Especial é considerado uma das variedades mais nobres do mundo. Originária da Etiópia e cultivada com extremo cuidado na Fazenda São Benedito, esta variedade rara oferece uma experiência sensorial incomparável. Com pontuação SCAA de 92 pontos, este café apresenta características únicas que o tornam verdadeiramente especial.",
      price: 89.90,
      originalPrice: 89.90,
      category: "premium",
      rating: 4.9,
      reviews: 89,
      reviews_count: 89,
      image: "🌟",
      images: ["🌟", "🌟"],
      badge: "Premium",
      origin: "Fazenda São Benedito",
      altitude: "1400m",
      process: "Lavado",
      roast: "Claro",
      score: 92,
      inStock: true,
      discount: 0,
      intensity: 3,
      type: "Café Premium",
      tasting_notes: "Floral, cítrico, bergamota e notas de chá branco com acidez brilhante."
    },
    {
      id: 3,
      name: "Blend Signature",
      description: "Equilíbrio perfeito entre doçura natural e corpo cremoso.",
      detailed_description: "Nosso Blend Signature é uma composição cuidadosamente elaborada que combina grãos de diferentes regiões para criar uma experiência harmoniosa e equilibrada. Este blend especial foi desenvolvido pelos nossos mestres torradores para oferecer consistência e qualidade em cada xícara.",
      price: 39.90,
      originalPrice: 44.90,
      category: "blends",
      rating: 4.7,
      reviews: 203,
      reviews_count: 203,
      image: "🏆",
      images: ["🏆"],
      badge: "Novo",
      origin: "Seleção Especial",
      altitude: "1000-1300m",
      process: "Semi-lavado",
      roast: "Médio-escuro",
      score: 82,
      inStock: true,
      discount: 11,
      intensity: 4,
      type: "Blend Especial",
      tasting_notes: "Chocolate ao leite, caramelo e nozes com corpo cremoso e doçura natural."
    },
    {
      id: 4,
      name: "Catuaí Vermelho",
      description: "Doce natural com notas de frutas vermelhas e chocolate ao leite.",
      detailed_description: "O Catuaí Vermelho é uma variedade brasileira desenvolvida especificamente para nossas condições climáticas. Cultivado no Cerrado Mineiro, este café oferece características únicas de doçura natural e complexidade aromática que o tornam especial.",
      price: 42.90,
      originalPrice: 42.90,
      category: "especiais",
      rating: 4.6,
      reviews: 156,
      reviews_count: 156,
      image: "🔴",
      images: ["🔴"],
      badge: "Certificado",
      origin: "Cerrado Mineiro",
      altitude: "1100m",
      process: "Pulped Natural",
      roast: "Médio",
      score: 84,
      inStock: true,
      discount: 0,
      intensity: 4,
      type: "Café Especial",
      tasting_notes: "Frutas vermelhas, chocolate ao leite e mel com acidez suave."
    },
    {
      id: 5,
      name: "Décaféinado Especial",
      description: "Todo sabor sem cafeína. Processo Swiss Water preserva aromas.",
      detailed_description: "Nosso Décaféinado Especial utiliza o processo Swiss Water, que remove 99,9% da cafeína preservando todas as características sensoriais do café. É a escolha perfeita para quem quer desfrutar de um excelente café a qualquer hora do dia.",
      price: 48.90,
      originalPrice: 55.90,
      category: "decaf",
      rating: 4.4,
      reviews: 78,
      reviews_count: 78,
      image: "🌙",
      images: ["🌙"],
      badge: "Sem Cafeína",
      origin: "Sul de Minas",
      altitude: "1200m",
      process: "Swiss Water",
      roast: "Médio",
      score: 81,
      inStock: true,
      discount: 12,
      intensity: 3,
      type: "Café Descafeinado",
      tasting_notes: "Chocolate, caramelo e nozes com corpo suave e zero cafeína."
    },
    {
      id: 6,
      name: "Expresso Premium",
      description: "Blend especial para expresso, crema densa e sabor intenso.",
      detailed_description: "Desenvolvido especificamente para extrações espresso, este blend oferece a combinação perfeita de corpo, crema e intensidade. Ideal para cappuccinos, lattes e outras bebidas à base de espresso.",
      price: 36.90,
      originalPrice: 41.90,
      category: "blends",
      rating: 4.8,
      reviews: 312,
      reviews_count: 312,
      image: "⚡",
      images: ["⚡"],
      badge: "Para Expresso",
      origin: "Blend Especial",
      altitude: "900-1200m",
      process: "Misto",
      roast: "Escuro",
      score: 83,
      inStock: false,
      discount: 12,
      intensity: 5,
      type: "Blend Espresso",
      tasting_notes: "Chocolate amargo, caramelo queimado e nozes com crema densa."
    }
  ];

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsAPI.getById(id);
      
      if (response.success) {
        setProduct(response.product);
        await loadRelatedProducts(response.product.category);
      } else {
        // Fallback para dados mock
        const mockProduct = mockProducts.find(p => p.id === parseInt(id));
        if (mockProduct) {
          setProduct(mockProduct);
          await loadRelatedProducts(mockProduct.category);
        } else {
          setError('Produto não encontrado');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar produto via API, usando dados mock:', err);
      // Fallback para dados mock
      const mockProduct = mockProducts.find(p => p.id === parseInt(id));
      if (mockProduct) {
        setProduct(mockProduct);
        await loadRelatedProducts(mockProduct.category);
      } else {
        setError('Produto não encontrado');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (category) => {
    try {
      const response = await productsAPI.getAll();
      if (response.success) {
        const related = response.products
          .filter(p => p.id !== parseInt(id) && p.category === category)
          .slice(0, 4);
        setRelatedProducts(related);
      } else {
        // Fallback para dados mock
        const related = mockProducts
          .filter(p => p.id !== parseInt(id) && p.category === category)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos relacionados via API, usando dados mock:', err);
      // Fallback para dados mock
      const related = mockProducts
        .filter(p => p.id !== parseInt(id) && p.category === category)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      weight: selectedWeight,
      quantity: quantity,
      image: product.image || '/default-coffee.jpg'
    });

    // Feedback visual
    const button = document.querySelector('.add-to-cart-btn');
    if (button) {
      button.textContent = 'Adicionado!';
      button.classList.add('bg-green-600');
      setTimeout(() => {
        button.textContent = 'Adicionar ao Carrinho';
        button.classList.remove('bg-green-600');
      }, 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-inter">
        <Header />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-lg">Carregando produto...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 font-inter">
        <Header />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Coffee className="mx-auto text-slate-400 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Produto não encontrado</h2>
                <p className="text-slate-600 mb-6">{error}</p>
                <button 
                  onClick={() => navigate('/marketplace')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Voltar ao Marketplace
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Header />
      
      <main className="pt-20 pb-16">
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
              <div className="aspect-square bg-white rounded-3xl shadow-lg overflow-hidden relative group flex items-center justify-center">
                {product.image && product.image.match(/^[\u{1F300}-\u{1F9FF}]/u) ? (
                  // Display emoji as large icon
                  <div className="text-9xl">{product.image}</div>
                ) : (
                  // Display regular image
                  <img 
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                
                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Favorite & Share */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full shadow-lg transition-all duration-300 ${
                      isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 hover:bg-white text-slate-600'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-4 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 bg-white flex items-center justify-center ${
                        index === currentImageIndex ? 'border-amber-600' : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {image && image.match(/^[\u{1F300}-\u{1F9FF}]/u) ? (
                        // Display emoji
                        <div className="text-2xl">{image}</div>
                      ) : (
                        // Display regular image
                        <img 
                          src={image} 
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
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
                  className="add-to-cart-btn w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>Adicionar ao Carrinho</span>
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
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage; 