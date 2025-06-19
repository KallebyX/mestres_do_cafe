import React, { useState } from 'react';
import { Trophy, Star, Gift, Target, Zap, Crown, Coffee, Users, Award, ChevronRight, Play } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const levels = [
    {
      id: 1,
      name: 'Aprendiz do Café',
      points: 0,
      color: 'bg-gray-500',
      icon: Coffee,
      benefits: ['5% desconto em compras', 'Acesso a conteúdo básico'],
      description: 'Primeiros passos no mundo dos cafés especiais'
    },
    {
      id: 2,
      name: 'Conhecedor',
      points: 500,
      color: 'bg-green-500',
      icon: Star,
      benefits: ['10% desconto em compras', 'Degustações gratuitas mensais', 'Acesso a workshops básicos'],
      description: 'Já conhece bem os diferentes tipos de café'
    },
    {
      id: 3,
      name: 'Especialista',
      points: 1500,
      color: 'bg-blue-500',
      icon: Target,
      benefits: ['15% desconto em compras', 'Acesso VIP a lançamentos', 'Consultoria personalizada'],
      description: 'Domina as técnicas de preparo e degustação'
    },
    {
      id: 4,
      name: 'Mestre do Café',
      points: 3000,
      color: 'bg-purple-500',
      icon: Crown,
      benefits: ['20% desconto em compras', 'Participação em júris', 'Acesso a cafés exclusivos'],
      description: 'Reconhecido expertise no mundo do café'
    },
    {
      id: 5,
      name: 'Lenda',
      points: 5000,
      color: 'bg-yellow-500',
      icon: Trophy,
      benefits: ['25% desconto em compras', 'Status VIP permanente', 'Cafés limitados exclusivos'],
      description: 'O nível mais alto de conhecimento e paixão pelo café'
    }
  ];

  const pointsActivities = [
    { activity: 'Compra de produtos', points: '+10 pontos por R$ 10', icon: Coffee },
    { activity: 'Primeira compra', points: '+100 pontos', icon: Gift },
    { activity: 'Avaliação de produto', points: '+25 pontos', icon: Star },
    { activity: 'Compartilhamento nas redes', points: '+15 pontos', icon: Users },
    { activity: 'Participação em workshops', points: '+50 pontos', icon: Target },
    { activity: 'Indicação de amigos', points: '+200 pontos', icon: Award },
    { activity: 'Compra mensal recorrente', points: '+50 pontos bonus', icon: Zap },
    { activity: 'Feedback detalhado', points: '+30 pontos', icon: Star }
  ];

  const corporateProgram = {
    bronze: {
      name: 'Bronze Corporativo',
      requirement: 'R$ 1.000/mês',
      benefits: ['10% desconto corporativo', 'Entrega prioritária', 'Relatórios de consumo']
    },
    silver: {
      name: 'Prata Corporativo',
      requirement: 'R$ 5.000/mês',
      benefits: ['15% desconto corporativo', 'Coffee break personalizado', 'Treinamentos para equipe']
    },
    gold: {
      name: 'Ouro Corporativo',
      requirement: 'R$ 10.000/mês',
      benefits: ['20% desconto corporativo', 'Barista dedicado', 'Máquinas profissionais em comodato']
    }
  };

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-coffee rounded-full mb-6">
              <Trophy className="w-10 h-10 text-coffee-white" />
            </div>
            <h1 className="font-cormorant font-bold text-5xl lg:text-6xl text-coffee-intense mb-6">
              Sistema de <span className="text-coffee-gold">Gamificação</span>
            </h1>
            <p className="text-xl text-coffee-gray max-w-3xl mx-auto leading-relaxed">
              Transforme sua paixão pelo café em recompensas exclusivas. Ganhe pontos, desbloqueie níveis 
              e desfrute de benefícios únicos em cada compra e interação.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Star },
              { id: 'levels', label: 'Níveis', icon: Trophy },
              { id: 'points', label: 'Como Ganhar Pontos', icon: Target },
              { id: 'corporate', label: 'Programa Corporativo', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-coffee-gold text-coffee-white shadow-lg'
                    : 'bg-coffee-cream text-coffee-gray hover:bg-coffee-gold/10 hover:text-coffee-gold'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Como Funciona */}
              <section className="card">
                <div className="text-center mb-10">
                  <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-4">
                    Como Funciona
                  </h2>
                  <p className="text-coffee-gray text-lg">
                    Um sistema revolucionário que recompensa sua jornada no mundo dos cafés especiais
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-coffee-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coffee className="w-8 h-8 text-coffee-gold" />
                    </div>
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                      1. Interaja & Compre
                    </h3>
                    <p className="text-coffee-gray">
                      Ganhe pontos em cada compra, avaliação, compartilhamento e participação em eventos.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-coffee-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-coffee-gold" />
                    </div>
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                      2. Suba de Nível
                    </h3>
                    <p className="text-coffee-gray">
                      Acumule pontos para desbloquear novos níveis com benefícios exclusivos crescentes.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-coffee-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-coffee-gold" />
                    </div>
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                      3. Desfrute dos Benefícios
                    </h3>
                    <p className="text-coffee-gray">
                      Aproveite descontos, acessos VIP, produtos exclusivos e experiências únicas.
                    </p>
                  </div>
                </div>
              </section>

              {/* Destaque dos Benefícios */}
              <section className="bg-gradient-coffee/5 rounded-xl p-8">
                <h2 className="font-cormorant font-bold text-3xl text-coffee-intense text-center mb-8">
                  Benefícios Exclusivos
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: Gift, title: 'Descontos Progressivos', desc: 'Até 25% off em compras' },
                    { icon: Star, title: 'Acesso VIP', desc: 'Lançamentos e eventos exclusivos' },
                    { icon: Coffee, title: 'Cafés Limitados', desc: 'Edições especiais reservadas' },
                    { icon: Users, title: 'Comunidade', desc: 'Rede de especialistas em café' }
                  ].map((benefit, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-coffee-gold rounded-full flex items-center justify-center mx-auto mb-3">
                        <benefit.icon className="w-6 h-6 text-coffee-white" />
                      </div>
                      <h3 className="font-medium text-coffee-intense mb-2">{benefit.title}</h3>
                      <p className="text-sm text-coffee-gray">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'levels' && (
            <section className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-4">
                  Níveis de Especialista
                </h2>
                <p className="text-coffee-gray text-lg">
                  Evolua através dos níveis e desbloqueie benefícios exclusivos
                </p>
              </div>

              <div className="space-y-6">
                {levels.map((level, index) => (
                  <div key={level.id} className="card hover:shadow-gold transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 ${level.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <level.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-cormorant font-bold text-xl text-coffee-intense">
                            {level.name}
                          </h3>
                          <span className="px-3 py-1 bg-coffee-gold/10 text-coffee-gold text-sm font-medium rounded-full">
                            {level.points}+ pontos
                          </span>
                        </div>
                        
                        <p className="text-coffee-gray mb-4">{level.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {level.benefits.map((benefit, benefitIndex) => (
                            <span
                              key={benefitIndex}
                              className="flex items-center gap-1 px-3 py-1 bg-coffee-cream text-coffee-intense text-sm rounded-full"
                            >
                              <Star className="w-3 h-3 text-coffee-gold" />
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {index < levels.length - 1 && (
                        <ChevronRight className="w-6 h-6 text-coffee-gray flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'points' && (
            <section className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-4">
                  Como Ganhar Pontos
                </h2>
                <p className="text-coffee-gray text-lg">
                  Múltiplas formas de acumular pontos e acelerar sua evolução
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {pointsActivities.map((activity, index) => (
                  <div key={index} className="card hover:shadow-gold transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-coffee-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-6 h-6 text-coffee-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-coffee-intense mb-1">
                          {activity.activity}
                        </h3>
                        <p className="text-coffee-gold font-bold">
                          {activity.points}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dicas para Maximizar Pontos */}
              <div className="card bg-coffee-gold/5 border-coffee-gold/20">
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-coffee-gold" />
                  Dicas para Maximizar Pontos
                </h3>
                <ul className="space-y-2 text-coffee-gray">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-coffee-gold" />
                    Faça avaliações detalhadas dos produtos para ganhar pontos bonus
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-coffee-gold" />
                    Compartilhe suas experiências nas redes sociais com nossa hashtag
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-coffee-gold" />
                    Participe de workshops e eventos para acelerar sua evolução
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-coffee-gold" />
                    Indique amigos e ganhe pontos quando eles fizerem a primeira compra
                  </li>
                </ul>
              </div>
            </section>
          )}

          {activeTab === 'corporate' && (
            <section className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-4">
                  Programa Corporativo
                </h2>
                <p className="text-coffee-gray text-lg">
                  Benefícios especiais para empresas que valorizam a qualidade
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {Object.entries(corporateProgram).map(([tier, program]) => (
                  <div key={tier} className="card hover:shadow-gold transition-all duration-300">
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        tier === 'bronze' ? 'bg-amber-600' :
                        tier === 'silver' ? 'bg-gray-400' :
                        'bg-yellow-500'
                      }`}>
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                        {program.name}
                      </h3>
                      <p className="text-coffee-gold font-bold text-lg">
                        {program.requirement}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {program.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-coffee-gold flex-shrink-0" />
                          <span className="text-coffee-gray">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Corporativo */}
              <div className="card bg-gradient-coffee text-coffee-white text-center">
                <h3 className="font-cormorant font-bold text-2xl mb-4">
                  Interessado no Programa Corporativo?
                </h3>
                <p className="text-coffee-cream mb-6">
                  Entre em contato conosco para uma proposta personalizada para sua empresa
                </p>
                <button className="bg-coffee-gold text-coffee-intense px-8 py-3 rounded-lg font-medium hover:bg-coffee-gold/90 transition-colors">
                  Solicitar Proposta
                </button>
              </div>
            </section>
          )}

          {/* CTA Final */}
          <section className="text-center mt-16">
            <div className="card bg-gradient-coffee/5">
              <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-4">
                Pronto para Começar sua Jornada?
              </h2>
              <p className="text-coffee-gray text-lg mb-8">
                Cadastre-se agora e comece a acumular pontos na sua primeira compra
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary px-8 py-3 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Começar Agora
                </button>
                <button className="btn-secondary px-8 py-3">
                  Saiba Mais
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GamificationPage; 