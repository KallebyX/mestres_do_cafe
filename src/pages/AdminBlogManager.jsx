import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, 
  User, Tag, TrendingUp, Star, MessageSquare, ThumbsUp
} from 'lucide-react';
import { blogAPI, adminAPI } from '../lib/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featured_image: '',
    tags: '',
    is_published: true,
    is_featured: false
  });

  const categories = [
    'Dicas de Café',
    'Receitas',
    'Origem',
    'Equipamentos',
    'Barista',
    'Sustentabilidade',
    'Novidades',
    'Eventos'
  ];

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getBlogs();
      if (response.success) {
        setBlogs(response.blogs);
      }
    } catch (error) {
      console.error('Erro ao carregar blogs:', error);
      // Mock data para desenvolvimento
      setBlogs([
        {
          id: '1',
          title: 'Como Escolher o Café Perfeito',
          excerpt: 'Descubra as características que fazem um café ser especial...',
          category: 'Dicas de Café',
          author: 'Admin',
          created_at: '2024-01-15',
          is_published: true,
          is_featured: true,
          views: 234,
          likes: 45,
          comments_count: 12
        },
        {
          id: '2',
          title: 'Receita: Cold Brew Artesanal',
          excerpt: 'Aprenda a fazer cold brew em casa com ingredientes simples...',
          category: 'Receitas',
          author: 'Admin',
          created_at: '2024-01-10',
          is_published: true,
          is_featured: false,
          views: 189,
          likes: 32,
          comments_count: 8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingBlog) {
        const response = await adminAPI.updateBlog(editingBlog.id, formData);
        if (response.success) {
          setBlogs(blogs.map(blog => 
            blog.id === editingBlog.id ? { ...blog, ...formData } : blog
          ));
          alert('Blog atualizado com sucesso!');
        }
      } else {
        const response = await adminAPI.createBlog(formData);
        if (response.success) {
          setBlogs([response.blog, ...blogs]);
          alert('Blog criado com sucesso!');
        }
      }
      handleCloseModal();
    } catch (error) {
      alert('Erro ao salvar blog: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este blog?')) return;
    
    try {
      const response = await adminAPI.deleteBlog(id);
      if (response.success) {
        setBlogs(blogs.filter(blog => blog.id !== id));
        alert('Blog excluído com sucesso!');
      }
    } catch (error) {
      alert('Erro ao excluir blog: ' + error.message);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category: blog.category || '',
      featured_image: blog.featured_image || '',
      tags: blog.tags ? blog.tags.join(', ') : '',
      is_published: blog.is_published || true,
      is_featured: blog.is_featured || false
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      featured_image: '',
      tags: '',
      is_published: true,
      is_featured: false
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || blog.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Gerenciamento de Blog
            </h1>
            <p className="text-slate-600">
              Crie e gerencie artigos para o blog do Mestres do Café
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300"
              >
                <Plus size={20} />
                <span>Novo Blog</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando blogs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          blog.category === 'Dicas de Café' ? 'bg-blue-100 text-blue-800' :
                          blog.category === 'Receitas' ? 'bg-green-100 text-green-800' :
                          blog.category === 'Origem' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {blog.category}
                        </span>
                        {blog.is_featured && (
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                            Destaque
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          blog.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {blog.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2">{blog.title}</h3>
                      <p className="text-slate-600 mb-4 line-clamp-2">{blog.excerpt}</p>

                      <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User size={16} />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{new Date(blog.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye size={16} />
                          <span>{blog.views || 0} visualizações</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp size={16} />
                          <span>{blog.likes || 0} curtidas</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={16} />
                          <span>{blog.comments_count || 0} comentários</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBlogs.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="mx-auto text-slate-400 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum blog encontrado</h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm || categoryFilter 
                      ? 'Tente ajustar os filtros de busca' 
                      : 'Comece criando seu primeiro artigo'
                    }
                  </p>
                  {!searchTerm && !categoryFilter && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Criar Primeiro Blog
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingBlog ? 'Editar Blog' : 'Criar Novo Blog'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Digite o título do blog..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resumo *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Breve descrição do artigo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Conteúdo *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Escreva o conteúdo completo do artigo..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="café, dicas, receita (separar por vírgula)"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Publicar imediatamente</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Marcar como destaque</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
              >
                {editingBlog ? 'Atualizar' : 'Criar'} Blog
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AdminBlogManager; 