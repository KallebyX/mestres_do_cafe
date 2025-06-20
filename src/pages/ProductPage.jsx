import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Coffee, Package, Truck, Shield, Heart, Share2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    loadProduct();
    loadRelatedProducts();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProduct(data.product);
      } else {
        // Fallback para produto mockado
        const mockProduct = getMockProductById(id);
        setProduct(mockProduct);
      }
    } catch (_error) {
      console.error('Erro ao carregar produto:', _error);
      const mockProduct = getMockProductById(id);
      setProduct(mockProduct);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      
      if (response.ok) {
        const related = data.products?.filter(p => p.id !== id).slice(0, 4) || [];
        setRelatedProducts(related);
      } else {
        const mockProducts = getMockProducts().filter(p => p.id !== id).slice(0, 4);
        setRelatedProducts(mockProducts);
      }
    } catch (_error) { // eslint-disable-line no-unused-vars
      const mockProducts = getMockProducts().filter(p => p.id !== id).slice(0, 4);
      setRelatedProducts(mockProducts);
    }
  };

  const getMockProductById = (productId) => {
    const products = getMockProducts();
    return products.find(p => p.id === productId) || null;
  };

  const getMockProducts = () => [
    {
      id: '1',
      name: 'Café Bourbon Amarelo Premium',
      description: 'Café especial da região do Cerrado Mineiro com notas intensas de chocolate e caramelo. Cultivado em altitude de 1.200 metros, este café passou por um processo de secagem natural que intensifica seus sabores únicos.',
      detailed_description: 'O Café Bourbon Amarelo Premium é uma verdadeira obra-prima da cafeicultura brasileira. Cultivado nas terras férteis do Cerrado Mineiro, em altitudes que variam entre 1.000 e 1.200 metros, este café especial representa o que há de melhor na tradição cafeeira nacional.\n\nAs plantas da variedade Bourbon Amarelo, conhecidas por sua baixa produtividade mas alta qualidade, são cultivadas sob condições climáticas ideais. O processo de secagem natural, realizado em terreiros suspensos, permite que os grãos desenvolvam uma complexidade sensorial excepcional.\n\nCom pontuação SCAA de 86 pontos, este café oferece um perfil sensorial rico e equilibrado, perfeito para os amantes de cafés especiais que buscam uma experiência única a cada xícara.',
      price: 45.90,
      original_price: 52.90,
      origin: 'Cerrado Mineiro, MG',
      roast_level: 'Médio',
      flavor_notes: 'Chocolate, Caramelo, Nozes',
      category: 'especial',
      stock_quantity: 50,
      rating: 4.8,
      reviews_count: 127,
      is_featured: true,
      is_active: true,
      weight: '500g',
      roast_date: '2024-01-15',
      altitude: '1.000-1.200m',
      variety: 'Bourbon Amarelo',
      process: 'Natural',
      scaa_score: 86,
      farm: 'Fazenda São Bento',
      farmer: 'João Carlos Silva',
      harvest_year: '2023',
      certifications: ['UTZ Certified', 'Rainforest Alliance'],
      brewing_methods: ['Espresso', 'Filtrado', 'Prensa Francesa', 'Aeropress'],
      images: [
        '/api/placeholder/600/600',
        '/api/placeholder/600/600',
        '/api/placeholder/600/600'
      ]
    },
    {
      id: '2',
      name: 'Café Geisha Especial',
      description: 'Variedade Geisha cultivada nas montanhas do Sul de Minas com perfil floral único.',
      detailed_description: 'O Café Geisha Especial é considerado uma das variedades mais nobres do mundo. Originária da Etiópia e cultivada com extremo cuidado nas montanhas do Sul de Minas, esta variedade rara oferece uma experiência sensorial incomparável.',
      price: 89.90,
      original_price: 105.90,
      origin: 'Sul de Minas, MG',
      roast_level: 'Claro',
      flavor_notes: 'Floral, Cítrico, Bergamota',
      category: 'premium',
      stock_quantity: 25,
      rating: 4.9,
      reviews_count: 89,
      is_featured: true,
      is_active: true,
      weight: '250g',
      scaa_score: 92,
      images: ['/api/placeholder/600/600']
    },
    {
      id: '3',
      name: 'Café Arábica Torrado Artesanal',
      description: 'Blend exclusivo de grãos selecionados com torra artesanal para um sabor equilibrado.',
      detailed_description: 'Nosso Café Arábica Torrado Artesanal é um blend cuidadosamente elaborado que combina grãos de diferentes regiões para criar uma experiência harmoniosa e equilibrada.',
      price: 32.90,
      original_price: 38.90,
      origin: 'Mogiana, SP',
      roast_level: 'Médio-Escuro',
      flavor_notes: 'Chocolate Amargo, Baunilha',
      category: 'tradicional',
      stock_quantity: 80,
      rating: 4.6,
      reviews_count: 156,
      is_featured: false,
      is_active: true,
      weight: '500g',
      images: ['/api/placeholder/600/600']
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
      reviews_count: 93,
      is_featured: true,
      is_active: true,
      weight: '500g',
      images: ['/api/placeholder/600/600']
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
      reviews_count: 203,
      is_featured: false,
      is_active: true,
      weight: '500g',
      images: ['/api/placeholder/600/600']
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
      reviews_count: 47,
      is_featured: true,
      is_active: true,
      weight: '250g',
      images: ['/api/placeholder/600/600']
    }
  ];

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
        description: product.description,
        weight: product.weight || '500g'
      });
    }
    
    // Feedback visual
    const button = document.querySelector('#add-to-cart-btn');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Adicionado!';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat">
        <Header />
        <main className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-gold mx-auto mb-4"></div>
            <p className="text-coffee-gray text-lg">Carregando produto...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-8">
                <Coffee className="w-12 h-12 text-coffee-gold" />
              </div>
              <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
                Produto não encontrado
              </h1>
              <p className="text-coffee-gray mb-8">
                O produto que você está procurando não foi encontrado.
              </p>
              <Link to="/marketplace" className="btn-primary px-8 py-3">
                ← Voltar ao Marketplace
              </Link>
            </div>
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
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-coffee-gray">
              <Link to="/" className="hover:text-coffee-gold transition-colors">Início</Link>
              <span>/</span>
              <Link to="/marketplace" className="hover:text-coffee-gold transition-colors">Marketplace</Link>
              <span>/</span>
              <span className="text-coffee-intense">{product.name}</span>
            </div>
          </nav>

          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-coffee-gold hover:text-coffee-intense transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              <div className="aspect-square bg-gradient-coffee/10 rounded-lg flex items-center justify-center">
                <Coffee className="w-32 h-32 text-coffee-gold" />
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`aspect-square bg-gradient-coffee/10 rounded-lg flex items-center justify-center transition-all ${
                        activeImageIndex === index ? 'ring-2 ring-coffee-gold' : ''
                      }`}
                    >
                      <Coffee className="w-8 h-8 text-coffee-gold" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              
              {/* Título e Avaliação */}
              <div>
                <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
                  {product.name}
                </h1>
                
                {product.rating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-yellow-600 font-medium ml-2">{product.rating}</span>
                    </div>
                    {product.reviews_count && (
                      <span className="text-coffee-gray">({product.reviews_count} avaliações)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Preços */}
              <div className="flex items-center gap-4">
                <span className="font-cormorant font-bold text-4xl text-coffee-gold">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <div className="flex flex-col">
                    <span className="text-coffee-gray line-through text-lg">
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-green-600 text-sm font-medium">
                      Economize R$ {(product.original_price - product.price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div>
                <p className="text-coffee-gray leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Detalhes Técnicos */}
              <div className="grid grid-cols-2 gap-4 p-6 bg-coffee-cream rounded-lg">
                {product.origin && (
                  <div>
                    <span className="block text-sm text-coffee-gold font-medium">Origem</span>
                    <span className="text-coffee-intense">{product.origin}</span>
                  </div>
                )}
                {product.roast_level && (
                  <div>
                    <span className="block text-sm text-coffee-gold font-medium">Nível de Torra</span>
                    <span className="text-coffee-intense">{product.roast_level}</span>
                  </div>
                )}
                {product.flavor_notes && (
                  <div>
                    <span className="block text-sm text-coffee-gold font-medium">Notas Sensoriais</span>
                    <span className="text-coffee-intense">{product.flavor_notes}</span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="block text-sm text-coffee-gold font-medium">Peso</span>
                    <span className="text-coffee-intense">{product.weight}</span>
                  </div>
                )}
              </div>

              {/* Quantidade e Compra */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-intense mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-coffee-cream border-2 border-coffee-cream rounded-lg flex items-center justify-center hover:border-coffee-gold transition-colors"
                    >
                      <Minus className="w-4 h-4 text-coffee-intense" />
                    </button>
                    <span className="text-xl font-medium text-coffee-intense min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-coffee-cream border-2 border-coffee-cream rounded-lg flex items-center justify-center hover:border-coffee-gold transition-colors"
                    >
                      <Plus className="w-4 h-4 text-coffee-intense" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    id="add-to-cart-btn"
                    onClick={handleAddToCart}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-4"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar ao Carrinho
                  </button>
                  
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center transition-colors ${
                      isFavorite
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-coffee-cream border-coffee-cream text-coffee-gray hover:border-coffee-gold'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="w-14 h-14 bg-coffee-cream border-2 border-coffee-cream rounded-lg flex items-center justify-center text-coffee-gray hover:border-coffee-gold hover:text-coffee-gold transition-colors"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Estoque */}
              {product.stock_quantity && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-coffee-gold" />
                  <span className="text-coffee-gray">
                    {product.stock_quantity > 10 
                      ? 'Em estoque' 
                      : `Apenas ${product.stock_quantity} unidades disponíveis`
                    }
                  </span>
                </div>
              )}

              {/* Garantias */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-coffee-cream">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-coffee-gold" />
                  <div>
                    <p className="text-sm font-medium text-coffee-intense">Frete Grátis</p>
                    <p className="text-xs text-coffee-gray">Acima de R$ 99</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-coffee-gold" />
                  <div>
                    <p className="text-sm font-medium text-coffee-intense">Garantia</p>
                    <p className="text-xs text-coffee-gray">Satisfação total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Coffee className="w-6 h-6 text-coffee-gold" />
                  <div>
                    <p className="text-sm font-medium text-coffee-intense">Freshness</p>
                    <p className="text-xs text-coffee-gray">Torrado na semana</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes Expandidos */}
          {product.detailed_description && (
            <div className="mb-16">
              <div className="card">
                <h2 className="font-cormorant font-bold text-2xl text-coffee-intense mb-6">
                  Sobre este Café
                </h2>
                <div className="prose prose-lg max-w-none text-coffee-gray">
                  {product.detailed_description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                {/* Detalhes Técnicos Expandidos */}
                {(product.scaa_score || product.farm || product.variety) && (
                  <div className="mt-8 pt-8 border-t border-coffee-cream">
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">
                      Especificações Técnicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {product.scaa_score && (
                        <div>
                          <span className="block text-sm text-coffee-gold font-medium">Pontuação SCAA</span>
                          <span className="text-coffee-intense">{product.scaa_score} pontos</span>
                        </div>
                      )}
                      {product.farm && (
                        <div>
                          <span className="block text-sm text-coffee-gold font-medium">Fazenda</span>
                          <span className="text-coffee-intense">{product.farm}</span>
                        </div>
                      )}
                      {product.variety && (
                        <div>
                          <span className="block text-sm text-coffee-gold font-medium">Variedade</span>
                          <span className="text-coffee-intense">{product.variety}</span>
                        </div>
                      )}
                      {product.altitude && (
                        <div>
                          <span className="block text-sm text-coffee-gold font-medium">Altitude</span>
                          <span className="text-coffee-intense">{product.altitude}</span>
                        </div>
                      )}
                      {product.process && (
                        <div>
                          <span className="block text-sm text-coffee-gold font-medium">Processamento</span>
                          <span className="text-coffee-intense">{product.process}</span>
                        </div>
                      )}
                      {product.harvest_year && (
                        <div>
                          <span className="block text-sm text-coffee-gold font-medium">Safra</span>
                          <span className="text-coffee-intense">{product.harvest_year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Produtos Relacionados */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="font-cormorant font-bold text-3xl text-coffee-intense text-center mb-12">
                Produtos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/produto/${relatedProduct.id}`}
                    className="card hover:shadow-gold hover:transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="aspect-square bg-gradient-coffee/10 flex items-center justify-center rounded-t-lg">
                      <Coffee className="w-12 h-12 text-coffee-gold" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-cormorant font-bold text-coffee-intense text-lg mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-coffee-gray text-sm mb-3 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-cormorant font-bold text-xl text-coffee-gold">
                          R$ {relatedProduct.price.toFixed(2).replace('.', ',')}
                        </span>
                        {relatedProduct.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-600 text-sm">{relatedProduct.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
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

export default ProductPage;

