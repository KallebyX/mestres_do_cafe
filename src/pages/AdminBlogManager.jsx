import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Edit, Trash2, Eye, Save, X, Image, 
  Calendar, User, Tag, BarChart3, TrendingUp, MessageSquare,
  Filter, Download, Upload, Settings, Clock, Globe
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminBlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  
  // Form states
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featured_image: '',
    status: 'draft',
    seo_title: '',
    seo_description: '',
    publish_date: ''
  });

  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadBlogData();
  }, [user, hasPermission, navigate]);

  const loadBlogData = async () => {
    setLoading(true);
    try {
      // Simular dados do blog
      const mockPosts = [
        {
          id: 1,
          title: 'Os Segredos da Torra Perfeita',
          excerpt: 'Descubra como o processo de torra influencia o sabor final do seu café.',
          content: 'Conteúdo completo do post sobre torra...',
          category: 'Processos',
          tags: 'torra,café,técnicas',
          author: 'Mestres do Café',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
          status: 'published',
          views: 1250,
          comments: 23,
          featured_image: '/images/torra.jpg',
          seo_title: 'Guia Completo: Torra Perfeita de Café',
          seo_description: 'Aprenda as técnicas profissionais de torra de café'
        },
        {
          id: 2,
          title: 'Café Especial: Do Grão à Xícara',
          excerpt: 'Uma jornada completa desde o plantio até o preparo do café especial.',
          content: 'Conteúdo sobre o processo completo...',
          category: 'Educação',
          tags: 'café especial,qualidade,origem',
          author: 'Mestres do Café',
          created_at: '2024-01-10',
          updated_at: '2024-01-12',
          status: 'published',
          views: 892,
          comments: 15,
          featured_image: '/images/grao-xicara.jpg',
          seo_title: 'Café Especial: Guia Completo do Grão à Xícara',
          seo_description: 'Descubra todo o processo do café especial'
        },
        {
          id: 3,
          title: 'Tendências do Mercado de Café 2024',
          excerpt: 'As principais tendências que moldarão o mercado de café este ano.',
          content: 'Análise das tendências de mercado...',
          category: 'Mercado',
          tags: 'tendências,mercado,2024',
          author: 'Mestres do Café',
          created_at: '2024-01-08',
          updated_at: '2024-01-08',
          status: 'draft',
          views: 0,
          comments: 0,
          featured_image: '/images/tendencias.jpg',
          seo_title: 'Tendências do Café 2024: O que Esperar',
          seo_description: 'Principais tendências do mercado de café para 2024'
        }
      ];

      const mockCategories = [
        { id: 1, name: 'Processos', count: 8, color: 'bg-blue-100 text-blue-800' },
        { id: 2, name: 'Educação', count: 12, color: 'bg-green-100 text-green-800' },
        { id: 3, name: 'Mercado', count: 5, color: 'bg-purple-100 text-purple-800' },
        { id: 4, name: 'Receitas', count: 15, color: 'bg-orange-100 text-orange-800' },
        { id: 5, name: 'Equipamentos', count: 7, color: 'bg-red-100 text-red-800' }
      ];

      setPosts(mockPosts);
      setCategories(mockCategories);
    } catch (error) {
      console.error('Erro ao carregar dados do blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setPostForm({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      featured_image: '',
      status: 'draft',
      seo_title: '',
      seo_description: '',
      publish_date: ''
    });
    setSelectedPost(null);
    setIsEditing(false);
    setShowEditor(true);
  };

  const handleEditPost = (post) => {
    setPostForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      featured_image: post.featured_image,
      status: post.status,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      publish_date: post.created_at
    });
    setSelectedPost(post);
    setIsEditing(true);
    setShowEditor(true);
  };

  const handleSavePost = async () => {
    try {
      if (isEditing) {
        // Atualizar post existente
        setPosts(posts.map(post => 
          post.id === selectedPost.id 
            ? { ...post, ...postForm, updated_at: new Date().toISOString() }
            : post
        ));
      } else {
        // Criar novo post
        const newPost = {
          id: Date.now(),
          ...postForm,
          author: user.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 0,
          comments: 0
        };
        setPosts([newPost, ...posts]);
      }
      setShowEditor(false);
      alert('Post salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar post: ' + error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        setPosts(posts.filter(post => post.id !== postId));
        alert('Post excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir post: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus, updated_at: new Date().toISOString() }
          : post
      ));
      alert('Status atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const exportPosts = () => {
    // Implementar exportação
    alert('Exportando posts... (funcionalidade em desenvolvimento)');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'text-gray-600 bg-gray-100 border-gray-200',
      published: 'text-green-600 bg-green-100 border-green-200',
      scheduled: 'text-blue-600 bg-blue-100 border-blue-200',
      archived: 'text-orange-600 bg-orange-100 border-orange-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Rascunho',
      published: 'Publicado',
      scheduled: 'Agendado',
      archived: 'Arquivado'
    };
    return texts[status] || status;
  };

  // Estatísticas do blog
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-slate-900">Gerenciamento do Blog</h1>
              </div>
              <p className="text-xl text-slate-600">
                Crie e gerencie conteúdo para o blog do Mestres do Café
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportPosts}
                className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handleCreatePost}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Post
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <FileText className="text-white w-6 h-6" />
              </div>
              <TrendingUp className="text-blue-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Total de Posts</h3>
            <p className="text-3xl font-bold text-blue-600">{totalPosts}</p>
            <p className="text-xs text-slate-500">{publishedPosts} publicados</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Eye className="text-white w-6 h-6" />
              </div>
              <BarChart3 className="text-green-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Total de Visualizações</h3>
            <p className="text-3xl font-bold text-green-600">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Todas as publicações</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="text-white w-6 h-6" />
              </div>
              <TrendingUp className="text-purple-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Comentários</h3>
            <p className="text-3xl font-bold text-purple-600">{totalComments}</p>
            <p className="text-xs text-slate-500">Interações dos leitores</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Tag className="text-white w-6 h-6" />
              </div>
              <Settings className="text-amber-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Categorias</h3>
            <p className="text-3xl font-bold text-amber-600">{categories.length}</p>
            <p className="text-xs text-slate-500">Organizadas por tema</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'posts', label: 'Posts', icon: FileText },
                { id: 'categories', label: 'Categorias', icon: Tag },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div>
                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="all">Todas as categorias</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Posts List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando posts...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredPosts.map(post => (
                      <div key={post.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(post.status)}`}>
                                {getStatusText(post.status)}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {post.category}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-4">{post.excerpt}</p>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{post.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views} visualizações</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.comments} comentários</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={post.status}
                              onChange={(e) => handleStatusChange(post.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-sm border-0 ${getStatusColor(post.status)}`}
                            >
                              <option value="draft">Rascunho</option>
                              <option value="published">Publicado</option>
                              <option value="scheduled">Agendado</option>
                              <option value="archived">Arquivado</option>
                            </select>
                            <button
                              onClick={() => handleEditPost(post)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Categorias do Blog</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(category => (
                    <div key={category.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-900">{category.name}</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                          {category.count} posts
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-lg transition-colors">
                          Editar
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Analytics do Blog</h3>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Analytics em desenvolvimento</h4>
                  <p className="text-slate-600">Gráficos detalhados e métricas avançadas estarão disponíveis em breve.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isEditing ? 'Editar Post' : 'Novo Post'}
                  </h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Título</label>
                    <input
                      type="text"
                      value={postForm.title}
                      onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Digite o título do post"
                    />
                  </div>

                  {/* Category and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Categoria</label>
                      <select
                        value={postForm.category}
                        onChange={(e) => setPostForm({...postForm, category: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Status</label>
                      <select
                        value={postForm.status}
                        onChange={(e) => setPostForm({...postForm, status: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="scheduled">Agendado</option>
                      </select>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Resumo</label>
                    <textarea
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Breve descrição do post"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Conteúdo</label>
                    <textarea
                      value={postForm.content}
                      onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                      rows={12}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Escreva o conteúdo do post aqui..."
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Tags</label>
                    <input
                      type="text"
                      value={postForm.tags}
                      onChange={(e) => setPostForm({...postForm, tags: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Separe as tags por vírgula"
                    />
                  </div>

                  {/* SEO Fields */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">SEO</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-700 font-medium mb-2">Título SEO</label>
                        <input
                          type="text"
                          value={postForm.seo_title}
                          onChange={(e) => setPostForm({...postForm, seo_title: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Título otimizado para SEO"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-2">Descrição SEO</label>
                        <textarea
                          value={postForm.seo_description}
                          onChange={(e) => setPostForm({...postForm, seo_description: e.target.value})}
                          rows={2}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Descrição para mecanismos de busca"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setShowEditor(false)}
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePost}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogManager; 