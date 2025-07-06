import React, { useState, useEffect } from 'react'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Calendar, User, ArrowRight, Tag, Edit3, Clock, Heart, MessageCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingStates'
import { getAllBlogPosts, getBlogCategories } from "@/lib/api"

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [postsResult, categoriesResult] = await Promise.all([
        getAllBlogPosts(20), // Buscar até 20 posts
        getBlogCategories()
      ]);

      if (postsResult.success) {
        setArticles(postsResult.data);
      } else {
        setError('Erro ao carregar artigos');
        console.error('Erro ao carregar posts:', postsResult.error);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      } else {
        console.error('Erro ao carregar categorias:', categoriesResult.error);
      }
    } catch (error) {
      setError('Erro ao carregar dados do blog');
      console.error('Erro ao carregar dados do blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content) => {
    if (!content) return '5 min';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min de leitura`;
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-light">
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-light">
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <Edit3 className="w-16 h-16 text-brand-brown mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">Blog dos Mestres</h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadBlogData} className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light">
                Tentar Novamente
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-light">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-16">
          <Edit3 className="w-16 h-16 text-brand-brown mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-brand-dark mb-3">Blog dos Mestres</h1>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl mx-auto">
            Artigos, dicas, novidades e curiosidades do universo do café, escritos por quem entende e ama o assunto.
          </p>
        </div>

        {/* Filtros por categoria */}
        {categories.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 
                  'bg-brand-brown hover:bg-brand-brown/90 text-brand-light' :
                  'border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light'
                }
              >
                Todas ({articles.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.name)}
                  className={selectedCategory === category.name ? 
                    'bg-brand-brown hover:bg-brand-brown/90 text-brand-light' :
                    'border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light'
                  }
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        )}

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <Edit3 className="w-16 h-16 text-brand-brown/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Nenhum artigo encontrado</h2>
            <p className="text-brand-dark/60">
              {selectedCategory === 'all' 
                ? 'Ainda não há artigos publicados.' 
                : `Não há artigos na categoria "${selectedCategory}".`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 xl:gap-10">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border border-brand-brown/10 rounded-xl group"
              >
                <CardHeader className="p-0 relative">
                  <Link to={`/blog/${article.slug}`} className="block" aria-label={`Ler artigo: ${article.title}`}>
                    {article.featured_image ? (
                      <img 
                        src={article.featured_image} 
                        alt={article.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-brand-brown/10 to-brand-brown/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Edit3 className="w-16 h-16 text-brand-brown" />
                      </div>
                    )}
                  </Link>
                  <Badge
                    variant="secondary"
                    className="absolute top-4 left-4 bg-brand-brown text-brand-light font-semibold"
                  >
                    <Tag className="w-3 h-3 mr-1.5" />
                    {article.category}
                  </Badge>
                  {article.is_featured && (
                    <Badge
                      variant="secondary"
                      className="absolute top-4 right-4 bg-amber-500 text-white font-semibold"
                    >
                      Destaque
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardTitle className="font-serif text-2xl mb-3 text-brand-dark leading-tight">
                    <Link
                      to={`/blog/${article.slug}`}
                      className="hover:text-brand-brown transition-colors duration-200"
                    >
                      {article.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-brand-dark/80 text-base mb-4 line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                  <div className="flex flex-wrap items-center text-xs text-brand-dark/70 gap-x-4 gap-y-1 mb-4">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-brand-brown" /> 
                      {article.author_name || 'Mestres do Café'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-brown" /> 
                      {formatDate(article.published_at || article.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-brown" /> 
                      {calculateReadingTime(article.content)}
                    </div>
                  </div>
                  
                  {/* Estatísticas de interação */}
                  <div className="flex items-center gap-4 text-xs text-brand-dark/60">
                    <div className="flex items-center">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {article.views_count || 0}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3.5 h-3.5 mr-1" />
                      {article.likes_count || 0}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      {article.comments_count || 0}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-brand-light/30 border-t border-brand-brown/10 mt-auto">
                  <Link
                    to={`/blog/${article.slug}`}
                    className="w-full"
                    aria-label={`Continuar lendo: ${article.title}`}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-brand-light font-semibold transition-all duration-200 bg-white"
                    >
                      Ler Artigo Completo <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default BlogPage 