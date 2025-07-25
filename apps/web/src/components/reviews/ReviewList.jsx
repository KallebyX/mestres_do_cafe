import {
  MoreHorizontal,
  Star, ThumbsUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import reviewsAPI from '../../services/reviewsAPI';

const ReviewList = ({ 
  productId, 
  userId, 
  isAdmin = false, 
  reviews: propReviews = [], 
  onReviewUpdated, 
  onReviewDeleted 
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    rating: '',
    sortBy: 'newest',
    searchTerm: ''
  });
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState({});

  // Usar reviews das props ou carregar do backend
  useEffect(() => {
    if (propReviews && propReviews.length > 0) {
      setReviews(propReviews);
    } else if (productId && (!propReviews || propReviews.length === 0)) {
      loadReviews();
    }
  }, [propReviews, productId]);

  // Carregar votos úteis para as avaliações
  useEffect(() => {
    if (reviews.length > 0) {
      loadHelpfulVotes();
    }
  }, [reviews]);

  const loadReviews = async (resetPage = false, pageOverride = null) => {
    setLoading(true);
    setError('');

    try {
      const currentPage = resetPage ? 1 : (pageOverride || page);
      const result = await reviewsAPI.getReviews(productId, {
        page: currentPage,
        limit: 10,
        rating: filters.rating,
        sort_by: filters.sortBy,
        search: filters.searchTerm
      });

      if (result.success) {
        const newReviews = result.reviews || [];
        if (resetPage) {
          setReviews(newReviews);
          setPage(1);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
        
        setHasMore(newReviews.length === 10);
      } else {
        throw new Error(result.error || 'Erro ao carregar avaliações');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHelpfulVotes = async () => {
    // TODO: Implementar quando o endpoint estiver disponível
    // const votes = {};
    //
    // for (const review of reviews) {
    //   try {
    //     const result = await reviewsAPI.getHelpfulVotes(review.id);
    //     if (result.success) {
    //       votes[review.id] = result.data;
    //     }
    //   } catch (err) {
    //     console.error('Erro ao carregar votos:', err);
    //   }
    // }
    //
    // setHelpfulVotes(votes);
    
    // Por enquanto, usar os dados já existentes nas reviews
    const votes = {};
    reviews.forEach(review => {
      votes[review.id] = {
        count: review.helpful_count || 0,
        user_has_voted: false
      };
    });
    setHelpfulVotes(votes);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Recarregar reviews com novos filtros
    setTimeout(() => {
      loadReviews(true);
    }, 300);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(false, nextPage);
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!userId) {
      alert('Você precisa estar logado para votar');
      return;
    }

    try {
      const currentVote = helpfulVotes[reviewId];
      const hasVoted = currentVote?.user_has_voted;

      if (hasVoted) {
        await reviewsAPI.removeHelpfulVote(reviewId, userId);
      } else {
        await reviewsAPI.markReviewHelpful(reviewId, userId);
      }

      // Recarregar votos
      // TODO: Implementar quando o endpoint estiver disponível
      // const result = await reviewsAPI.getHelpfulVotes(reviewId);
      // if (result.success) {
      //   setHelpfulVotes(prev => ({
      //     ...prev,
      //     [reviewId]: result.data
      //   }));
      // }
      
      // Por enquanto, apenas atualizar localmente
      setHelpfulVotes(prev => ({
        ...prev,
        [reviewId]: {
          count: hasVoted ? (prev[reviewId]?.count || 1) - 1 : (prev[reviewId]?.count || 0) + 1,
          user_has_voted: !hasVoted
        }
      }));
    } catch (err) {
      console.error('Erro ao votar:', err);
    }
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
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

  const renderReviewItem = (review) => {
    const isExpanded = expandedReviews.has(review.id);
    const voteData = helpfulVotes[review.id] || {};
    const helpfulCount = voteData.count || 0;
    const hasVoted = voteData.user_has_voted || false;

    return (
      <div key={review.id} className={`review-item ${review.is_featured ? 'featured' : ''}`}>
        <div className="review-header">
          <div className="review-user">
            <div className="review-avatar">
              {review.user?.avatar ? (
                <img src={review.user.avatar} alt={review.user?.name} />
              ) : (
                getInitials(review.user?.name || 'Usuário')
              )}
            </div>
            <div className="review-user-info">
              <div className="review-user-name">{review.user?.name || 'Usuário Anônimo'}</div>
              <div className="review-date">{formatDate(review.created_at)}</div>
            </div>
          </div>

          <div className="review-rating">
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`star ${i < review.rating ? 'filled' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="review-content">
          <h4 className="review-title">{review.title}</h4>
          
          <div className="review-text">
            {isExpanded || review.comment.length <= 200 ? (
              review.comment
            ) : (
              <>
                {review.comment.slice(0, 200)}...
                <button
                  onClick={() => toggleReviewExpansion(review.id)}
                  className="review-expand-button"
                >
                  Ver mais
                </button>
              </>
            )}
          </div>

          {isExpanded && review.comment.length > 200 && (
            <button
              onClick={() => toggleReviewExpansion(review.id)}
              className="review-expand-button"
            >
              Ver menos
            </button>
          )}

          {/* Prós e Contras */}
          {(review.pros || review.cons) && (
            <div className="review-pros-cons">
              {review.pros && (
                <div className="review-pros">
                  <div className="review-pros-title">
                    <span>✅</span>
                    Pontos Positivos
                  </div>
                  <p>{review.pros}</p>
                </div>
              )}

              {review.cons && (
                <div className="review-cons">
                  <div className="review-cons-title">
                    <span>❌</span>
                    Pontos Negativos
                  </div>
                  <p>{review.cons}</p>
                </div>
              )}
            </div>
          )}

          {/* Imagens */}
          {review.images && review.images.length > 0 && (
            <div className="review-images">
              {review.images.map((image, index) => (
                <div key={index} className="review-image">
                  <img src={image} alt={`Imagem ${index + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Recomendação */}
          {review.would_recommend && (
            <div className="review-recommendation">
              <span className="review-recommendation-badge">
                ⭐ Recomenda este produto
              </span>
            </div>
          )}
        </div>

        {/* Resposta da empresa */}
        {review.company_response && (
          <div className="review-reply">
            <div className="review-reply-header">
              <span className="review-reply-badge">Resposta da Empresa</span>
              <span className="review-reply-date">
                {formatDate(review.company_response.created_at)}
              </span>
            </div>
            <div className="review-reply-text">
              {review.company_response.response_text}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="review-actions">
          <div className="review-helpful">
            <button
              onClick={() => handleHelpfulVote(review.id)}
              className={`review-helpful-button ${hasVoted ? 'active' : ''}`}
              disabled={!userId}
            >
              <ThumbsUp size={16} />
              Útil ({helpfulCount})
            </button>
          </div>

          <div className="review-menu">
            {(userId === review.user_id || isAdmin) && (
              <button className="review-menu-button">
                <MoreHorizontal size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="review-list">
      {/* Filtros */}
      <div className="review-filters">
        <div className="review-filter">
          <label className="review-filter-label">Filtrar por:</label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="review-filter-select"
          >
            <option value="">Todas as estrelas</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
        </div>

        <div className="review-filter">
          <label className="review-filter-label">Ordenar por:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="review-filter-select"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="highest_rating">Melhor avaliação</option>
            <option value="lowest_rating">Pior avaliação</option>
            <option value="most_helpful">Mais úteis</option>
          </select>
        </div>

        <div className="review-filter">
          <input
            type="text"
            placeholder="Buscar nas avaliações..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="review-filter-input"
          />
        </div>
      </div>

      {/* Lista de avaliações */}
      {error && (
        <div className="review-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {reviews.length === 0 && !loading ? (
        <div className="review-empty">
          <div className="review-empty-icon">📝</div>
          <h3>Nenhuma avaliação ainda</h3>
          <p>Seja o primeiro a avaliar este produto!</p>
        </div>
      ) : (
        <div className="review-items">
          {Array.isArray(reviews) ? reviews.map(renderReviewItem) : null}
        </div>
      )}

      {/* Carregamento e paginação */}
      {loading && (
        <div className="review-loading">
          <div className="review-loading-spinner"></div>
          <p>Carregando avaliações...</p>
        </div>
      )}

      {hasMore && !loading && reviews.length > 0 && (
        <div className="review-load-more">
          <button
            onClick={handleLoadMore}
            className="review-form-button secondary"
          >
            Carregar mais avaliações
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;