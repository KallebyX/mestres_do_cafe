import React from 'react';
import { 
  Coffee, 
  Award, 
  Users, 
  MapPin, 
  Target, 
  Heart, 
  Leaf,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  Instagram,
  ShoppingCart,
  Briefcase,
  GraduationCap,
  Gift,
  Palette,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StickyCTA from '../components/StickyCTA';
import ProductCard from '../components/ProductCard';
import ServiceCard from '../components/ServiceCard';
import AboutPageSEO from '../components/AboutPageSEO';

const AboutPage = () => {
  // Dados dos produtos premium
  const premiumProducts = [
    {
      name: "Catuai Amarelo 86+",
      score: "86+",
      origin: "Alta Mogiana/SP",
      profile: {
        body: "cítrico",
        acidity: "alta",
        sweetness: "média",
        intensity: "moderada"
      },
      notes: ["frutas tropicais", "caramelo", "retrogosto prolongado"],
      sizes: ["100g", "250g", "500g", "1kg"]
    },
    {
      name: "Arara 84+",
      score: "84+",
      origin: "Serra do Caparaó",
      profile: {
        body: "sedoso",
        acidity: "média",
        sweetness: "alta",
        intensity: "suave"
      },
      notes: ["chocolate", "avelã", "final adocicado"],
      sizes: ["100g", "250g", "500g", "1kg"]
    },
    {
      name: "Bourbon Amarelo 82+",
      score: "82+",
      origin: "Alta Mogiana/SP",
      profile: {
        body: "encorpado",
        acidity: "média",
        sweetness: "alta",
        intensity: "forte"
      },
      notes: ["caramelo", "baunilha", "final cremoso"],
      sizes: ["100g", "250g", "500g", "1kg"]
    },
    {
      name: "Catucaí Amarelo 87+",
      score: "87+",
      origin: "Serra do Caparaó",
      profile: {
        body: "equilibrado",
        acidity: "brilhante",
        sweetness: "alta",
        intensity: "moderada"
      },
      notes: ["floral", "frutas vermelhas", "final limpo"],
      sizes: ["100g", "250g", "500g", "1kg"]
    },
    {
      name: "Catuai Vermelho 85+",
      score: "85+",
      origin: "Alta Mogiana/SP",
      profile: {
        body: "encorpado",
        acidity: "média",
        sweetness: "alta",
        intensity: "forte"
      },
      notes: ["chocolate amargo", "especiarias", "final persistente"],
      sizes: ["100g", "250g", "500g", "1kg"]
    }
  ];

  // Serviços B2B
  const b2bServices = [
    {
      icon: GraduationCap,
      title: "Consultoria em Métodos de Preparo",
      description: "Especialistas certificados SCA para treinar sua equipe e otimizar processos de preparo.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Palette,
      title: "White Label",
      description: "Seu café, sua identidade. Desenvolvemos blends exclusivos e embalagem com sua marca.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Workshops",
      description: "Capacitação prática para baristas e equipes de café com certificação SCA.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Target,
      title: "Treinamentos Especializados",
      description: "Programas customizados para diferentes níveis de conhecimento e necessidades do negócio.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: Gift,
      title: "Kits de Presentes e Brindes",
      description: "Soluções personalizadas para eventos corporativos, clientes VIP e ações de marketing.",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  // Depoimentos (mock)
  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "Proprietário - Café Aroma",
      content: "A Mestres do Café transformou nosso negócio. A qualidade dos grãos e o suporte técnico são excepcionais.",
      rating: 5
    },
    {
      name: "Ana Paula Silva",
      role: "Gerente - Hotel Premium",
      content: "Nossos hóspedes adoram o café servido no café da manhã. A consistência da qualidade é impressionante.",
      rating: 5
    },
    {
      name: "Roberto Costa",
      role: "Diretor - Empresa Tech",
      content: "O white label foi perfeito para nossa marca. Profissionalismo e qualidade em todos os detalhes.",
      rating: 5
    }
  ];

  // Função para abrir WhatsApp
  const openWhatsApp = () => {
    const message = "Olá! Gostaria de saber mais sobre os serviços B2B da Mestres do Café.";
    const whatsappUrl = `https://wa.me/55996458600?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Função para abrir e-commerce
  const openEcommerce = () => {
    window.open('/marketplace', '_blank');
  };

  return (
    <>
      <AboutPageSEO />
      <div className="min-h-screen bg-white">
        {/* Hero Section - "Quem Somos" */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Badge SCAA */}
              <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium text-sm">Certificação SCAA</span>
              </div>

              {/* Headline Principal */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Torrefação de Cafés Especiais
                  <span className="block text-amber-400">
                    com SCAA, da Origem à Xícara
                  </span>
                </h1>
                
                <p className="text-xl text-slate-300 leading-relaxed">
                  Selecionamos grãos de MG, SP, BA e ES e torramos por perfil para revelar o ápice de sabor. 
                  Compromisso com excelência desde 2019.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={openWhatsApp}
                  className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Briefcase className="w-5 h-5" />
                  Fale com a Torrefação (B2B)
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={openEcommerce}
                  className="inline-flex items-center justify-center gap-2 border-2 border-amber-600/30 hover:border-amber-600 text-amber-400 hover:text-amber-300 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-amber-600/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Comprar no E-commerce
                </button>
              </div>

              {/* Origem e Certificação */}
              <div className="flex items-center gap-6 text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Alta Mogiana/SP + Serra do Caparaó</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Pontuações 82+ a 87+</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="text-7xl lg:text-8xl">☕</div>
                  
                  {/* Certificações */}
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Award className="w-6 h-6 text-amber-600" />
                        <span className="font-bold text-slate-900">Certificação SCAA</span>
                      </div>
                      <p className="text-slate-700 text-sm">Associação Americana de Cafés Especiais</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="font-bold text-slate-900">4.9/5</span>
                      </div>
                      <p className="text-slate-700 text-xs text-center mt-1">Satisfação dos Clientes</p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-green-500 text-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm font-medium">Sustentável</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-purple-500 text-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Qualidade</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História & Propósito */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 font-medium text-sm">Nossa História</span>
                </div>
                
                <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
                  Desde 2019, entregamos
                  <span className="block text-amber-600">consistência e excelência</span>
                </h2>
                
                <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                  <p>
                    Somos uma torrefação de cafés especiais com sede em Santa Maria - RS,
                    comprometida em oferecer grãos de excelência provenientes dos
                    estados de MG, SP, BA e ES. Todos os nossos grãos possuem as mais
                    altas pontuações e são certificados pela Associação Americana de Cafés
                    Especiais (SCAA), garantindo qualidade superior e sabor incomparável.
                  </p>
                  
                  <p>
                    Nosso processo de torrefação é cuidadosamente desenvolvido para
                    extrair o melhor perfil de cada grão, realçando suas características
                    únicas e proporcionando uma experiência de café inigualável.
                    Adaptamos nossas técnicas para atender às especificidades de cada
                    lote, assegurando um produto final que encanta e surpreende.
                  </p>
                  
                  <p>
                    <strong>Desde 2019, temos o orgulho de levar cafés especiais para lares e
                    negócios, conquistando a preferência dos nossos clientes com a
                    consistência e a excelência que marcam nosso compromisso. Permita-
                    nos levar essa qualidade para o dia a dia do seu negócio e transformar a
                    sua experiência com café.</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Compromisso com a Excelência</div>
                  <div className="text-slate-600 text-sm">
                    Cada café que torrefamos passa por rigoroso controle de qualidade
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-100 to-amber-50 rounded-3xl p-8 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Origem Sustentável</h3>
                <p className="text-slate-600">
                  Trabalhamos diretamente com produtores que praticam agricultura sustentável
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Qualidade Certificada</h3>
                <p className="text-slate-600">
                  Todos os nossos cafés são avaliados pelos rigorosos padrões SCAA
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualidade, Origem & Certificação */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700 font-medium text-sm">Qualidade & Origem</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Trabalhamos com lotes de
              <span className="block text-amber-600">Alta Mogiana/SP e Serra do Caparaó</span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Reconhecidos mundialmente, com altas pontuações e certificação SCAA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Origem Selecionada</h3>
              <p className="text-slate-600 leading-relaxed">
                Grãos de MG, SP, BA e ES, com foco em regiões de altitude e microclimas especiais.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Certificação SCAA</h3>
              <p className="text-slate-600 leading-relaxed">
                Todos os nossos cafés passam pela rigorosa avaliação da Associação Americana de Cafés Especiais.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Altas Pontuações</h3>
              <p className="text-slate-600 leading-relaxed">
                Cafés com pontuação de 82+ a 87+, garantindo qualidade sensorial excepcional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Processo de Torra Orientada ao Perfil */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium text-sm">Nosso Processo</span>
                </div>
                
                <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
                  Cada lote recebe uma
                  <span className="block text-amber-600">curva de torra sob medida</span>
                </h2>
                
                <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                  <p>
                    <strong>Cada lote recebe uma curva de torra sob medida. Ajustamos tempo, temperatura e desenvolvimento para realçar notas naturais e equilíbrio.</strong>
                  </p>
                  
                  <p>
                    Nossa equipe de mestres torradores analisa cada grão individualmente, 
                    desenvolvendo perfis únicos que realçam as características naturais de cada origem.
                  </p>
                  
                  <p>
                    O processo é controlado por computador com monitoramento constante, 
                    garantindo consistência e repetibilidade em cada torra.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600 mb-1">15-20</div>
                  <div className="text-slate-600 text-sm">Minutos de Torra</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600 mb-1">185-210°C</div>
                  <div className="text-slate-600 text-sm">Temperatura Controlada</div>
                </div>
              </div>
            </div>

            {/* Right Column - Process Steps */}
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Análise do Grão",
                  description: "Avaliamos densidade, umidade e características sensoriais para definir a curva ideal."
                },
                {
                  step: "02",
                  title: "Desenvolvimento da Curva",
                  description: "Criamos perfis personalizados considerando origem, altitude e características do lote."
                },
                {
                  step: "03",
                  title: "Monitoramento Contínuo",
                  description: "Acompanhamos cada etapa com tecnologia de ponta para garantir precisão."
                },
                {
                  step: "04",
                  title: "Controle de Qualidade",
                  description: "Cada torra é testada sensorialmente para validar o perfil desenvolvido."
                }
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{step.step}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Linha de Produtos */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Coffee className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700 font-medium text-sm">Nossos Cafés</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Linha de Produtos Premium
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Cafés especiais com perfis sensoriais únicos, disponíveis em múltiplos tamanhos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {premiumProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={openEcommerce}
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Coffee className="w-5 h-5" />
              Ver todos os cafés
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Serviços para Empresas (B2B) */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2 mb-6">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800 font-medium text-sm">Serviços B2B</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Soluções Completas para
              <span className="block text-amber-600">Empresas e Negócios</span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Desde consultoria especializada até white label personalizado, elevamos a experiência de café do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {b2bServices.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Briefcase className="w-5 h-5" />
              Solicitar Proposta
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="py-20 lg:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(245,158,11,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Depoimentos</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              O que nossos clientes
              <span className="block text-amber-400">B2B dizem</span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Empresas que confiam na Mestres do Café para elevar a experiência de café de seus negócios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-slate-300 leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div>
                  <div className="font-bold text-white mb-1">
                    {testimonial.name}
                  </div>
                  <div className="text-amber-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chamada Final */}
      <section className="py-20 lg:py-32 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="text-6xl">🚀</div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
              Vamos elevar a experiência
              <span className="block text-amber-600">de café do seu negócio?</span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Fale com a nossa torrefação para soluções B2B personalizadas ou visite o e-commerce para experimentar nossos cafés especiais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={openWhatsApp}
                className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Briefcase className="w-5 h-5" />
                Falar com a Torrefação
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={openEcommerce}
                className="inline-flex items-center justify-center gap-2 border-2 border-amber-600/30 hover:border-amber-600 text-amber-700 hover:text-amber-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-amber-600/10"
              >
                <ShoppingCart className="w-5 h-5" />
                Ir ao E-commerce
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco Contatos */}
      <section className="py-20 lg:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Entre em Contato
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Estamos prontos para atender você e sua empresa com soluções personalizadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Endereço</h3>
              <p className="text-slate-300 text-sm">
                Rua Riachuelo 351, Sala 102<br />
                Centro, Santa Maria/RS
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">E-mail</h3>
              <a 
                href="mailto:financeiro.mestresdocafe@gmail.com" 
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                financeiro.mestresdocafe@gmail.com
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Telefone/WhatsApp</h3>
              <a 
                href="tel:+55996458600" 
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                (55) 99645-8600
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instagram</h3>
              <a 
                href="https://instagram.com/mestresdocafe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                @mestresdocafe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Sticky Mobile */}
      <StickyCTA variant="whatsapp" />
      </div>
    </>
  );
};

export default AboutPage; 