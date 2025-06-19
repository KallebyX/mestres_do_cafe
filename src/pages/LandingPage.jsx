import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Award, Coffee, Users, TrendingUp, CheckCircle, PlayCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,69,19,0.03),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-2">
                <Star className="w-4 h-4 text-amber-600 fill-current" />
                <span className="text-amber-800 font-medium text-sm">Certificação SCA</span>
              </div>

              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Cafés Especiais
                  <span className="block text-amber-600">
                    Direto do Produtor
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                  Descubra sabores únicos dos melhores cafés especiais do Brasil. 
                  Pontuação SCA acima de 80 pontos, torrefação artesanal e entrega garantida.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/marketplace"
                  className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Coffee className="w-5 h-5" />
                  Explorar Cafés
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button className="group inline-flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-amber-600 text-slate-700 hover:text-amber-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300">
                  <PlayCircle className="w-5 h-5" />
                  Ver Processo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-slate-200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 rounded-3xl"></div>
                
                {/* Coffee Cup Visual */}
                <div className="relative text-center">
                  <div className="text-8xl lg:text-9xl mb-4">☕</div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 font-medium">Avaliação dos Clientes</p>
                    <p className="text-2xl font-bold text-slate-900">4.9/5</p>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">Certificado SCA</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-slate-700">Entrega Grátis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-24">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6">
              <CheckCircle className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-medium text-sm">Por que Escolher os Mestres</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Qualidade em Cada Detalhe
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Mais de 5 anos dedicados à perfeição do café especial, com processo artesanal 
              e tecnologia de ponta para garantir a melhor experiência.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-10 h-10 text-amber-600" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Coffee className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700 font-medium text-sm">Cafés Premium</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Nossos Cafés Especiais
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Seleção exclusiva dos melhores grãos, torrefação artesanal e qualidade certificada SCA
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {products.map((product, index) => (
              <div key={product.id} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Badge */}
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-600">{product.rating}</span>
                  </div>
                </div>

                {/* Product Visual */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{product.image}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                  <p className="text-slate-600 text-sm mb-2">{product.origin}</p>
                  <p className="text-slate-500 text-sm">{product.description}</p>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="text-2xl font-bold text-slate-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </div>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300">
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <div className="text-center">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Ver Todos os Cafés
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-medium text-sm">Depoimentos</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              O Que Nossos Clientes Dizem
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(245,158,11,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Cadastre-se Agora</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              Comece Sua Jornada no
              <span className="block text-amber-400">Mundo dos Cafés Especiais</span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Ganhe 100 pontos de boas-vindas, acesse descontos exclusivos e descubra 
              sabores únicos que vão transformar seu momento café.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/registro"
                className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Star className="w-5 h-5" />
                Criar Conta Grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-amber-400 text-white hover:text-amber-400 font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
              >
                Explorar Sem Cadastro
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

