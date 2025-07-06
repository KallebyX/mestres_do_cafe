import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Calendar, User, Clock, Tag, 
  ArrowLeft, Send, Trash2, Facebook, Twitter, MessageSquare, 
  Linkedin, Copy, CheckCircle 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingStates';
import { 
  getBlogPostBySlug, 
  incrementPostViews, 
  togglePostLike, 
  checkUserLiked,
  addComment,
  getPostComments,
  deleteComment,
  recordShare
} from "../lib/api"

const BlogPostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);
  
  useEffect(() => {
    if (post && user) {
      checkIfUserLiked();
    }
  }, [post, user]);
  
  const loadBlogPost = async () => {
    setLoading(true);
    try {
      const result = await getBlogPostBySlug(slug);
      
      if (result.success) {
        setPost(result.data);
        setLikesCount(result.data.likes_count || 0);
        
        // Incrementar visualizações
        await incrementPostViews(result.data.id);
        
        // Carregar comentários
        await loadComments(result.data.id);
      } else {
        console.error('Erro ao carregar post:', result.error);
        navigate('/blog');
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfUserLiked = async () => {
    if (!post || !user) return;
    
    const result = await checkUserLiked(post.id, user.id);
    if (result.success) {
      setLiked(result.liked);
    }
  };
  
  const loadComments = async (postId) => {
    const result = await getPostComments(postId);
    if (result.success) {
      setComments(result.data);
    }
  };
  
  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const result = await togglePostLike(post.id, user.id);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
    }
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    const result = await addComment(post.id, user.id, newComment.trim(), user.name || user.email);
    
    if (result.success) {
      setNewComment('');
      await loadComments(post.id);
      // Atualizar contador de comentários no post
      setPost(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
    }
    setSubmittingComment(false);
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    
    const result = await deleteComment(commentId, user.id);
    if (result.success) {
      await loadComments(post.id);
      setPost(prev => ({ ...prev, comments_count: Math.max((prev.comments_count || 0) - 1, 0) }));
    }
  };
  
  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `${post.title} - ${post.excerpt}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error('Erro ao copiar link:', err);
        }
        break;
    }
    
    // Registrar compartilhamento
    await recordShare(post.id, platform);
    setShowShareMenu(false);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">Post não encontrado</h1>
          <Link to="/blog">
            <Button variant="outline" className="border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-brand-light">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Link to="/blog">
            <Button variant="outline" className="border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
        
        {/* Artigo */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header do artigo */}
          <div className="relative">
            {post.featured_image ? (
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 flex items-center justify-center">
                <Tag className="w-20 h-20 text-brand-brown" />
              </div>
            )}
            
            <div className="absolute top-6 left-6">
              <Badge className="bg-brand-brown text-brand-light font-semibold px-4 py-2">
                <Tag className="w-3 h-3 mr-1.5" />
                {post.category}
              </Badge>
            </div>
          </div>
          
          {/* Conteúdo do artigo */}
          <div className="p-8">
            {/* Título e meta informações */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-6 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-brand-dark/80 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-brand-dark/70 mb-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-brand-brown" />
                  {post.author_name || 'Mestres do Café'}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-brand-brown" />
                  {formatDate(post.published_at || post.created_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-brand-brown" />
                  {Math.ceil((post.content?.length || 0) / 1000)} min de leitura
                </div>
              </div>
            </div>
            
            {/* Conteúdo principal */}
            <div className="prose prose-lg max-w-none mb-8">
              <div 
                className="text-brand-dark leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, '<br>') }}
              />
            </div>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-brand-dark mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-brand-brown/30 text-brand-brown">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Botões de interação */}
            <div className="border-t border-brand-brown/10 pt-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  {/* Botão de curtir */}
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className={liked ? 
                      "bg-red-500 hover:bg-red-600 text-white" : 
                      "border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light"
                    }
                  >
                    <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {likesCount} {likesCount === 1 ? 'Curtida' : 'Curtidas'}
                  </Button>
                  
                  {/* Contador de comentários */}
                  <div className="flex items-center text-brand-dark/70">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.comments_count || 0} {(post.comments_count || 0) === 1 ? 'Comentário' : 'Comentários'}
                  </div>
                </div>
                
                {/* Botão compartilhar */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-10 w-48">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Facebook className="w-4 h-4 text-blue-600" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-blue-400" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-blue-700" />
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          {copySuccess ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                          {copySuccess ? 'Copiado!' : 'Copiar Link'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
        
        {/* Seção de comentários */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-2xl font-bold text-brand-dark">
              Comentários ({post.comments_count || 0})
            </h2>
          </CardHeader>
          <CardContent>
            {/* Formulário para novo comentário */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione seu comentário..."
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-brown focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light"
                >
                  {submittingComment ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Comentar
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="mb-8 p-6 bg-brand-light/50 rounded-xl text-center">
                <p className="text-brand-dark/70 mb-4">
                  Faça login para deixar um comentário
                </p>
                <Link to="/login">
                  <Button className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Lista de comentários */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-brand-dark/60 py-8">
                  Ainda não há comentários. Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-brand-dark">{comment.user_name}</h4>
                        <p className="text-sm text-brand-dark/60">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      {user && user.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-brand-dark leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogPostDetailPage; 