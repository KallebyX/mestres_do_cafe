import { Link } from 'react-router-dom';
import { ArrowRight, Star, Award, Users, Coffee, MapPin, Phone, Mail, CheckCircle, Zap, Heart } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#2B3A42]">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8956D]/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/coffee-beans-hero.jpg')] bg-cover bg-center opacity-5"></div>
        <div className="container mx-auto text-center relative z-10 max-w-6xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Mestres do <span className="text-[#C8956D] relative">
              Café
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#C8956D]/30 rounded-full"></div>
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
            Torrefação artesanal de cafés especiais em Santa Maria - RS. 
            Mais de 5 anos de experiência levando o melhor café até você.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto">
            <Link
              to="/marketplace"
              className="bg-[#C8956D] text-[#2B3A42] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#C8956D]/90 transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explorar Marketplace
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/login"
              className="border-2 border-[#C8956D] text-[#C8956D] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#C8956D] hover:text-[#2B3A42] transition-all duration-200 inline-flex items-center justify-center"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-[#1A2328] border-y border-[#C8956D]/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-2 p-4 rounded-lg bg-[#2B3A42]/50 border border-[#C8956D]/10">
              <div className="text-3xl sm:text-4xl font-bold text-[#C8956D]">5+</div>
              <div className="text-sm sm:text-base text-gray-300">Anos de Experiência</div>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-[#2B3A42]/50 border border-[#C8956D]/10">
              <div className="text-3xl sm:text-4xl font-bold text-[#C8956D]">1000+</div>
              <div className="text-sm sm:text-base text-gray-300">Clientes Satisfeitos</div>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-[#2B3A42]/50 border border-[#C8956D]/10">
              <div className="text-3xl sm:text-4xl font-bold text-[#C8956D]">50+</div>
              <div className="text-sm sm:text-base text-gray-300">Variedades de Café</div>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-[#2B3A42]/50 border border-[#C8956D]/10">
              <div className="text-3xl sm:text-4xl font-bold text-[#C8956D]">85+</div>
              <div className="text-sm sm:text-base text-gray-300">Pontuação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Nossa <span className="text-[#C8956D]">Atuação</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Oferecemos uma gama completa de serviços para atender desde o consumidor final até estabelecimentos comerciais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cafés Especiais */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <Coffee className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Cafés Especiais</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Seleção exclusiva de cafés com pontuação acima de 80 pontos, torrados artesanalmente para realçar suas características únicas.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <Star className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Pontuação 80+</span>
              </div>
            </div>

            {/* White Label */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <Award className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">White Label</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Desenvolvimento de blends personalizados para cafeterias e restaurantes, com sua marca e identidade única.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Personalizado</span>
              </div>
            </div>

            {/* Treinamentos */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <Users className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Treinamentos</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Cursos e workshops sobre métodos de preparo, análise sensorial e técnicas de barista para profissionais.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <Award className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Certificado</span>
              </div>
            </div>

            {/* Consultoria */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <Zap className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Consultoria</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Assessoria completa para abertura e otimização de cafeterias, desde a escolha dos grãos até o layout do espaço.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Especializada</span>
              </div>
            </div>

            {/* Equipamentos */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <Coffee className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Equipamentos</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Venda e manutenção de equipamentos profissionais para preparo de café, desde moedores até máquinas de espresso.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Profissional</span>
              </div>
            </div>

            {/* Eventos */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <Heart className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Eventos</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Organização de degustações, cuppings e eventos corporativos para promover a cultura do café especial.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <Star className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Exclusivo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-[#C8956D]/10 to-[#C8956D]/5">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Pronto para descobrir o <span className="text-[#C8956D]">melhor café</span>?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            Explore nossa seleção exclusiva de cafés especiais e faça parte da nossa comunidade de amantes do café.
          </p>
          <Link
            to="/marketplace"
            className="bg-[#C8956D] text-[#2B3A42] px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-lg sm:text-xl hover:bg-[#C8956D]/90 transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Explorar Marketplace
            <ArrowRight className="ml-2" size={24} />
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 px-4 bg-[#1A2328] border-t border-[#C8956D]/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Entre em <span className="text-[#C8956D]">Contato</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Estamos sempre prontos para atender você. Entre em contato conosco!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-[#2B3A42] rounded-xl border border-[#C8956D]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MapPin className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Localização</h3>
              <p className="text-gray-300 text-sm sm:text-base">Santa Maria - RS</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-[#2B3A42] rounded-xl border border-[#C8956D]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Phone className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Telefone</h3>
              <p className="text-gray-300 text-sm sm:text-base">(55) 99645-8600</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-[#2B3A42] rounded-xl border border-[#C8956D]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Mail className="text-[#C8956D] w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">E-mail</h3>
              <p className="text-gray-300 text-sm sm:text-base">contato@mestrescafe.com.br</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

