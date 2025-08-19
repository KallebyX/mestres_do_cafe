import React, { useState, useEffect } from 'react';
import { Trophy, Star, Gift, Coffee, Target, Award, Users, ShoppingBag, Truck, Crown, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const GamificacaoPage = () => {
  const { user, profile } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState('Iniciante');

  // Simular pontos do usuário (em produção viria da API)
  useEffect(() => {
    if (user) {
      // Mock: usuário com 350 pontos
      setUserPoints(350);
      setUserLevel('Aprendiz');
    }
  }, [user]);

  const levels = [
    {
      name: 'Iniciante',
      minPoints: 0,
      maxPoints: 199,
      rewards: [
        '1 Chaveiro NFC com links',
        'Caneca com logo personalizada',
        'Acesso a degustações exclusivas'
      ],
      icon: <Coffee className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Aprendiz',
      minPoints: 200,
      maxPoints: 499,
      rewards: [
        'Cupom de desconto próxima compra',
        'Desconto em workshops',
        'Produtos exclusivos'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Conhecedor',
      minPoints: 500,
      maxPoints: 999,
      rewards: [
        'Frete grátis (1 cupom)',
        'Colecionável exclusivo',
        'Brindes de aniversário'
      ],
      icon: <Gift className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Especialista',
      minPoints: 1000,
      maxPoints: 2499,
      rewards: [
        '2 cupons de frete grátis',
        'Microlote exclusivo',
        'Brinde personalizado'
      ],
      icon: <Award className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Mestre do Café',
      minPoints: 2500,
      maxPoints: Infinity,
      rewards: [
        'Moedor de café profissional',
        'Colecionáveis especiais',
        'Pacotão de brindes',
        '🏆 TROFÉU MESTRES DO CAFÉ'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const waysToEarn = [
    { action: 'Pacote de 250g', points: 5, icon: <Coffee className="w-5 h-5" /> },
    { action: 'Pacote de 500g', points: 12, icon: <Coffee className="w-5 h-5" /> },
    { action: 'Pacote de 1kg', points: 25, icon: <Coffee className="w-5 h-5" /> },
    { action: 'Post em rede social marcando o café', points: 3, icon: <Users className="w-5 h-5" /> },
    { action: 'Avaliação no Google', points: 3, icon: <Star className="w-5 h-5" /> },
    { action: 'Avaliação no site', points: 3, icon: <Star className="w-5 h-5" /> },
    { action: 'Participação em eventos com degustação', points: 3, icon: <Gift className="w-5 h-5" /> },
    { action: 'Participação em workshop', points: 10, icon: <Target className="w-5 h-5" /> }
  ];

  const getCurrentLevel = () => {
    return levels.find(level => userPoints >= level.minPoints && userPoints <= level.maxPoints) || levels[0];
  };

  const getNextLevel = () => {
    const currentIndex = levels.findIndex(level => level.name === getCurrentLevel().name);
    return levels[currentIndex + 1] || null;
  };

  const getProgressPercentage = () => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;
    
    const range = next.minPoints - current.minPoints;
    const progress = userPoints - current.minPoints;
    return Math.min((progress / range) * 100, 100);
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mb-8 shadow-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-medium">Clube dos Mestres</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Seja um
              <span className="block text-amber-600">Mestre do Café</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed">
              Acumule pontos, desbloqueie recompensas exclusivas e faça parte da comunidade mais apaixonada por cafés especiais do Brasil.
            </p>

            {/* User Points Display */}
            {user ? (
              <div className="bg-white rounded-3xl p-8 shadow-xl max-w-2xl mx-auto mb-12">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{userPoints} pontos</div>
                    <div className="text-amber-600 text-lg">{currentLevel.name}</div>
                  </div>
                </div>
                
                {nextLevel && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Próximo nível: {nextLevel.name}</span>
                      <span>{userPoints}/{nextLevel.minPoints} pontos</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-12">
                <p className="text-slate-600 text-lg mb-6">
                  Faça login para ver seus pontos e recompensas
                </p>
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Entrar no Clube
                </button>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5" />
                  Ver Como Funciona
                </div>
              </button>
              
              <button className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5" />
                  Ver Recompensas
                </div>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Como Funciona o
              <span className="block text-amber-600">Sistema de Pontos</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Cada ação no nosso ecossistema de café gera pontos que desbloqueiam recompensas exclusivas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {waysToEarn.map((way, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="text-white">
                    {way.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">
                  {way.action}
                </h3>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-800">{way.points} pontos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Níveis e Recompensas */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Níveis e
              <span className="block text-amber-600">Recompensas</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Suba de nível e desbloqueie recompensas cada vez mais exclusivas
            </p>
          </div>

          <div className="space-y-8">
            {levels.map((level, index) => (
              <div 
                key={index}
                className={`bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 ${
                  userPoints >= level.minPoints && userPoints <= level.maxPoints
                    ? 'ring-4 ring-amber-400 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
              >
                <div className="flex items-center gap-6 mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${level.color} rounded-2xl flex items-center justify-center`}>
                    <div className="text-white">
                      {level.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {level.name}
                    </h3>
                    <div className="text-slate-600">
                      {level.minPoints === 0 ? (
                        <span>0 - {level.maxPoints} pontos</span>
                      ) : level.maxPoints === Infinity ? (
                        <span>{level.minPoints}+ pontos</span>
                      ) : (
                        <span>{level.minPoints} - {level.maxPoints} pontos</span>
                      )}
                    </div>
                  </div>
                  {userPoints >= level.minPoints && userPoints <= level.maxPoints && (
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold">
                      Nível Atual
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Recompensas:</h4>
                  <ul className="space-y-2">
                    {level.rewards.map((reward, rewardIndex) => (
                      <li key={rewardIndex} className="flex items-center gap-3 text-slate-600">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="text-6xl">🎯</div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900">
              Comece a acumular
              <span className="block text-amber-600">pontos hoje mesmo!</span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Faça sua primeira compra, participe dos nossos eventos e comece sua jornada para se tornar um Mestre do Café.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <ShoppingBag className="w-5 h-5" />
                Fazer Primeira Compra
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 border-2 border-amber-600/30 hover:border-amber-600 text-amber-700 hover:text-amber-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-amber-600/10">
                <Target className="w-5 h-5" />
                Ver Workshops
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GamificacaoPage;
