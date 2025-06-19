import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-coffee-intense py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-cormorant font-bold text-5xl lg:text-6xl text-coffee-white mb-6">
                Nossa <span className="text-coffee-gold">História</span>
              </h1>
              <p className="text-xl text-coffee-white/80 max-w-3xl mx-auto leading-relaxed">
                Há mais de 5 anos dedicados à arte da torrefação, levando o melhor café 
                especial de Santa Maria para todo o Brasil com paixão e qualidade incomparável.
              </p>
            </div>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-cormorant font-bold text-4xl text-coffee-intense mb-6">
                  A Paixão pelo Café Especial
                </h2>
                <div className="space-y-6 text-coffee-gray text-lg leading-relaxed">
                  <p>
                    A Mestres do Café nasceu do sonho de democratizar o acesso aos melhores 
                    cafés especiais do Brasil. Fundada em Santa Maria - RS, nossa jornada 
                    começou com uma pequena torrefadora e muito amor pelo café.
                  </p>
                  <p>
                    Ao longo dos anos, desenvolvemos parcerias diretas com produtores locais 
                    e regionais, garantindo não apenas qualidade excepcional, mas também 
                    sustentabilidade e desenvolvimento das comunidades cafeeiras.
                  </p>
                  <p>
                    Hoje, somos reconhecidos pela Specialty Coffee Association (SCA) e 
                    orgulhosamente servimos cafés com pontuação acima de 80 pontos, 
                    levando experiências únicas para verdadeiros apreciadores da bebida.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-coffee rounded-2xl h-96 flex items-center justify-center shadow-gold">
                  <span className="text-8xl">🏭</span>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-coffee-gold text-coffee-intense p-4 rounded-xl shadow-coffee">
                  <div className="text-center">
                    <div className="font-cormorant font-bold text-2xl">5+</div>
                    <div className="text-sm font-medium">Anos de Experiência</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="bg-coffee-cream py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
                Nossos <span className="text-coffee-gold">Valores</span>
              </h2>
              <p className="text-coffee-gray text-lg max-w-2xl mx-auto">
                Princípios que guiam cada etapa do nosso processo, da seleção à sua xícara
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center group">
                <div className="w-16 h-16 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                  Sustentabilidade
                </h3>
                <p className="text-coffee-gray leading-relaxed">
                  Trabalhamos com produtores que respeitam o meio ambiente e práticas 
                  sustentáveis, garantindo um futuro melhor para o café.
                </p>
              </div>

              <div className="card text-center group">
                <div className="w-16 h-16 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                  Qualidade Excepcional
                </h3>
                <p className="text-coffee-gray leading-relaxed">
                  Cada lote é cuidadosamente selecionado e avaliado, garantindo que apenas 
                  cafés com pontuação SCA acima de 80 pontos cheguem até você.
                </p>
              </div>

              <div className="card text-center group">
                <div className="w-16 h-16 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-4">
                  Comércio Justo
                </h3>
                <p className="text-coffee-gray leading-relaxed">
                  Valorizamos cada produtor parceiro, garantindo preços justos e 
                  relacionamentos duradouros que beneficiam toda a cadeia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Processo de Produção */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
                Nosso <span className="text-coffee-gold">Processo</span>
              </h2>
              <p className="text-coffee-gray text-lg max-w-2xl mx-auto">
                Da fazenda à sua xícara, cada etapa é cuidadosamente controlada para garantir excelência
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-coffee-gold/10 border-2 border-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🌾</span>
                </div>
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                  Seleção Premium
                </h3>
                <p className="text-coffee-gray text-sm">
                  Parceria direta com produtores selecionados, visitando fazendas e 
                  avaliando cada lote cuidadosamente.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-coffee-gold/10 border-2 border-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔥</span>
                </div>
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                  Torrefação Artesanal
                </h3>
                <p className="text-coffee-gray text-sm">
                  Torrefação sob medida para cada origem, realçando as características 
                  únicas de sabor e aroma.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-coffee-gold/10 border-2 border-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                  Certificação SCA
                </h3>
                <p className="text-coffee-gray text-sm">
                  Avaliação rigorosa seguindo protocolos da Specialty Coffee Association, 
                  garantindo pontuação superior.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-coffee-gold/10 border-2 border-coffee-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-3">
                  Entrega Expressa
                </h3>
                <p className="text-coffee-gray text-sm">
                  Embalagem a vácuo e envio rápido para preservar o frescor e 
                  qualidade até sua mesa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="bg-coffee-intense py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-cormorant font-bold text-5xl text-coffee-gold mb-2">
                  1000+
                </div>
                <div className="text-coffee-white/80 font-medium">
                  Clientes Satisfeitos
                </div>
              </div>
              
              <div>
                <div className="font-cormorant font-bold text-5xl text-coffee-gold mb-2">
                  50+
                </div>
                <div className="text-coffee-white/80 font-medium">
                  Variedades de Café
                </div>
              </div>
              
              <div>
                <div className="font-cormorant font-bold text-5xl text-coffee-gold mb-2">
                  85+
                </div>
                <div className="text-coffee-white/80 font-medium">
                  Pontuação Média SCA
                </div>
              </div>
              
              <div>
                <div className="font-cormorant font-bold text-5xl text-coffee-gold mb-2">
                  15+
                </div>
                <div className="text-coffee-white/80 font-medium">
                  Produtores Parceiros
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-cormorant font-bold text-4xl text-coffee-intense mb-6">
              Faça Parte da Nossa <span className="text-coffee-gold">História</span>
            </h2>
            <p className="text-coffee-gray text-lg mb-8 leading-relaxed">
              Descubra o sabor autêntico dos melhores cafés especiais do Brasil. 
              Cada xícara é uma jornada única de sabor e qualidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/marketplace" className="btn-primary px-8 py-3 text-lg">
                Explorar Cafés
              </a>
              <a href="/contact" className="btn-secondary px-8 py-3 text-lg">
                Entre em Contato
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage; 