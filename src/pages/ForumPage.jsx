import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Eye, User, Clock, Star, Search, Filter, PlusCircle } from 'lucide-react';

const ForumPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Todos os Tópicos', count: 247 },
    { id: 'beginners', name: 'Iniciantes', count: 89 },
    { id: 'brewing', name: 'Métodos de Preparo', count: 65 },
    { id: 'roasting', name: 'Torrefação', count: 43 },
    { id: 'business', name: 'Negócios', count: 31 },
    { id: 'equipment', name: 'Equipamentos', count: 19 }
  ];

  const topics = [
    {
      id: 1,
      title: 'Como ajustar a moagem para V60?',
      author: 'Maria Silva',
      authorLevel: 'Especialista',
      category: 'brewing',
      replies: 23,
      views: 156,
      likes: 15,
      lastActivity: '2 horas atrás',
      isSticky: false,
      hasAnswer: true,
      excerpt: 'Estou tendo dificuldades para acertar a moagem do meu café para o V60. Às vezes fica muito amargo...'
    },
    {
      id: 2,
      title: '📌 Guia Completo para Iniciantes no Café Especial',
      author: 'João Santos',
      authorLevel: 'Mestre',
      category: 'beginners',
      replies: 45,
      views: 892,
      likes: 67,
      lastActivity: '1 dia atrás',
      isSticky: true,
      hasAnswer: false,
      excerpt: 'Um guia completo para quem está começando no mundo dos cafés especiais. Tudo que você precisa saber...'
    },
    {
      id: 3,
      title: 'Diferenças entre torra clara e escura no sabor',
      author: 'Ana Costa',
      authorLevel: 'Conhecedor',
      category: 'roasting',
      replies: 18,
      views: 234,
      likes: 12,
      lastActivity: '5 horas atrás',
      isSticky: false,
      hasAnswer: true,
      excerpt: 'Gostaria de entender melhor como o nível de torra afeta o sabor final do café...'
    },
    {
      id: 4,
      title: 'Equipamentos essenciais para abrir uma cafeteria',
      author: 'Carlos Mendes',
      authorLevel: 'Especialista',
      category: 'business',
      replies: 31,
      views: 445,
      likes: 28,
      lastActivity: '3 horas atrás',
      isSticky: false,
      hasAnswer: false,
      excerpt: 'Estou planejando abrir uma cafeteria em Santa Maria e gostaria de sugestões de equipamentos...'
    },
    {
      id: 5,
      title: 'Prensa francesa vs AeroPress: qual escolher?',
      author: 'Fernanda Lima',
      authorLevel: 'Aprendiz',
      category: 'equipment',
      replies: 27,
      views: 178,
      likes: 19,
      lastActivity: '1 hora atrás',
      isSticky: false,
      hasAnswer: true,
      excerpt: 'Estou em dúvida entre comprar uma prensa francesa ou AeroPress para casa...'
    }
  ];

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level) => {
    const colors = {
      'Aprendiz': 'bg-gray-500',
      'Conhecedor': 'bg-green-500',
      'Especialista': 'bg-blue-500',
      'Mestre': 'bg-purple-500',
      'Lenda': 'bg-yellow-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-cormorant font-bold text-4xl lg:text-5xl text-coffee-intense mb-4">
              Fórum dos <span className="text-coffee-gold">Mestres</span>
            </h1>
            <p className="text-coffee-gray text-lg max-w-3xl mx-auto">
              Conecte-se com outros apaixonados por café. Compartilhe conhecimento, tire dúvidas 
              e descubra novas técnicas com nossa comunidade de especialistas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categorias */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">
                  Categorias
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeCategory === category.id
                          ? 'bg-coffee-gold text-coffee-white'
                          : 'hover:bg-coffee-cream text-coffee-gray'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm opacity-75">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="card">
                <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">
                  Estatísticas
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-coffee-gray">Total de Tópicos:</span>
                    <span className="font-semibold text-coffee-intense">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-coffee-gray">Membros Ativos:</span>
                    <span className="font-semibold text-coffee-intense">1.234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-coffee-gray">Respostas Hoje:</span>
                    <span className="font-semibold text-coffee-intense">89</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="lg:col-span-3">
              {/* Barra de busca e ações */}
              <div className="card mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-gray w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar no fórum..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense placeholder-coffee-gray focus:outline-none focus:border-coffee-gold focus:bg-coffee-white transition-all"
                    />
                  </div>
                  <button className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    <PlusCircle className="w-4 h-4" />
                    Novo Tópico
                  </button>
                </div>
              </div>

              {/* Lista de Tópicos */}
              <div className="space-y-4">
                {filteredTopics.map(topic => (
                  <div key={topic.id} className="card hover:shadow-gold transition-all duration-300">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-coffee-white" />
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {topic.isSticky && (
                              <span className="bg-coffee-gold text-coffee-white px-2 py-1 rounded-full text-xs font-bold">
                                FIXADO
                              </span>
                            )}
                            {topic.hasAnswer && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                RESOLVIDO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-coffee-gray">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {topic.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {topic.likes}
                            </div>
                          </div>
                        </div>

                        <h3 className="font-cormorant font-bold text-lg text-coffee-intense mb-2 hover:text-coffee-gold transition-colors cursor-pointer">
                          {topic.title}
                        </h3>

                        <p className="text-coffee-gray text-sm mb-3 line-clamp-2">
                          {topic.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-coffee-intense font-medium">
                              {topic.author}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs text-white font-medium ${getLevelColor(topic.authorLevel)}`}>
                              {topic.authorLevel}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-coffee-gray">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {topic.replies} respostas
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {topic.lastActivity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-coffee-gray hover:text-coffee-gold transition-colors">
                    ← Anterior
                  </button>
                  <button className="px-4 py-2 bg-coffee-gold text-coffee-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 text-coffee-gray hover:text-coffee-gold transition-colors">
                    2
                  </button>
                  <button className="px-4 py-2 text-coffee-gray hover:text-coffee-gold transition-colors">
                    3
                  </button>
                  <button className="px-4 py-2 text-coffee-gray hover:text-coffee-gold transition-colors">
                    Próximo →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA para login/registro */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-coffee rounded-xl p-8 text-center">
              <h3 className="font-cormorant font-bold text-2xl text-coffee-white mb-4">
                Junte-se à Comunidade!
              </h3>
              <p className="text-coffee-cream mb-6 max-w-2xl mx-auto">
                Faça login ou crie uma conta para participar das discussões, fazer perguntas 
                e compartilhar seu conhecimento sobre café.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/registro"
                  className="btn-primary px-8 py-3 bg-coffee-gold hover:bg-coffee-white hover:text-coffee-intense"
                >
                  Criar Conta Grátis
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary px-8 py-3 border-coffee-gold text-coffee-gold hover:bg-coffee-gold hover:text-coffee-white"
                >
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForumPage; 