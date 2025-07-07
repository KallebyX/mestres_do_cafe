import { Award, MessageCircle, Star, ThumbsUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import reviewsAPI from '../../services/reviewsAPI';

const FeaturedReviews = ({ 
  productId, 
  featuredReviews: propFeaturedReviews = [], 
  loading: propLoading = false 
}) => {
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(propLoading);
  const [error, setError] = useState('');

  useEffect(() => {
    if (propFeaturedReviews.length > 0) {
      setFeaturedReviews(propFeaturedReviews);
      setLoading(false);
    } else {
      loadFeaturedReviews();
    }
  }, [propFeaturedReviews, productId]);

  const loadFeaturedReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewsAPI.getFeaturedReviews(productId, 5);
      
      if (result.success) {
        setFeaturedReviews(result.data || []);
      } else {
        throw new Error(result.error || 'Erro ao carregar avaliações em destaque');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const renderFeaturedReview = (review, index) => {
    const isFirst = index === 0;
    
    return (
      <div 
        key={review.id} 
        className={`featured-review-card ${isFirst ? 'featured-review-highlight' : ''}`}
      >
        {/* Badge de destaque */}
        <div className="featured-review-badge">
          <Award size={16} />
          <span>Avaliação em Destaque</span>
        </div>

        {/* Cabeçalho */}
        <div className="featured-review-header">
          <div className="featured-review-user">
            <div className="featured-review-avatar">
              {review.user_avatar ? (
                <img src={review.user_avatar} alt={review.user_name} />
              ) : (
                getInitials(review.user_name || 'Usuário')
              )}
            </div>
            <div className="featured-review-user-info">
              <div className="featured-review-user-name">
                {review.user_name || 'Usuário Anônimo'}
              </div>
              <div className="featured-review-date">
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>

          <div className="featured-review-rating">
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`star ${i < review.rating ? 'filled' : ''}`}
                  size={16}
                />
              ))}
            </div>
            <span className="featured-review-rating-text">
              {review.rating}.0
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="featured-review-content">
          <h4 className="featured-review-title">{review.title}</h4>
          <p className="featured-review-text">
            {truncateText(review.comment, isFirst ? 200 : 120)}
          </p>

          {/* Prós e Contras compactos */}
          {(review.pros || review.cons) && (
            <div className="featured-review-pros-cons">
              {review.pros && (
                <div className="featured-review-pros">
                  <span className="featured-review-pros-label">✅ Prós:</span>
                  <span className="featured-review-pros-text">
                    {truncateText(review.pros, 80)}
                  </span>
                </div>
              )}
              {review.cons && (
                <div className="featured-review-cons">
                  <span className="featured-review-cons-label">❌ Contras:</span>
                  <span className="featured-review-cons-text">
                    {truncateText(review.cons, 80)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recomendação */}
          {review.would_recommend && (
            <div className="featured-review-recommendation">
              <span className="featured-review-recommendation-badge">
                ⭐ Recomenda este produto
              </span>
            </div>
          )}
        </div>

        {/* Rodapé com métricas */}
        <div className="featured-review-footer">
          <div className="featured-review-metrics">
            <div className="featured-review-metric">
              <ThumbsUp size={14} />
              <span>{review.helpful_votes || 0} acharam útil</span>
            </div>
            
            {review.company_response && (
              <div className="featured-review-metric">
                <MessageCircle size={14} />
                <span>Respondida pela empresa</span>
              </div>
            )}
          </div>

          {/* Motivo do destaque */}
          <div className="featured-review-reason">
            {review.featured_reason || 'Avaliação detalhada e útil'}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="featured-reviews">
        <div className="featured-reviews-header">
          <h3 className="featured-reviews-title">
            <Award size={20} />
            Avaliações em Destaque
          </h3>
        </div>
        
        <div className="review-loading">
          <div className="review-loading-spinner"></div>
          <p>Carregando avaliações em destaque...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="featured-reviews">
        <div className="featured-reviews-header">
          <h3 className="featured-reviews-title">
            <Award size={20} />
            Avaliações em Destaque
          </h3>
        </div>
        
        <div className="review-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (featuredReviews.length === 0) {
    return (
      <div className="featured-reviews">
        <div className="featured-reviews-header">
          <h3 className="featured-reviews-title">
            <Award size={20} />
            Avaliações em Destaque
          </h3>
        </div>
        
        <div className="featured-reviews-empty">
          <div className="featured-reviews-empty-icon">⭐</div>
          <h4>Nenhuma avaliação em destaque ainda</h4>
          <p>As melhores avaliações aparecerão aqui quando houver mais feedback dos clientes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="featured-reviews">
      <div className="featured-reviews-header">
        <h3 className="featured-reviews-title">
          <Award size={20} />
          Avaliações em Destaque
        </h3>
        <p className="featured-reviews-subtitle">
          As avaliações mais úteis e detalhadas dos nossos clientes
        </p>
      </div>

      <div className="featured-reviews-grid">
        {featuredReviews.map(renderFeaturedReview)}
      </div>

      {/* Call to Action */}
      <div className="featured-reviews-cta">
        <h4>Sua avaliação pode ser a próxima em destaque!</h4>
        <p>Escreva uma avaliação detalhada e ajude outros clientes a escolherem melhor.</p>
      </div>
    </div>
  );
};

export default FeaturedReviews;