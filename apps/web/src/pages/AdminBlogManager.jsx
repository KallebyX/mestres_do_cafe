import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, 
  Calendar, User, Tag, BarChart3, Save, X, Image, Globe, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getAllBlogPostsAdmin, 
  getBlogCategories, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost 
} from "../lib/api.js"

const AdminBlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    featured_image: '',
    status: 'draft',
    seo_title: '',
    seo_description: '',
    is_featured: false
  });

  useEffect(() => {
    if (user && hasPermission('admin')) {
      loadBlogData();
    }
  }, [user, hasPermission]);

  const loadBlogData = async () => {
    setLoading(true);
    try {
      // Carregar posts reais do Supabase
      const [postsResult, categoriesResult] = await Promise.all([
        getAllBlogPostsAdmin(),
        getBlogCategories()
      ]);

      if (postsResult.success) {
        console.log('✅ Posts carregados:', postsResult.data.length);
        setPosts(postsResult.data);
      } else {
        console.error('Erro ao carregar posts:', postsResult.error);
      }

      if (categoriesResult.success) {
        const categoriesWithColors = categoriesResult.data.map((cat, index) => ({
          ...cat,
          color: ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800', 'bg-red-100 text-red-800'][index % 5]
        }));
        setCategories(categoriesWithColors);
      } else {
        console.error('Erro ao carregar categorias:', categoriesResult.error);
      }

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
      tags: [],
      featured_image: '',
      status: 'draft',
      seo_title: '',
      seo_description: '',
      is_featured: false
    });
    setSelectedPost(null);
    setIsEditing(false);
    setShowEditor(true);
  };

  const handleEditPost = (post) => {
    setPostForm({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      category: post.category || '',
      tags: post.tags || [],
      featured_image: post.featured_image || '',
      status: post.status || 'draft',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      is_featured: post.is_featured || false
    });
    setSelectedPost(post);
    setIsEditing(true);
    setShowEditor(true);
  };

  const handleSavePost = async () => {
    if (!postForm.title || !postForm.content) {
      alert('Título e conteúdo são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      let result;
      
      if (isEditing) {
        result = await updateBlogPost(selectedPost.id, postForm);
      } else {
        result = await createBlogPost(postForm);
      }

      if (result.success) {
        alert(result.message);
        setShowEditor(false);
        await loadBlogData(); // Recarregar posts
      } else {
        alert('Erro ao salvar post: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao salvar post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (post) => {
    if (window.confirm(`Tem certeza que deseja deletar o post "${post.title}"?`)) {
      try {
        const result = await deleteBlogPost(post.id);
        
        if (result.success) {
          alert(result.message);
          await loadBlogData(); // Recarregar posts
        } else {
          alert('Erro ao deletar post: ' + result.error);
        }
      } catch (error) {
        alert('Erro ao deletar post: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    
    try {
      const result = await updateBlogPost(post.id, { ...post, status: newStatus });
      
      if (result.success) {
        await loadBlogData(); // Recarregar posts
      } else {
        alert('Erro ao alterar status: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao alterar status: ' + error.message);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
          <p className="text-slate-600">Você precisa de permissões de administrador para acessar esta área.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Carregando Blog...</h2>
            <p className="text-slate-600">Aguarde um momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">📝 Gerenciador de Blog</h1>
              <p className="text-slate-600">Gerencie posts, categorias e conteúdo do blog</p>
            </div>
            <button
              onClick={handleCreatePost}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Post
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{posts.length}</p>
                <p className="text-slate-600 text-sm">Total Posts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {posts.filter(p => p.status === 'published').length}
                </p>
                <p className="text-slate-600 text-sm">Publicados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {posts.filter(p => p.status === 'draft').length}
                </p>
                <p className="text-slate-600 text-sm">Rascunhos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                <p className="text-slate-600 text-sm">Categorias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="archived">Arquivados</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Posts ({filteredPosts.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Título</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Categoria</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Visualizações</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-medium text-slate-900">{post.title}</h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{post.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {post.views_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.status === 'published'
                              ? 'text-slate-600 hover:text-yellow-600 hover:bg-yellow-50'
                              : 'text-slate-600 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={post.status === 'published' ? 'Despublicar' : 'Publicar'}
                        >
                          {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum post encontrado</h3>
              <p className="text-slate-600 mb-4">Crie seu primeiro post ou ajuste os filtros</p>
              <button
                onClick={handleCreatePost}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Criar Primeiro Post
              </button>
            </div>
          )}
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Editar Post' : 'Novo Post'}
                </h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Digite o título do post..."
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Resumo</label>
                  <textarea
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Breve descrição do post..."
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Conteúdo *</label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                    rows={12}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Escreva o conteúdo do post..."
                  />
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm({...postForm, category: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Processos">Processos</option>
                      <option value="Educação">Educação</option>
                      <option value="Mercado">Mercado</option>
                      <option value="Receitas">Receitas</option>
                      <option value="Equipamentos">Equipamentos</option>
                      <option value="Origem">Origem</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={postForm.status}
                      onChange={(e) => setPostForm({...postForm, status: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicar</option>
                    </select>
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Imagem de Destaque</label>
                  <input
                    type="url"
                    value={postForm.featured_image}
                    onChange={(e) => setPostForm({...postForm, featured_image: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="URL da imagem..."
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={postForm.is_featured}
                    onChange={(e) => setPostForm({...postForm, is_featured: e.target.checked})}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-slate-700">
                    Post em destaque
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-6 py-3 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePost}
                    disabled={saving}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Post'}
                  </button>
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