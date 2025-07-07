import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { reviewsAPI } from '../../services/reviewsAPI';
import FeaturedReviews from './FeaturedReviews';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ReviewStats from './ReviewStats';
import './ReviewSystem.css';

const ReviewSystem = ({ 
  productId: propProductId, 
  showStats = true, 
  showForm = true, 
  showFeatured = true,
  compact = false,
  maxReviews = null 
}) => {
  const { productId: paramProductId } = useParams();
  const location = useLocation();
  const productId = propProductId || paramProductId;

  // Estados principais
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');

  // Estados para controle de exibição
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Verificar se usuário está logado
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Inicializar dados
  useEffect(() => {
    if (productId) {
      initializeReviewSystem();
    }
  }, [productId, refreshTrigger]);

  // Verificar usuário logado
  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      // Verificar se há token de autenticação
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
        // Aqui você pode fazer uma chamada para obter dados do usuário
        // const userData = await userAPI.getCurrentUser();
        // setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    }
  };

  const initializeReviewSystem = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo
      const promises = [
        reviewsAPI.getProductReviews(productId, { 
          limit: maxReviews,
          approved_only: true 
        }),
        reviewsAPI.getEnhancedProductStats(productId)
      ];

      if (showFeatured) {
        promises.push(reviewsAPI.getFeaturedReviews({ limit: 6 }));
      }

      const results = await Promise.all(promises);
      
      const [reviewsResponse, statsResponse, featuredResponse] = results;

      // Processar dados das avaliações
      if (reviewsResponse.data) {
        setReviews(reviewsResponse.data.reviews || []);
        setProduct(reviewsResponse.data.product || null);
        
        // Verificar se usuário já avaliou este produto
        const existingReview = reviewsResponse.data.reviews?.find(
          review => review.user_id === currentUser?.id
        );
        setUserReview(existingReview || null);
      }

      // Processar estatísticas
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Processar avaliações em destaque
      if (featuredResponse && featuredResponse.data) {
        setFeaturedReviews(featuredResponse.data.reviews || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de avaliações:', error);
      setError('Erro ao carregar avaliações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = async (newReview) => {
    // Atualizar lista de avaliações
    setReviews(prev => [newReview, ...prev]);
    setUserReview(newReview);
    setShowReviewForm(false);
    
    // Trigger refresh para atualizar estatísticas
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      )
    );
    setUserReview(updatedReview);
  };

  const handleReviewDeleted = (deletedReviewId) => {
    setReviews(prev => prev.filter(review => review.id !== deletedReviewId));
    if (userReview?.id === deletedReviewId) {
      setUserReview(null);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const handleVoteHelpful = async (reviewId, isHelpful) => {
    try {
      await reviewsAPI.voteReviewHelpful(reviewId, { is_helpful: isHelpful });
      
      // Atualizar contadores localmente
      setReviews(prev => 
        prev.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              helpful_count: isHelpful ? review.helpful_count + 1 : review.helpful_count,
              not_helpful_count: !isHelpful ? review.not_helpful_count + 1 : review.not_helpful_count
            };
          }
          return review;
        })
      );
    } catch (error) {
      console.error('Erro ao votar em avaliação:', error);
    }
  };

  const handleCompanyResponse = async (reviewId, responseText) => {
    try {
      const response = await reviewsAPI.addCompanyResponse(reviewId, {
        response_text: responseText
      });
      
      // Atualizar review com resposta
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, company_response: response.data }
            : review
        )
      );
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
    }
  };

  const renderTabNavigation = () => {
    if (compact) return null;

    const tabs = [
      { id: 'reviews', label: 'Avaliações', count: reviews.length },
      { id: 'stats', label: 'Estatísticas', show: showStats },
      { id: 'featured', label: 'Destaques', show: showFeatured && featuredReviews.length > 0 }
    ];

    return (
      <div className="review-system-tabs">
        {tabs.map(tab => (
          tab.show !== false && (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="tab-count">({tab.count})</span>
              )}
            </button>
          )
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="review-system-loading">
          <div className="loading-spinner"></div>
          <p>Carregando avaliações...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="review-system-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (compact) {
      return (
        <div className="review-system-compact">
          {showStats && stats && (
            <div className="compact-stats">
              <ReviewStats stats={stats} compact={true} />
            </div>
          )}
          <div className="compact-reviews">
            <ReviewList
              reviews={reviews.slice(0, 3)}
              onVoteHelpful={handleVoteHelpful}
              onCompanyResponse={handleCompanyResponse}
              onReviewUpdated={handleReviewUpdated}
              onReviewDeleted={handleReviewDeleted}
              compact={true}
            />
            {reviews.length > 3 && (
              <button 
                className="view-all-button"
                onClick={() => setActiveTab('reviews')}
              >
                Ver todas as {reviews.length} avaliações
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'stats':
        return stats ? (
          <ReviewStats stats={stats} />
        ) : (
          <div className="no-stats">
            <p>Estatísticas não disponíveis</p>
          </div>
        );

      case 'featured':
        return featuredReviews.length > 0 ? (
          <FeaturedReviews reviews={featuredReviews} />
        ) : (
          <div className="no-featured">
            <p>Nenhuma avaliação em destaque</p>
          </div>
        );

      default:
        return (
          <div className="reviews-tab-content">
            {/* Seção de criar avaliação */}
            {showForm && isLoggedIn && !userReview && (
              <div className="review-form-section">
                {!showReviewForm ? (
                  <button 
                    className="write-review-button"
                    onClick={() => setShowReviewForm(true)}
                  >
                    ✍️ Escrever Avaliação
                  </button>
                ) : (
                  <ReviewForm
                    productId={productId}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}
              </div>
            )}

            {/* Seção de avaliação existente do usuário */}
            {userReview && (
              <div className="user-review-section">
                <h4>Sua Avaliação</h4>
                <ReviewList
                  reviews={[userReview]}
                  onVoteHelpful={handleVoteHelpful}
                  onReviewUpdated={handleReviewUpdated}
                  onReviewDeleted={handleReviewDeleted}
                  showUserActions={true}
                />
              </div>
            )}

            {/* Lista de avaliações */}
            <div className="reviews-list-section">
              <ReviewList
                reviews={reviews.filter(review => review.id !== userReview?.id)}
                onVoteHelpful={handleVoteHelpful}
                onCompanyResponse={handleCompanyResponse}
                onReviewUpdated={handleReviewUpdated}
                onReviewDeleted={handleReviewDeleted}
                productId={productId}
              />
            </div>
          </div>
        );
    }
  };

  if (!productId) {
    return (
      <div className="review-system-error">
        <p>ID do produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className={`review-system ${compact ? 'compact' : ''}`}>
      {/* Cabeçalho */}
      {!compact && (
        <div className="review-system-header">
          <h2>Sistema de Avaliações</h2>
          {product && (
            <div className="product-info">
              <span className="product-name">{product.name}</span>
              {stats && (
                <div className="quick-stats">
                  <span className="rating">
                    ⭐ {stats.average_rating?.toFixed(1)} ({stats.total_reviews} avaliações)
                  </span>
                  {stats.recommendation_rate > 0 && (
                    <span className="recommendation">
                      👍 {stats.recommendation_rate}% recomendam
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navegação por abas */}
      {renderTabNavigation()}

      {/* Conteúdo */}
      <div className="review-system-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReviewSystem;