import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Award, Coffee, Users, TrendingUp, CheckCircle, PlayCircle, Play, Calendar, Heart, Trophy } from 'lucide-react';
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

const LandingPage = () => {
  const stats = [
    { number: "1000+", label: "Clientes Satisfeitos" },
    { number: "50+", label: "Variedades Premium" },
    { number: "85+", label: "Pontuação SCA" },
    { number: "5+", label: "Anos de Experiência" }
  ];

  const features = [
    {
      icon: Coffee,
      title: "Cafés Especiais Certificados",
      description: "Seleção rigorosa de grãos com pontuação SCA acima de 80 pontos, garantindo qualidade excepcional em cada xícara."
    },
    {
      icon: Truck,
      title: "Entrega Rápida e Segura",
      description: "Frete grátis para Santa Maria acima de R$ 99. Seus cafés chegam frescos em embalagem premium que preserva o aroma."
    },
    {
      icon: Award,
      title: "Sistema de Gamificação",
      description: "Ganhe pontos a cada compra, evolua de nível e desbloqueie descontos exclusivos de até 25% em nossa linha premium."
    },
    {
      icon: Shield,
      title: "Compra 100% Segura",
      description: "Transações protegidas com SSL, múltiplas formas de pagamento e garantia total de satisfação ou seu dinheiro de volta."
    }
  ];

  const products = [
    {
      id: 1,
      name: "Bourbon Amarelo Premium",
      origin: "Montanhas de Minas",
      price: 45.90,
      rating: 4.8,
      image: "☕",
      badge: "Mais Vendido",
      description: "Notas de chocolate e caramelo"
    },
    {
      id: 2,
      name: "Geisha Especial",
      origin: "Fazenda São Benedito",
      price: 89.90,
      rating: 4.9,
      image: "🌟",
      badge: "Premium",
      description: "Floral e cítrico excepcional"
    },
    {
      id: 3,
      name: "Blend Signature",
      origin: "Seleção Especial",
      price: 39.90,
      rating: 4.7,
      image: "🏆",
      badge: "Novo",
      description: "Equilíbrio perfeito e cremoso"
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
      <Header />
      <main>
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

              <p className="text-lg sm:text-xl md:text-2xl text-brand-dark/80 mb-10 max-w-3xl mx-auto leading-relaxed">
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
                <div className="relative w-full h-auto rounded-2xl sm:rounded-3xl shadow-2xl group-hover:shadow-3xl transition-shadow duration-500 bg-white/10 backdrop-blur-sm border border-brand-brown/20 p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-brand-brown rounded-full flex items-center justify-center">
                      <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-serif text-brand-dark mb-2">Embalagem Premium</h3>
                    <p className="text-brand-dark/70">Frescor e qualidade garantidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-brand-light/70 border-y border-brand-brown/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group p-4 rounded-lg hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${
                        index === 0 || index === 1
                          ? 'from-brand-brown/10 to-brand-brown/20'
                          : 'from-brand-dark/5 to-brand-dark/10'
                      } flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-105 transform`}
                    >
                      {index === 0 && <Users className={`w-8 h-8 ${index === 0 ? 'text-brand-brown' : 'text-brand-dark'} transition-transform group-hover:rotate-6`} />}
                      {index === 1 && <Coffee className={`w-8 h-8 ${index === 1 ? 'text-brand-brown' : 'text-brand-dark'} transition-transform group-hover:rotate-6`} />}
                      {index === 2 && <Award className={`w-8 h-8 ${index === 2 ? 'text-brand-dark' : 'text-brand-dark'} transition-transform group-hover:rotate-6`} />}
                      {index === 3 && <Calendar className={`w-8 h-8 ${index === 3 ? 'text-brand-brown' : 'text-brand-dark'} transition-transform group-hover:rotate-6`} />}
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-brand-dark font-serif mb-1.5">{stat.number}</div>
                  <div className="text-sm md:text-base text-brand-dark/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rating Section */}
        <section className="py-16 bg-gradient-to-r from-brand-light to-amber-50/30">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-xl border border-brand-brown/10">
              <div className="w-16 h-16 mx-auto mb-5 bg-brand-brown rounded-full flex items-center justify-center shadow-lg">
                <Coffee className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-brand-dark/90 mb-2">Avaliação dos Nossos Clientes</h3>

              <div className="flex justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star className={`w-7 h-7 ${i < 4 || (i === 4 && Math.random() > 0.5) ? 'text-brand-brown' : 'text-gray-300'}`} key={i} />
                ))}
              </div>

              <div className="text-4xl font-bold text-brand-dark font-serif mb-1">
                4.9<span className="text-2xl text-brand-dark/70">/5</span>
              </div>
              <p className="text-sm text-brand-dark/70">Baseado em mais de 500 avaliações verificadas.</p>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-16 md:py-20 bg-brand-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif mb-4">
                Por Que Escolher os Mestres do Café?
              </h2>
              <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto">
                Há mais de {new Date().getFullYear() - 2019} anos conectando você aos melhores cafés especiais do Brasil,
                com paixão e expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white hover:bg-amber-50/30 border border-brand-brown/10 hover:border-brand-brown/20 transition-all duration-300 group hover:shadow-lg"
                >
                  <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 rounded-2xl flex items-center justify-center group-hover:from-brand-brown/20 group-hover:to-brand-brown/30 transition-all duration-300 transform group-hover:scale-105">
                    <feature.icon className="w-8 h-8 text-brand-brown" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-dark mb-2 font-serif">{feature.title}</h3>
                  <p className="text-brand-dark/70 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/sobre">
                <Button
                  size="lg"
                  className="bg-brand-brown hover:bg-brand-brown/90 text-white px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Conhecer Nossa História
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Gamification Teaser Section */}
        <section className="py-16 md:py-24 bg-brand-light border-t border-brand-brown/10">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-brand-dark via-gray-800 to-slate-900 text-white p-8 md:p-12 rounded-xl shadow-2xl flex flex-col lg:flex-row items-center justify-between overflow-hidden relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-brown/20 rounded-full filter blur-2xl opacity-50"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/20 rounded-full filter blur-2xl opacity-50"></div>

              <div className="lg:w-2/3 mb-8 lg:mb-0 text-center lg:text-left relative z-10">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <Award className="w-10 h-10 text-brand-brown mr-3 flex-shrink-0" />
                  <h2 className="text-3xl md:text-4xl font-bold font-serif">Entre para o Clube dos Mestres!</h2>
                </div>
                <p className="text-lg md:text-xl text-brand-light/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Sua paixão por café agora vale recompensas! Acumule pontos, ganhe descontos exclusivos, acesso antecipado
                  a produtos e muito mais. Desbloqueie um universo de vantagens.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/gamificacao">
                    <Button
                      size="lg"
                      className="bg-brand-brown hover:bg-opacity-80 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                    >
                      <Trophy className="mr-2 w-5 h-5" />
                      Conheça o Programa
                    </Button>
                  </Link>
                  <Link to="/registro">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-brand-light text-brand-light hover:bg-brand-light hover:text-brand-dark transition-all duration-200 px-8 py-3 text-lg font-semibold bg-transparent w-full sm:w-auto"
                    >
                      Criar Conta Agora
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/3 flex justify-center lg:justify-end relative z-10 mt-8 lg:mt-0">
                <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-brand-brown/20 to-yellow-500/20 rounded-lg shadow-xl flex items-center justify-center transform lg:rotate-6 hover:rotate-0 transition-transform duration-300">
                  <Trophy className="w-24 h-24 text-brand-brown" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;

