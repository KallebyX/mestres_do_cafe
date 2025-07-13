import React, { useState, useEffect } from 'react';
import { 
  X, Save, Eye, AlertCircle, Check, 
  BookOpen, Tag, Calendar, User 
} from 'lucide-react';

const BlogModal = ({ 
  isOpen, 
  onClose, 
  post = null, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    author: 'Admin',
    featured_image: '',
    tags: [],
    category: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Preencher formulário quando editar post existente
  useEffect(() => {
    if (post && isOpen) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status || 'draft',
        author: post.author || 'Admin',
        featured_image: post.featured_image || '',
        tags: post.tags || [],
        category: post.category || ''
      });
    } else if (!post && isOpen) {
      // Reset para novo post
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        author: 'Admin',
        featured_image: '',
        tags: [],
        category: ''
      });
    }
    setErrors([]);
    setShowPreview(false);
  }, [post, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.title.trim()) {
      newErrors.push('Título é obrigatório');
    }
    
    if (!formData.content.trim()) {
      newErrors.push('Conteúdo é obrigatório');
    }
    
    if (formData.content.length < 50) {
      newErrors.push('Conteúdo deve ter pelo menos 50 caracteres');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar dados
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Gerar excerpt automaticamente se não fornecido
      const finalData = {
        ...formData,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...'
      };

      let response;
      if (post?.id) {
        // Atualizar post existente
        response = await fetch(`http://localhost:5001/api/admin/blog/posts/${post.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(finalData)
        });
      } else {
        // Criar novo post
        response = await fetch('http://localhost:5001/api/admin/blog/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(finalData)
        });
      }

      const result = await response.json();

      if (result.success) {
        onSuccess && onSuccess(result.post, post ? 'updated' : 'created');
        onClose();
      } else {
        setErrors([result.error || 'Erro ao salvar post']);
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      setErrors(['Erro interno do servidor']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {post ? 'Editar Post' : 'Novo Post'}
              </h2>
              <p className="text-sm text-slate-600">
                {post ? 'Atualize as informações do post' : 'Crie um novo post para o blog'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Editar' : 'Visualizar'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Erros */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Corrija os seguintes erros:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {showPreview ? (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">{formData.title || 'Título do Post'}</h1>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {formData.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    formData.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>

                {formData.featured_image && (
                  <img 
                    src={formData.featured_image} 
                    alt="Imagem destacada" 
                    className="w-full h-48 object-cover rounded-lg mb-6"
                  />
                )}

                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {formData.content || 'Conteúdo do post...'}
                  </p>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna Principal - Conteúdo */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📝 Conteúdo do Post</h3>
                
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título do Post *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o título do post..."
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resumo (opcional)
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Resumo do post (se não preenchido, será gerado automaticamente)"
                  />
                </div>

                {/* Conteúdo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={12}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Escreva o conteúdo do post..."
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    {formData.content.length} caracteres (mínimo: 50)
                  </p>
                </div>
              </div>

              {/* Sidebar - Configurações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">⚙️ Configurações</h3>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>

                {/* Autor */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Imagem Destacada */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Imagem Destacada
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => handleInputChange('featured_image', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="URL da imagem"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nova tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {post ? 'Atualizar Post' : 'Criar Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;