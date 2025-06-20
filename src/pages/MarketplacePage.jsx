import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Coffee, 
  Star, 
  ShoppingCart, 
  Shield,
  Truck,
  Award,
  Package,
  Search, 
  Heart,
  Droplets,
  Zap,
  Thermometer,
  Mail 
} from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [email, setEmail] = useState('');

  // Mock data para os cafés especiais
  const mockProducts = [
    {
      id: 1,
      name: 'Bourbon Amarelo Premium',
      description: 'Café especial com notas de chocolate e caramelo',
      price: 45.90,
      originalPrice: 52.90,
      category: 'premium',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      reviews: 124,
      region: 'Cerrado Mineiro',
      roast: 'Médio',
      process: 'Natural',
      altitude: '1200m',
      badge: 'Mais Vendido',
      sensorial: {
        sweetness: 8,
        acidity: 6,
        intensity: 7
      },
      inStock: true,
      featured: true
    },
    {
      id: 2,
      name: 'Geisha Especial',
      description: 'Café premium com sabor frutado e equilibrado',
      price: 89.90,
      originalPrice: 98.90,
      category: 'premium',
      image: '/api/placeholder/300/200',
      rating: 4.9,
      reviews: 89,
      region: 'Sul de Minas',
      roast: 'Claro',
      process: 'Lavado',
      altitude: '1400m',
      badge: 'Especial',
      sensorial: {
        sweetness: 7,
        acidity: 8,
        intensity: 6
      },
      inStock: true,
      featured: false
    },
    {
      id: 3,
      name: 'Café Mundo Novo',
      description: 'Café tradicional brasileiro com corpo intenso',
      price: 38.90,
      originalPrice: 42.90,
      category: 'tradicional',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviews: 156,
      region: 'Mogiana',
      roast: 'Escuro',
      process: 'Cereja descascado',
      altitude: '1000m',
      badge: 'Tradicional',
      sensorial: {
        sweetness: 6,
        acidity: 5,
        intensity: 9
      },
      inStock: true,
      featured: false
    },
    {
      id: 4,
      name: 'Café Arábica Gourmet',
      description: 'Café gourmet selecionado',
      price: 52.90,
      category: 'gourmet',
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviews: 78,
      region: 'Mantiqueira',
      roast: 'Médio',
      process: 'Natural',
      altitude: '1300m',
      badge: 'Gourmet',
      sensorial: {
        sweetness: 8,
        acidity: 7,
        intensity: 8
      },
      inStock: true,
      featured: false
    },
    {
      id: 5,
      name: 'Café Catuaí Premium',
      description: 'Café premium especial',
      price: 47.90,
      category: 'premium',
      image: '/api/placeholder/300/200',
      rating: 4.6,
      reviews: 95,
      region: 'Cerrado',
      roast: 'Médio',
      process: 'Lavado',
      altitude: '1150m',
      badge: 'Premium',
      sensorial: {
        sweetness: 7,
        acidity: 6,
        intensity: 7
      },
      inStock: true,
      featured: false
    },
    {
      id: 6,
      name: 'Café Blend Especial',
      description: 'Blend especial da casa',
      price: 41.90,
      category: 'especial',
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 112,
      region: 'Minas Gerais',
      roast: 'Médio',
      process: 'Semi-lavado',
      altitude: '1100m',
      badge: 'Blend',
      sensorial: {
        sweetness: 6,
        acidity: 5,
        intensity: 6
      },
      inStock: true,
      featured: false
    }
  ];

  useEffect(() => {
    // Simular loading para testes
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 100);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const SensorAttribute = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center space-x-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-brand-dark">{label}</span>
      <div className="flex space-x-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < value ? color.replace('text-', 'bg-') : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <CardHeader>
        <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-3 bg-gray-200 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-6 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-4 bg-gray-200 animate-pulse rounded" />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-light">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <Coffee className="w-16 h-16 text-brand-brown mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-serif text-brand-dark mb-2">Carregando cafés especiais...</h2>
            <p className="text-brand-dark">Aguarde um momento</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-dark to-brand-brown text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              Cafés <span className="text-brand-light">Especiais</span>
            </h1>
            <p className="text-xl text-brand-light/90 mb-8 max-w-2xl mx-auto">
              Descubra nossa seleção exclusiva de grãos artesanais, torrados com paixão para sua melhor experiência
            </p>
            <Badge variant="secondary" className="bg-brand-brown/20 text-brand-light border-brand-light/20">
              <Coffee className="w-4 h-4 mr-2" />
              Torrado na Hora
            </Badge>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Award className="w-8 h-8 text-brand-brown mx-auto mb-2" />
                <h3 className="font-semibold text-brand-dark">Certificação SCA</h3>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-brand-brown mx-auto mb-2" />
                <h3 className="font-semibold text-brand-dark">Frete Grátis</h3>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-brand-brown mx-auto mb-2" />
                <h3 className="font-semibold text-brand-dark">Compra Segura</h3>
              </div>
              <div className="text-center">
                <Package className="w-8 h-8 text-brand-brown mx-auto mb-2" />
                <h3 className="font-semibold text-brand-dark">Frescor Garantido</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-brand-dark">Produtos</h2>
                <Badge variant="outline" className="text-brand-brown border-brand-brown">
                  {filteredProducts.length} produtos
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-dark/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar cafés..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-brand-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brown/50 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-brand-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brown/50 bg-white"
                >
                  <option value="all">Todos os Cafés (6)</option>
                  <option value="premium">Premium</option>
                  <option value="tradicional">Tradicional</option>
                  <option value="gourmet">Gourmet</option>
                  <option value="especial">Especial</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-brand-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brown/50 bg-white"
                >
                  <option value="name">Ordenar por Nome</option>
                  <option value="price">Ordenar por Preço</option>
                  <option value="rating">Ordenar por Avaliação</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.badge && (
                      <Badge className="absolute top-2 left-2 bg-brand-brown text-white">
                        {product.badge}
                      </Badge>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-brand-dark" />
                    </button>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-brand-dark">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-brand-dark mt-1 font-medium">
                          {product.region} • {product.roast}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-brand-dark/80">
                          ({product.reviews})
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-brand-dark mb-4">
                      {product.description}
                    </p>
                    
                    {/* Atributos Sensoriais */}
                    <div className="space-y-2 mb-4">
                      <SensorAttribute
                        icon={Droplets}
                        label="Doçura"
                        value={product.sensorial.sweetness}
                        color="text-blue-500"
                      />
                      <SensorAttribute
                        icon={Zap}
                        label="Acidez"
                        value={product.sensorial.acidity}
                        color="text-yellow-500"
                      />
                      <SensorAttribute
                        icon={Thermometer}
                        label="Intensidade"
                        value={product.sensorial.intensity}
                        color="text-red-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl font-bold text-brand-brown">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-brand-dark/80 line-through">
                          R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.inStock ? 'Adicionar' : 'Indisponível'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-brand-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-serif mb-4">
              Receba Ofertas Exclusivas
            </h2>
            <p className="text-brand-light/80 mb-8 max-w-2xl mx-auto">
              Seja o primeiro a saber sobre novos cafés, promoções especiais e dicas de preparo
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-brown"
              />
              <Button type="submit" className="bg-brand-brown hover:bg-brand-brown/90 px-6">
                <Mail className="w-4 h-4 mr-2" />
                Inscrever
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
} 