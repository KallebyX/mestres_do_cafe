import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'

// Componente principal simplificado
function App() {
  return (
    <div className="min-h-screen bg-[#2B3A42]">
      {/* Header */}
      <header className="bg-[#2B3A42] shadow-lg sticky top-0 z-50 border-b border-[#C8956D]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#C8956D] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#2B3A42] text-xl font-bold">☕</span>
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold text-white">Mestres do Café</span>
                <div className="text-xs lg:text-sm text-[#C8956D] font-medium">Torrefação Artesanal</div>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#inicio" className="text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30 px-4 py-2 rounded-lg font-medium">Início</a>
              <a href="#marketplace" className="text-gray-300 hover:text-[#C8956D] px-4 py-2 rounded-lg font-medium transition-colors">Marketplace</a>
              <a href="#contato" className="text-gray-300 hover:text-[#C8956D] px-4 py-2 rounded-lg font-medium transition-colors">Contato</a>
            </nav>
            
            <div className="hidden lg:flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-300 hover:text-[#C8956D] font-medium transition-colors">Entrar</button>
              <button className="px-6 py-2 bg-[#C8956D] text-[#2B3A42] font-semibold rounded-lg hover:bg-[#C8956D]/90 transition-all shadow-lg">Cadastrar</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8956D]/10 to-transparent"></div>
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
            <button className="bg-[#C8956D] text-[#2B3A42] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#C8956D]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Explorar Marketplace →
            </button>
            <button className="border-2 border-[#C8956D] text-[#C8956D] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#C8956D] hover:text-[#2B3A42] transition-all duration-200">
              Fazer Login
            </button>
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
                <span className="text-[#C8956D] text-2xl">☕</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Cafés Especiais</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Seleção exclusiva de cafés com pontuação acima de 80 pontos, torrados artesanalmente para realçar suas características únicas.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <span className="text-sm sm:text-base">⭐ Pontuação 80+</span>
              </div>
            </div>

            {/* White Label */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <span className="text-[#C8956D] text-2xl">🏆</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">White Label</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Desenvolvimento de blends personalizados para cafeterias e restaurantes, com sua marca e identidade única.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <span className="text-sm sm:text-base">✅ Personalizado</span>
              </div>
            </div>

            {/* Treinamentos */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <span className="text-[#C8956D] text-2xl">👥</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Treinamentos</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Cursos e workshops sobre métodos de preparo, análise sensorial e técnicas de barista para profissionais.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <span className="text-sm sm:text-base">🏆 Certificado</span>
              </div>
            </div>

            {/* Consultoria */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <span className="text-[#C8956D] text-2xl">⚡</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Consultoria</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Assessoria completa para abertura e otimização de cafeterias, desde a escolha dos grãos até o layout do espaço.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <span className="text-sm sm:text-base">✅ Especializada</span>
              </div>
            </div>

            {/* Equipamentos */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <span className="text-[#C8956D] text-2xl">☕</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Equipamentos</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Venda e manutenção de equipamentos profissionais para preparo de café, desde moedores até máquinas de espresso.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <span className="text-sm sm:text-base">⚡ Profissional</span>
              </div>
            </div>

            {/* Eventos */}
            <div className="group bg-[#1A2328] p-6 sm:p-8 rounded-xl border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#C8956D]/20 transition-colors">
                <span className="text-[#C8956D] text-2xl">❤️</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Eventos</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                Organização de degustações, cuppings e eventos corporativos para promover a cultura do café especial.
              </p>
              <div className="flex items-center text-[#C8956D] font-semibold">
                <span className="text-sm sm:text-base">⭐ Exclusivo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section id="marketplace" className="py-16 sm:py-20 px-4 bg-[#1A2328]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Nossos <span className="text-[#C8956D]">Cafés Especiais</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra nossa seleção exclusiva de cafés especiais, cada um com características únicas e pontuação superior a 80 pontos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Produto 1 */}
            <div className="bg-[#2B3A42] rounded-xl overflow-hidden border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="aspect-square bg-[#C8956D]/10 flex items-center justify-center p-6">
                <span className="text-6xl">☕</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Bourbon Amarelo</h3>
                <p className="text-gray-300 text-sm mb-4">Café especial com notas de chocolate e caramelo, corpo médio e acidez equilibrada.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#C8956D]">R$ 45,00</span>
                  <span className="text-gray-400 text-sm">250g</span>
                </div>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-400 text-sm ml-2">85 pontos</span>
                </div>
                <button className="w-full px-4 py-3 bg-[#C8956D] text-[#2B3A42] rounded-lg hover:bg-[#C8956D]/90 transition-all font-semibold">
                  🛒 Adicionar ao Carrinho
                </button>
              </div>
            </div>

            {/* Produto 2 */}
            <div className="bg-[#2B3A42] rounded-xl overflow-hidden border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="aspect-square bg-[#C8956D]/10 flex items-center justify-center p-6">
                <span className="text-6xl">☕</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Catuaí Vermelho</h3>
                <p className="text-gray-300 text-sm mb-4">Café doce com notas frutadas, corpo intenso e final prolongado.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#C8956D]">R$ 52,00</span>
                  <span className="text-gray-400 text-sm">250g</span>
                </div>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-400 text-sm ml-2">87 pontos</span>
                </div>
                <button className="w-full px-4 py-3 bg-[#C8956D] text-[#2B3A42] rounded-lg hover:bg-[#C8956D]/90 transition-all font-semibold">
                  🛒 Adicionar ao Carrinho
                </button>
              </div>
            </div>

            {/* Produto 3 */}
            <div className="bg-[#2B3A42] rounded-xl overflow-hidden border border-[#C8956D]/20 hover:border-[#C8956D]/40 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="aspect-square bg-[#C8956D]/10 flex items-center justify-center p-6">
                <span className="text-6xl">☕</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Mundo Novo</h3>
                <p className="text-gray-300 text-sm mb-4">Café encorpado com notas de castanha e chocolate amargo.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#C8956D]">R$ 48,00</span>
                  <span className="text-gray-400 text-sm">250g</span>
                </div>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-400 text-sm ml-2">83 pontos</span>
                </div>
                <button className="w-full px-4 py-3 bg-[#C8956D] text-[#2B3A42] rounded-lg hover:bg-[#C8956D]/90 transition-all font-semibold">
                  🛒 Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-[#C8956D] text-[#2B3A42] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#C8956D]/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Ver Todos os Produtos →
            </button>
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
          <button className="bg-[#C8956D] text-[#2B3A42] px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-lg sm:text-xl hover:bg-[#C8956D]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            Explorar Marketplace →
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 sm:py-20 px-4 bg-[#1A2328] border-t border-[#C8956D]/20">
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
                <span className="text-[#C8956D] text-2xl">📍</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Localização</h3>
              <p className="text-gray-300 text-sm sm:text-base">Santa Maria - RS</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-[#2B3A42] rounded-xl border border-[#C8956D]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-[#C8956D] text-2xl">📞</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Telefone</h3>
              <p className="text-gray-300 text-sm sm:text-base">(55) 99645-8600</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-[#2B3A42] rounded-xl border border-[#C8956D]/20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8956D]/10 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-[#C8956D] text-2xl">✉️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">E-mail</h3>
              <p className="text-gray-300 text-sm sm:text-base">contato@mestrescafe.com.br</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2B3A42] border-t border-[#C8956D]/20 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-[#C8956D] rounded-full flex items-center justify-center">
              <span className="text-[#2B3A42] text-sm font-bold">☕</span>
            </div>
            <span className="text-lg font-bold text-white">Mestres do Café</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Torrefação artesanal de cafés especiais em Santa Maria - RS
          </p>
          <p className="text-gray-500 text-xs">
            © 2025 Mestres do Café. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

