import React from 'react';
import { FileText, Coffee, Clock, Users, BookOpen } from 'lucide-react';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mb-8 shadow-lg">
              <FileText className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-medium">Blog & Conteúdo</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
              Blog do
              <span className="block text-amber-600">Mestre do Café</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed">
              Artigos, dicas, receitas e histórias sobre o universo dos cafés especiais
            </p>

            {/* Em Breve Card */}
            <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto mb-12">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900">
                  Em Breve
                </h2>
                
                <p className="text-lg text-slate-600 leading-relaxed">
                  Estamos preparando conteúdo incrível para você. 
                  Em breve, teremos artigos semanais sobre cafés especiais, técnicas e muito mais.
                </p>
                
                <div className="bg-amber-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-amber-800 mb-3">
                    O que está por vir:
                  </h3>
                  <ul className="space-y-2 text-amber-700">
                    <li className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      Guias de Preparo (Métodos e Técnicas)
                    </li>
                    <li className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      Degustação e Análise de Cafés
                    </li>
                    <li className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      Receitas e Combinações
                    </li>
                    <li className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      Histórias e Cultura do Café
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-6">
              <p className="text-slate-600 text-lg">
                Quer ser notificado quando o blog estiver disponível?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    Lista de Espera
                  </div>
                </button>
                
                <button className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5" />
                    Ver Outros Serviços
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Por que acompanhar nosso
              <span className="block text-amber-600">blog?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Conteúdo exclusivo, dicas práticas e conhecimento especializado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Conteúdo Exclusivo</h3>
              <p className="text-slate-600 leading-relaxed text-center">
                Artigos escritos por especialistas com anos de experiência no mercado de cafés especiais
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Dicas Práticas</h3>
              <p className="text-slate-600 leading-relaxed text-center">
                Técnicas e métodos que você pode aplicar em casa para melhorar sua experiência com café
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Atualizações Semanais</h3>
              <p className="text-slate-600 leading-relaxed text-center">
                Novo conteúdo toda semana para manter você sempre atualizado sobre o mundo do café
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
