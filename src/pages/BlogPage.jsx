import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, Tag, Search, ChevronRight, Heart, MessageCircle, Star, TrendingUp, BookOpen, Filter } from 'lucide-react';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Todos os Posts', count: 24, icon: BookOpen, color: 'from-slate-600 to-slate-700' },
    { id: 'coffee-knowledge', name: 'Conhecimento', count: 8, icon: '🧠', color: 'from-blue-600 to-blue-700' },
    { id: 'brewing-methods', name: 'Métodos de Preparo', count: 6, icon: '⚗️', color: 'from-emerald-600 to-emerald-700' },
    { id: 'roasting', name: 'Torrefação', count: 4, icon: '🔥', color: 'from-orange-600 to-orange-700' },
    { id: 'news', name: 'Notícias', count: 3, icon: '📰', color: 'from-purple-600 to-purple-700' },
    { id: 'recipes', name: 'Receitas', count: 3, icon: '🍽️', color: 'from-pink-600 to-pink-700' }
  ];

  const posts = [
    {
      id: 1,
      title: 'A Arte da Extração Perfeita: Guia Completo do V60',
      excerpt: 'Descubra os segredos por trás da extração perfeita com o método V60. Desde a escolha da moagem até a temperatura ideal da água.',
      author: 'Maria Santos',
      authorRole: 'Coffee Expert & Q Grader',
      authorAvatar: '👩‍🍳',
      date: '2024-01-18',
      readTime: '8 min',
      category: 'brewing-methods',
      image: '☕',
      likes: 245,
      comments: 18,
      views: 1240,
      tags: ['V60', 'Extração', 'Métodos'],
      featured: true,
      rating: 4.9
    },
    {
      id: 2,
      title: 'Torrefação Artesanal: Do Grão Verde ao Café Perfeito',
      excerpt: 'Um mergulho profundo no processo de torrefação artesanal. Como cada etapa influencia no sabor final do seu café.',
      author: 'João Oliveira',
      authorRole: 'Mestre Torrefador',
      authorAvatar: '👨‍🍳',
      date: '2024-01-15',
      readTime: '12 min',
      category: 'roasting',
      image: '🔥',
      likes: 189,
      comments: 23,
      views: 890,
      tags: ['Torrefação', 'Artesanal', 'Processo'],
      featured: true,
      rating: 4.8
    },
    {
      id: 3,
      title: '5 Receitas de Drinks de Café para o Verão',
      excerpt: 'Receitas refrescantes e deliciosas para aproveitar o café mesmo nos dias mais quentes.',
      author: 'Ana Costa',
      authorRole: 'Barista Especialista',
      authorAvatar: '👩‍💼',
      date: '2024-01-12',
      readTime: '5 min',
      category: 'recipes',
      image: '🧊',
      likes: 156,
      comments: 31,
      views: 756,
      tags: ['Receitas', 'Verão', 'Drinks'],
      featured: false,
      rating: 4.7
    },
    {
      id: 4,
      title: 'Café Especial vs Commodity: Entenda as Diferenças',
      excerpt: 'Uma análise detalhada sobre o que torna um café especial e como isso impacta em qualidade e experiência.',
      author: 'Carlos Mendes',
      authorRole: 'Consultor em Cafés Especiais',
      authorAvatar: '👨‍💼',
      date: '2024-01-10',
      readTime: '6 min',
      category: 'coffee-knowledge',
      image: '⭐',
      likes: 298,
      comments: 15,
      views: 1456,
      tags: ['Café Especial', 'Qualidade', 'SCA'],
      featured: false,
      rating: 4.9
    },
    {
      id: 5,
      title: 'Sustentabilidade na Cadeia do Café',
      excerpt: 'Como trabalhamos com produtores locais para garantir práticas sustentáveis em toda a cadeia produtiva.',
      author: 'Fernanda Lima',
      authorRole: 'Coordenadora de Sustentabilidade',
      authorAvatar: '👩‍🌾',
      date: '2024-01-08',
      readTime: '7 min',
      category: 'news',
      image: '🌱',
      likes: 167,
      comments: 9,
      views: 623,
      tags: ['Sustentabilidade', 'Produtores'],
      featured: false,
      rating: 4.6
    },
    {
      id: 6,
      title: 'Cupping: Como Degustar Café Como um Profissional',
      excerpt: 'Aprenda as técnicas de cupping usadas por profissionais para avaliar a qualidade dos cafés especiais.',
      author: 'Roberto Silva',
      authorRole: 'Q Grader Certificado',
      authorAvatar: '👨‍🔬',
      date: '2024-01-05',
      readTime: '10 min',
      category: 'coffee-knowledge',
      image: '👃',
      likes: 234,
      comments: 27,
      views: 1123,
      tags: ['Cupping', 'Degustação', 'SCA'],
      featured: false,
      rating: 4.8
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = posts.filter(post => post.featured);

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600/30 rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Conteúdo Premium</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Blog dos <span className="text-amber-400">Mestres</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Descubra técnicas exclusivas, histórias inspiradoras e conhecimento profundo 
              sobre o fascinante universo dos cafés especiais.
            </p>

            <div className="flex items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="text-sm">24 Artigos Exclusivos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="text-sm">Experts Certificados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="text-sm">Conteúdo Semanal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Search */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-600 rounded-2xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Buscar</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Pesquisar artigos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-600 rounded-2xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Categorias</h3>
                </div>
                <div className="space-y-3">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-amber-600 text-white shadow-lg scale-105'
                          : 'hover:bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {typeof category.icon === 'string' ? (
                          <span className="text-xl">{category.icon}</span>
                        ) : (
                          <category.icon className="w-5 h-5" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">{category.name}</div>
                          <div className="text-sm opacity-75">{category.count} artigos</div>
                        </div>
                        {selectedCategory === category.id && (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Newsletter Exclusiva</h3>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    Receba conteúdo premium e novidades do mundo do café especial.
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Seu melhor email"
                    className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:border-white/40"
                  />
                  <button className="w-full bg-white text-amber-600 font-semibold py-3 rounded-xl hover:bg-amber-50 transition-colors">
                    Inscrever-se Grátis
                  </button>
                  <p className="text-white/60 text-xs text-center">
                    Sem spam. Cancele quando quiser.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Posts */}
              {selectedCategory === 'all' && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                    <h2 className="text-3xl font-bold text-slate-900">Artigos em Destaque</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredPosts.map((post, index) => (
                      <article key={post.id} className={`group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${index === 0 ? 'md:scale-105' : ''}`}>
                        {/* Header */}
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-amber-50 flex items-center justify-center">
                          <div className="text-5xl transform group-hover:scale-110 transition-transform duration-500">
                            {post.image}
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <div className={`bg-gradient-to-r ${getCategoryInfo(post.category)?.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                              {getCategoryInfo(post.category)?.name}
                            </div>
                          </div>
                          
                          {/* Featured Badge */}
                          <div className="absolute top-4 right-4">
                            <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Destaque
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Author */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">
                              {post.authorAvatar}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">{post.author}</div>
                              <div className="text-slate-600 text-xs">{post.authorRole}</div>
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-slate-600">{post.rating}</span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.date).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                              </div>
                            </div>
                            
                            <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors transform hover:scale-105 flex items-center gap-2">
                              Ler Artigo
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* All Posts */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      {selectedCategory === 'all' ? 'Todos os Artigos' : getCategoryInfo(selectedCategory)?.name}
                    </h2>
                    <p className="text-slate-600">
                      {filteredPosts.length} artigo{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option>Mais Recentes</option>
                    <option>Mais Populares</option>
                    <option>Melhor Avaliados</option>
                  </select>
                </div>

                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-amber-300">
                      <div className="flex gap-6">
                        {/* Image */}
                        <div className="relative w-24 h-24 bg-gradient-to-br from-slate-100 to-amber-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                          <span className="transform group-hover:scale-110 transition-transform duration-300">
                            {post.image}
                          </span>
                          
                          {post.featured && (
                            <div className="absolute -top-2 -right-2">
                              <Star className="w-5 h-5 text-amber-500 fill-current" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Meta */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{post.authorAvatar}</span>
                              <div>
                                <div className="font-semibold text-slate-900 text-sm">{post.author}</div>
                                <div className="text-slate-600 text-xs">{post.authorRole}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-auto">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs font-medium text-slate-600">{post.rating}</span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 4).map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-amber-100 hover:text-amber-700 transition-colors">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.date).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.comments}
                              </div>
                            </div>

                            <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm flex items-center gap-2">
                              Ler Mais
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                  <button className="bg-slate-900 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors">
                    Carregar Mais Artigos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage; 