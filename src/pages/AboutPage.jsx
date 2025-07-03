import React from 'react';
// import { _Coffee, _Award, _Users, _MapPin, _Target, _Heart, _Leaf, _TrendingUp, _Star, _CheckCircle, _ArrowRight, _Shield } from 'lucide-react'; // Temporarily commented - unused import

const _AboutPage = () => {
  const _achievements = [
    {
      number: "1000+",
      label: "Clientes Satisfeitos",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "50+",
      label: "Variedades Premium",
      icon: Coffee,
      color: "from-amber-500 to-amber-600"
    },
    {
      number: "85+",
      label: "Pontuação SCA",
      icon: Award,
      color: "from-green-500 to-green-600"
    },
    {
      number: "15+",
      label: "Produtores Parceiros",
      icon: MapPin,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const _values = [
    {
      icon: Target,
      title: "Excelência",
      description: "Buscamos a perfeição em cada grão, desde a seleção até a torra artesanal.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: Heart,
      title: "Paixão",
      description: "O amor pelo café especial move cada decisão e processo da nossa torrefação.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Leaf,
      title: "Sustentabilidade",
      description: "Práticas responsáveis que respeitam o meio ambiente e os produtores.",
      gradient: "from-blue-500 to-purple-600"
    }
  ];

  const _process = [
    {
      step: "01",
      title: "Seleção Rigorosa",
      description: "Visitamos produtores e selecionamos apenas grãos com pontuação SCA acima de 80 pontos."
    },
    {
      step: "02", 
      title: "Análise Sensorial",
      description: "Degustação profissional para identificar perfis únicos e características especiais."
    },
    {
      step: "03",
      title: "Torra Artesanal",
      description: "Processo controlado por mestres torradores para realçar as melhores qualidades."
    },
    {
      step: "04",
      title: "Controle de Qualidade",
      description: "Cada lote é testado para garantir consistência e excelência no produto final."
    }
  ];

  const _team = [
    {
      name: "Daniel Nascimento",
      role: "Fundador & Mestre Torrador",
      avatar: "👨‍💼",
      description: "15 anos de experiência em café especial. Certificado Q-Grader SCA."
    },
    {
      name: "Maria Santos",
      role: "Coordenadora de Qualidade",
      avatar: "👩‍🔬",
      description: "Especialista em análise sensorial e controle de qualidade dos cafés."
    },
    {
      name: "João Silva",
      role: "Relacionamento com Produtores",
      avatar: "👨‍🌾",
      description: "Responsável pela seleção e parcerias com os melhores caficultores."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium text-sm">Certificação SCA</span>
              </div>

              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Nossa História no
                  <span className="block text-amber-400">
                    Café Especial
                  </span>
                </h1>
                
                <p className="text-xl text-slate-300 leading-relaxed">
                  Há mais de 5 anos dedicados à arte da torrefação artesanal, 
                  transformando grãos especiais em experiências inesquecíveis para nossos clientes.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-amber-400 mb-1">5+</div>
                  <div className="text-slate-300 text-sm">Anos de Experiência</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-amber-400 mb-1">92</div>
                  <div className="text-slate-300 text-sm">Pontuação Máxima</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="text-7xl lg:text-8xl">☕</div>
                  
                  {/* Awards */}
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Award className="w-6 h-6 text-amber-600" />
                        <span className="font-bold text-slate-900">Certificação SCA</span>
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

      {/* Achievements Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Nossas Conquistas
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Números que refletem nosso compromisso com a excelência e a satisfação dos nossos clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${achievement.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <achievement.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                  {achievement.number}
                </div>
                
                <div className="text-slate-600 font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
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
                  Paixão que Moveu uma
                  <span className="block text-amber-600">Revolução no Café</span>
                </h2>
                
                <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                  <p>
                    Tudo começou com uma viagem às montanhas de Minas Gerais, onde Daniel Nascimento, 
                    nosso fundador, se apaixonou pela complexidade e riqueza dos cafés especiais brasileiros.
                  </p>
                  
                  <p>
                    Em 2019, decidiu transformar essa paixão em missão: levar cafés de qualidade excepcional 
                    diretamente dos melhores produtores para a mesa dos brasileiros.
                  </p>
                  
                  <p>
                    Hoje, somos reconhecidos como uma das principais torrefações artesanais do Sul do Brasil, 
                    com certificação SCA e parcerias diretas com mais de 15 produtores especializados.
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
                  Todos os nossos cafés são avaliados pelos rigorosos padrões SCA
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Heart className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700 font-medium text-sm">Nossos Valores</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              O Que Nos Move
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Valores que guiam cada decisão e definem nossa identidade como torrefação artesanal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {value.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed text-lg">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-medium text-sm">Nosso Processo</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Do Grão à Xícara Perfeita
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Cada etapa é cuidadosamente planejada para garantir a máxima qualidade e sabor
            </p>
          </div>

          <div className="space-y-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < process.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-16 bg-slate-200 z-0"></div>
                )}
                
                <div className="flex items-start gap-8 relative z-10">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(245,158,11,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Nossa Equipe</span>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Pessoas Apaixonadas
              <span className="block text-amber-400">Por Café Especial</span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Conheça os especialistas que tornam possível levar a você os melhores cafés do Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    {member.avatar}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {member.name}
                  </h3>
                  
                  <div className="text-amber-400 font-medium mb-4">
                    {member.role}
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 lg:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-amber-400/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-amber-400/5 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-amber-400/10 rounded-full animate-pulse delay-700"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-16">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">
                Impacto que Fazemos
              </h2>
              
              <div className="grid md:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <div className="text-4xl lg:text-5xl font-bold text-amber-400">98%</div>
                  <div className="text-slate-300">Satisfação</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl lg:text-5xl font-bold text-amber-400">24h</div>
                  <div className="text-slate-300">Entrega Rápida</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl lg:text-5xl font-bold text-amber-400">100%</div>
                  <div className="text-slate-300">Café Fresco</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl lg:text-5xl font-bold text-amber-400">7</div>
                  <div className="text-slate-300">Dias Garantia</div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Certificação SCA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Qualidade Premium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="text-6xl">🤝</div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
              Faça Parte da Nossa
              <span className="block text-amber-600">Comunidade do Café</span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de apreciadores que já descobriram o verdadeiro sabor do café especial brasileiro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Coffee className="w-5 h-5" />
                Experimente Nossos Cafés
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-amber-600 text-slate-700 hover:text-amber-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300">
                <Users className="w-5 h-5" />
                Conheça Nossa História
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 