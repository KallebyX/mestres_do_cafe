import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  Check, 
  Flame, 
  Trophy,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import Header from '../components/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />

      {/* Hero Section */}
      <section className="bg-coffee-intense py-20 md:py-24 px-4 bg-pattern">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="bg-coffee-intense bg-opacity-90 p-8 rounded-2xl shadow-coffee">
            <div className="h-64 bg-coffee-gray bg-opacity-20 rounded-xl flex items-center justify-center mb-8 image-placeholder">
              <span className="text-coffee-cream text-6xl">☕</span>
              <div className="ml-4 text-coffee-cream">
                <div className="text-lg font-cormorant">Premium Coffee Beans</div>
                <div className="text-sm opacity-75">Hero Image</div>
              </div>
            </div>
            
            <h1 className="font-cormorant font-bold text-4xl md:text-6xl text-coffee-white mb-6 text-balance">
              Descubra os Melhores <span className="text-coffee-gold">Cafés Especiais</span>
            </h1>
            
            <p className="text-lg md:text-xl text-coffee-cream mb-6 leading-relaxed text-balance">
              Torrefação artesanal com certificação SCAA. Grãos selecionados das melhores fazendas do Brasil, 
              entregues frescos na sua casa.
            </p>
            
            <div className="bg-coffee-gold/20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-coffee-gold/30">
              <div className="flex items-center justify-center text-coffee-gold mb-2">
                <Trophy className="w-6 h-6 mr-2" />
                <span className="font-bold">EXCLUSIVO: Sistema de Gamificação</span>
              </div>
              <p className="text-coffee-cream text-sm">
                🏆 Primeira torrefação do Brasil com gamificação completa • 
                🎯 Ganhe pontos e evolua até 25% de desconto • 
                ⭐ Desbloqueie benefícios únicos
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="btn-primary text-lg px-8 py-4 shadow-gold hover:shadow-xl"
              >
                🛒 Acessar Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/gamificacao"
                className="bg-coffee-gold text-coffee-intense text-lg px-8 py-4 rounded-lg font-bold hover:bg-coffee-white transition-all shadow-gold border-2 border-coffee-gold hover:border-coffee-white"
              >
                🏆 Ver Gamificação
              </Link>
              <Link
                to="/about"
                className="btn-secondary text-lg px-8 py-4 border-coffee-gold text-coffee-gold hover:bg-coffee-gold hover:text-coffee-white"
              >
                Nossa História
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Cafés Especiais */}
      <section className="py-20 px-4 bg-coffee-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              Nossos Cafés Especiais
            </h2>
            <p className="text-lg text-coffee-gray max-w-3xl mx-auto">
              Seleção exclusiva de cafés com pontuação superior a 80 pontos SCAA, 
              certificados pela Associação Americana de Cafés Especiais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Produto 1: Café Alta Mogiana */}
            <div className="card group hover:shadow-coffee transition-all duration-300">
              <div className="aspect-square image-placeholder mb-6">
                <span>☕</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center star-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-coffee-gray text-sm">(15)</span>
                </div>
                <span className="badge">85 PONTOS</span>
              </div>
              
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-3">
                Café Alta Mogiana
              </h3>
              
              <p className="text-coffee-gray mb-6">
                Notas de chocolate e caramelo, corpo encorpado com acidez equilibrada. 
                Perfeito para métodos de preparo como V60 e Chemex.
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-2xl text-coffee-gold">R$ 45,00</span>
                <span className="text-coffee-gray text-sm">250g</span>
              </div>
              
              <button className="btn-primary w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar
              </button>
            </div>

            {/* Produto 2: Café Serra do Caparaó */}
            <div className="card group hover:shadow-coffee transition-all duration-300">
              <div className="aspect-square image-placeholder mb-6">
                <span>☕</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center star-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-coffee-gray text-sm">(15)</span>
                </div>
                <span className="badge">92 PONTOS</span>
              </div>
              
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-3">
                Café Serra do Caparaó
              </h3>
              
              <p className="text-coffee-gray mb-6">
                Aroma cítrico, sabor natural, notas florais e frutadas. 
                Ideal para apreciadores de cafés com perfil mais complexo.
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-2xl text-coffee-gold">R$ 52,00</span>
                <span className="text-coffee-gray text-sm">250g</span>
              </div>
              
              <button className="btn-primary w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar
              </button>
            </div>

            {/* Produto 3: Blend Especial */}
            <div className="card group hover:shadow-coffee transition-all duration-300">
              <div className="aspect-square image-placeholder mb-6">
                <span>☕</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center star-rating">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <Star className="h-4 w-4 text-coffee-cream" />
                  <span className="ml-2 text-coffee-gray text-sm">(15)</span>
                </div>
                <span className="badge">82 PONTOS</span>
              </div>
              
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-3">
                Blend Especial
              </h3>
              
              <p className="text-coffee-gray mb-6">
                Equilíbrio perfeito, versátil para diversos métodos. 
                Combina doçura natural com corpo médio e acidez balanceada.
              </p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-2xl text-coffee-gold">R$ 38,00</span>
                <span className="text-coffee-gray text-sm">250g</span>
              </div>
              
              <button className="btn-primary w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link to="/marketplace" className="btn-primary text-lg px-8 py-4 shadow-gold">
              Ver Todos os Produtos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Qualidade em Cada Etapa */}
      <section className="py-20 px-4 bg-coffee-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              Qualidade em Cada Etapa
            </h2>
            <p className="text-lg text-coffee-gray max-w-3xl mx-auto">
              Nosso compromisso com a excelência se reflete em cada processo, 
              desde a seleção dos grãos até a entrega do seu café.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Seleção Premium */}
            <div className="text-center">
              <div className="w-20 h-20 bg-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <Check className="h-10 w-10 text-coffee-white" />
              </div>
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                Seleção Premium
              </h3>
              <p className="text-coffee-gray leading-relaxed">
                Nossos grãos são cuidadosamente selecionados das melhores regiões produtoras, 
                como Alta Mogiana e Serra do Caparaó, garantindo qualidade excepcional em cada lote.
              </p>
            </div>

            {/* Torrefação Artesanal */}
            <div className="text-center">
              <div className="w-20 h-20 bg-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <Flame className="h-10 w-10 text-coffee-white" />
              </div>
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                Torrefação Artesanal
              </h3>
              <p className="text-coffee-gray leading-relaxed">
                Processo de torrefação artesanal controlado para realçar as características únicas 
                de cada origem, preservando os aromas e sabores naturais dos grãos.
              </p>
            </div>

            {/* Certificação SCAA */}
            <div className="text-center">
              <div className="w-20 h-20 bg-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <Trophy className="h-10 w-10 text-coffee-white" />
              </div>
              <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                Certificação SCAA
              </h3>
              <p className="text-coffee-gray leading-relaxed">
                Todos os nossos cafés são avaliados seguindo os rigorosos padrões da SCAA 
                (Associação Americana de Cafés Especiais), garantindo pontuação superior a 80 pontos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema de Gamificação */}
      <section className="py-20 px-4 bg-gradient-coffee relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-coffee-gold rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-coffee-gold rounded-full opacity-20"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-coffee-gold rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-12 h-12 bg-coffee-gold rounded-full opacity-30"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-coffee-gold rounded-full mb-6 shadow-gold">
              <Trophy className="w-10 h-10 text-coffee-white" />
            </div>
            <h2 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-white mb-6">
              Nosso Grande <span className="text-coffee-gold">Diferencial</span>
            </h2>
            <p className="text-xl text-coffee-cream max-w-3xl mx-auto leading-relaxed">
              Somos a primeira torrefação do Brasil com sistema de gamificação completo. 
              Transforme sua paixão pelo café em recompensas exclusivas!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Lado Esquerdo - Informações */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-coffee-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-coffee-gold" />
                </div>
                <div>
                  <h3 className="font-cormorant font-bold text-xl text-coffee-white mb-2">
                    Acumule Pontos
                  </h3>
                  <p className="text-coffee-cream">
                    Ganhe pontos em cada compra, avaliação, compartilhamento e participação em eventos. 
                    10 pontos a cada R$ 10 gastos!
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-coffee-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-coffee-gold" />
                </div>
                <div>
                  <h3 className="font-cormorant font-bold text-xl text-coffee-white mb-2">
                    Evolua de Nível
                  </h3>
                  <p className="text-coffee-cream">
                    5 níveis únicos: de Aprendiz do Café até Lenda. Cada nível desbloqueia 
                    benefícios exclusivos e descontos progressivos.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-coffee-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-coffee-gold" />
                </div>
                <div>
                  <h3 className="font-cormorant font-bold text-xl text-coffee-white mb-2">
                    Benefícios Exclusivos
                  </h3>
                  <p className="text-coffee-cream">
                    Descontos até 25%, acesso VIP a lançamentos, cafés limitados exclusivos, 
                    degustações gratuitas e muito mais!
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Níveis Preview */}
            <div className="space-y-4">
              <div className="bg-coffee-white/10 backdrop-blur-sm rounded-xl p-6 border border-coffee-gold/20">
                <h3 className="font-cormorant font-bold text-2xl text-coffee-white mb-4 text-center">
                  Progressão de Níveis
                </h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'Aprendiz do Café', points: '0+', discount: '5%', color: 'bg-gray-500' },
                    { name: 'Conhecedor', points: '500+', discount: '10%', color: 'bg-green-500' },
                    { name: 'Especialista', points: '1.500+', discount: '15%', color: 'bg-blue-500' },
                    { name: 'Mestre do Café', points: '3.000+', discount: '20%', color: 'bg-purple-500' },
                    { name: 'Lenda', points: '5.000+', discount: '25%', color: 'bg-yellow-500' }
                  ].map((level, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-coffee-white/5 rounded-lg">
                      <div className={`w-8 h-8 ${level.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-coffee-white font-medium">{level.name}</span>
                          <div className="text-right">
                            <div className="text-coffee-gold text-sm font-bold">{level.discount} OFF</div>
                            <div className="text-coffee-cream text-xs">{level.points} pts</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/gamificacao"
                  className="inline-flex items-center bg-coffee-gold text-coffee-intense px-8 py-4 rounded-lg font-bold hover:bg-coffee-white transition-all shadow-gold group"
                >
                  🏆 Descobrir Sistema Completo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats em destaque */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-coffee-gold mb-2">8+</div>
              <div className="text-coffee-cream text-sm">Formas de Ganhar Pontos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-coffee-gold mb-2">5</div>
              <div className="text-coffee-cream text-sm">Níveis Únicos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-coffee-gold mb-2">25%</div>
              <div className="text-coffee-cream text-sm">Desconto Máximo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-coffee-gold mb-2">1º</div>
              <div className="text-coffee-cream text-sm">Torrefação Gamificada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 px-4 bg-coffee-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-lg text-coffee-gray max-w-3xl mx-auto">
              Experiências autênticas de quem já descobriu a qualidade excepcional 
              dos nossos cafés especiais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <div className="card text-center">
              <div className="flex items-center justify-center mb-4 star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-coffee-gray mb-6 italic">
                "Nunca imaginei que café pudesse ter tantos sabores! O Café Alta Mogiana 
                mudou completamente minha percepção sobre café especial."
              </blockquote>
              
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center mr-3">
                  <span className="text-coffee-white font-bold">M</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-coffee-intense">Mariana Silva</div>
                  <div className="text-coffee-gray text-sm">Cliente satisfeita</div>
                </div>
              </div>
            </div>

            {/* Depoimento 2 */}
            <div className="card text-center">
              <div className="flex items-center justify-center mb-4 star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-coffee-gray mb-6 italic">
                "O sistema de gamificação é genial! Já evoluí para Especialista e os descontos 
                são incríveis. Nunca vi nada igual em torrefação."
              </blockquote>
              
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center mr-3">
                  <span className="text-coffee-white font-bold">C</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-coffee-intense">Carlos Mendes</div>
                  <div className="text-coffee-gray text-sm">Nível Especialista</div>
                </div>
              </div>
            </div>

            {/* Depoimento 3 */}
            <div className="card text-center">
              <div className="flex items-center justify-center mb-4 star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-coffee-gray mb-6 italic">
                "A assinatura mensal de café é perfeita! Recebo grãos frescos, torra diferente 
                e a experiência de descobrir novos sabores é incrível."
              </blockquote>
              
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center mr-3">
                  <span className="text-coffee-white font-bold">F</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-coffee-intense">Fernanda Costa</div>
                  <div className="text-coffee-gray text-sm">Professora</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Gamificação */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-coffee/5 rounded-xl p-8 border border-coffee-gold/20">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-coffee-gold mr-3" />
                <h3 className="font-cormorant font-bold text-2xl text-coffee-intense">
                  Junte-se ao Primeiro Sistema de Gamificação em Torrefação!
                </h3>
              </div>
              <p className="text-coffee-gray mb-6 max-w-2xl mx-auto">
                Cadastre-se agora e comece com 100 pontos de bônus na sua primeira compra. 
                Evolua, ganhe descontos e desbloqueie benefícios exclusivos!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3 flex items-center justify-center gap-2"
                >
                  🎮 Começar Jornada Gamificada
                </Link>
                <Link
                  to="/gamificacao"
                  className="btn-secondary px-8 py-3 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Ver Sistema Completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 px-4 bg-coffee-intense bg-pattern">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-white mb-6">
            Experimente Nossos Cafés Especiais
          </h2>
          <p className="text-lg text-coffee-cream mb-8 leading-relaxed">
            Descubra sabores únicos, certificação SCAA e entrega para todo o Brasil. 
            Junte-se à nossa comunidade de apreciadores de café especial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/marketplace"
              className="btn-primary text-lg px-8 py-4 bg-coffee-gold hover:bg-coffee-white hover:text-coffee-intense shadow-gold"
            >
              Visite Nossa Loja
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/subscriptions"
              className="btn-secondary text-lg px-8 py-4 border-coffee-gold text-coffee-gold hover:bg-coffee-gold hover:text-coffee-white"
            >
              Conheça Nossas Assinaturas
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="py-20 px-4 bg-coffee-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              Siga-nos no Instagram
            </h2>
            <p className="text-coffee-gold font-semibold text-lg">@mestresdocafe</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square image-placeholder group hover:shadow-coffee transition-all duration-300 cursor-pointer">
                <span className="text-4xl">📸</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://instagram.com/mestresdocafe"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-4 shadow-gold"
            >
              <Instagram className="h-5 w-5 mr-2" />
              Ver Mais no Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-intense py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Branding */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center">
                  <span className="text-coffee-white font-cormorant font-bold text-lg">M</span>
                </div>
                <div>
                  <h3 className="font-cormorant font-bold text-lg text-coffee-white">
                    Mestres do Café
                  </h3>
                </div>
              </div>
              <p className="text-coffee-cream text-sm leading-relaxed">
                Cafés especiais certificados SCAA com entrega em todo o Brasil. 
                Descobrindo novos sabores desde 2019.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-cormorant font-bold text-lg text-coffee-white mb-4">
                Links Rápidos
              </h4>
              <nav className="space-y-2">
                <Link to="/about" className="footer-link block text-sm">
                  Sobre Nós
                </Link>
                <Link to="/marketplace" className="footer-link block text-sm">
                  Marketplace
                </Link>
                <Link to="/courses" className="footer-link block text-sm">
                  Cursos
                </Link>
                <Link to="/blog" className="footer-link block text-sm">
                  Blog
                </Link>
              </nav>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-cormorant font-bold text-lg text-coffee-white mb-4">
                Contato
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-coffee-cream">
                  <MapPin className="h-4 w-4 mr-2 text-coffee-gold" />
                  Santa Maria, RS
                </div>
                <div className="flex items-center text-coffee-cream">
                  <Phone className="h-4 w-4 mr-2 text-coffee-gold" />
                  (55) 9999-9999
                </div>
                <div className="flex items-center text-coffee-cream">
                  <Mail className="h-4 w-4 mr-2 text-coffee-gold" />
                  contato@mestresdocafe.com
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="font-cormorant font-bold text-lg text-coffee-white mb-4">
                Redes Sociais
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/mestresdocafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-coffee-gold rounded-full flex items-center justify-center hover:bg-coffee-white hover:text-coffee-intense transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com/mestresdocafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-coffee-gold rounded-full flex items-center justify-center hover:bg-coffee-white hover:text-coffee-intense transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/mestresdocafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-coffee-gold rounded-full flex items-center justify-center hover:bg-coffee-white hover:text-coffee-intense transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-coffee-gold border-opacity-30 pt-8">
            <p className="text-center text-coffee-cream text-sm">
              © 2024 Mestres do Café. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

