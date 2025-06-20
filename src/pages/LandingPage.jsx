import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Award, Coffee, Users, TrendingUp, CheckCircle, PlayCircle, Play, Calendar, Heart, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

const LandingPage = () => {
  const featuredProducts = [
    {
      id: 1,
      name: 'Bourbon Amarelo Premium',
      description: 'Notas de chocolate e caramelo',
      origin: 'Montanhas de Minas',
      price: 45.90,
      originalPrice: 52.90,
      rating: 4.8,
      sca: 86
    },
    {
      id: 2,
      name: 'Geisha Especial',
      description: 'Floral e cítrico excepcional',
      origin: 'Fazenda São Benedito',
      price: 89.90,
      originalPrice: 105.90,
      rating: 4.9,
      sca: 92
    },
    {
      id: 3,
      name: 'Blend Signature',
      description: 'Equilíbrio perfeito e cremoso',
      origin: 'Seleção Especial',
      price: 67.90,
      originalPrice: 75.90,
      rating: 4.7,
      sca: 88
    }
  ];

  const stats = [
    { number: '500+', label: 'Clientes Satisfeitos' },
    { number: '50+', label: 'Cafés Especiais' },
    { number: '5', label: 'Anos de Experiência' },
    { number: '95%', label: 'Avaliações 5 Estrelas' }
  ];

  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Certificação SCA',
      description: 'Todos os nossos cafés possuem pontuação SCA acima de 80 pontos'
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Frete Grátis',
      description: 'Entrega gratuita para compras acima de R$ 99 em todo o Brasil'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Compra Segura',
      description: 'Pagamento seguro com garantia de qualidade ou dinheiro de volta'
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: 'Frescor Garantido',
      description: 'Torrefação semanal para garantir máximo frescor e sabor'
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      avatar: "👩‍💼",
      rating: 5,
      comment: "A qualidade dos cafés é excepcional. O sistema de pontos me incentiva a experimentar novos sabores sempre."
    },
    {
      name: "João Santos",
      role: "Chef",
      avatar: "👨‍🍳",
      rating: 5,
      comment: "Como chef, posso dizer que estes são os melhores cafés especiais que já provei. A origem é impecável."
    },
    {
      name: "Ana Costa",
      role: "Barista",
      avatar: "👩‍🎓",
      rating: 5,
      comment: "Trabalho com café há 15 anos e a Mestres do Café tem os grãos mais consistentes e frescos do mercado."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
        <section className="relative bg-brand-light overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-amber-50 to-transparent"></div>
              </div>

          <div className="relative container mx-auto px-4 py-20 lg:py-32 z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge
                variant="outline"
                className="mb-6 bg-brand-brown/10 text-brand-brown hover:bg-brand-brown/20 px-4 py-2 text-sm font-medium border-brand-brown/30"
              >
                <Award className="w-4 h-4 mr-2" />
                Certificação SCA & Torra Artesanal
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark font-serif mb-6 leading-tight">
                  Cafés Especiais
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-brown via-yellow-600 to-amber-700 mt-1 sm:mt-2">
                    Direto do Produtor
                  </span>
                </h1>
                
              <p className="text-lg sm:text-xl md:text-2xl text-brand-dark mb-10 max-w-3xl mx-auto leading-relaxed">
                Descubra sabores únicos dos melhores cafés especiais do Brasil. Nossos grãos possuem{' '}
                <span className="text-brand-brown font-semibold">pontuação SCA acima de 80 pontos</span>, passam por
                torrefação artesanal e chegam frescos até você.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16">
                <Link to="/marketplace">
                  <Button
                    size="lg"
                    className="bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
                  >
                  Explorar Cafés
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/sobre">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-brand-brown text-brand-brown hover:bg-brand-brown/10 hover:text-brand-brown px-8 py-4 text-lg font-semibold bg-white/80 w-full sm:w-auto"
                  >
                    <PlayCircle className="mr-2 w-5 h-5" />
                  Ver Processo
                  </Button>
                </Link>
              </div>

              <div className="relative max-w-xl lg:max-w-2xl mx-auto group">
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-brand-brown/50 to-yellow-600/50 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500 transform group-hover:rotate-3"></div>
                <div className="relative w-full h-80 bg-gradient-to-br from-brand-brown/20 to-amber-200/30 rounded-2xl sm:rounded-3xl shadow-2xl group-hover:shadow-3xl transition-shadow duration-500 flex items-center justify-center">
                  <Coffee className="w-24 h-24 text-brand-brown opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-brand-brown font-serif mb-2">
                    {stat.number}
                  </div>
                  <div className="text-brand-dark text-sm md:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-white to-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">
                Por que escolher nossos cafés?
              </h2>
              <p className="text-lg text-brand-dark max-w-2xl mx-auto">
                Oferecemos uma experiência completa em cafés especiais, do grão à xícara
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-brand-brown/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-brand-brown">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-brand-dark mb-2">{feature.title}</h3>
                  <p className="text-sm text-brand-dark">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">
                Nossos Cafés Especiais
              </h2>
              <p className="text-lg text-brand-dark">
                Conheça nossa seleção premium de cafés especiais
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-brand-brown/20 to-amber-200/30 flex items-center justify-center">
                    <Coffee className="w-16 h-16 text-brand-brown opacity-60" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-brand-brown/10 text-brand-brown text-xs rounded-full font-medium">
                        SCA {product.sca}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-brand-dark ml-1 font-medium">{product.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-serif font-bold text-lg text-brand-dark mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-brand-dark mb-1">{product.description}</p>
                    <p className="text-xs text-brand-brown mb-4">{product.origin}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-brand-brown">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-brand-dark/80 line-through">
                            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                      <Link to={`/produto/${product.id}`}>
                        <button className="px-4 py-2 bg-brand-brown hover:bg-brand-brown/90 text-white text-sm rounded-md transition-colors">
                          Ver Detalhes
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/marketplace">
                <button className="bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-3 font-semibold rounded-md shadow-lg hover:shadow-xl transition-all">
                  Ver Todos os Cafés
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brand-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Pronto para descobrir o seu café especial?
            </h2>
            <p className="text-lg text-brand-light/80 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de amantes do café que já descobriram sabores únicos com a gente
            </p>
            <Link to="/marketplace">
              <button className="bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-4 text-lg font-semibold rounded-md shadow-xl hover:shadow-2xl transition-all">
                Começar Jornada
              </button>
            </Link>
          </div>
        </section>
    </div>
  );
};

export default LandingPage;

