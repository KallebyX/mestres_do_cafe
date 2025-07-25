import { Award, BarChart3, MessageSquare, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import reviewsAPI from '../../services/reviewsAPI';
import FeaturedReviews from './FeaturedReviews';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ReviewStats from './ReviewStats';
import './ReviewSystem.css';

const ReviewSystem = ({ 
  productId, 
  userId, 
  isAdmin = false, 
  showForm = true, 
  theme = 'mestres-theme' 
}) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Definir tabs disponíveis
  const tabs = [
    { id: 'reviews', label: 'Avaliações', icon: MessageSquare },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
    { id: 'featured', label: 'Destaques', icon: Award }
  ];

  // Adicionar tab de formulário se habilitado
  if (showForm && userId) {
    tabs.unshift({ id: 'form', label: 'Avaliar', icon: Star });
  }

  // Carregamento inicial
  useEffect(() => {
    if (productId) {
      loadAllData();
    }
  }, [productId, refreshTrigger]);

  // Verificar se usuário já avaliou o produto
  useEffect(() => {
    if (userId && productId) {
      checkUserReview();
    }
  }, [userId, productId, refreshTrigger]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [reviewsRes, statsRes, featuredRes] = await Promise.all([
        reviewsAPI.getReviews(productId, { page: 1, limit: 10 }),
        reviewsAPI.getProductStats(productId),
        reviewsAPI.getFeaturedReviews(productId, 3)
      ]);

      // Log completo das respostas
      if (reviewsRes.success) {
        const reviewsToSet = reviewsRes.reviews || [];
        setReviews(reviewsToSet);
      }

      if (statsRes.success) {
        setStats(statsRes.data?.stats || statsRes.stats || statsRes.data || {});
      }

      if (featuredRes.success) {
        const reviews = featuredRes.data?.reviews || featuredRes.data || [];
        setFeaturedReviews(Array.isArray(reviews) ? reviews : []);
      }

    } catch (err) {
      console.error('Erro ao carregar dados das avaliações:', err);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const result = await reviewsAPI.getUserReview(productId, userId);
      if (result.success && result.data) {
        setUserReview(result.data);
      }
    } catch (err) {
      console.error('Erro ao verificar avaliação do usuário:', err);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh dos dados após submissão
    setRefreshTrigger(prev => prev + 1);
    
    // Se foi criada uma nova avaliação, mudar para a tab de avaliações
    if (activeTab === 'form') {
      setActiveTab('reviews');
    }
  };

  const handleReviewUpdated = () => {
    // Refresh dos dados após atualização
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReviewDeleted = () => {
    // Refresh dos dados após exclusão
    setRefreshTrigger(prev => prev + 1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'form':
        return (
          <ReviewForm
            productId={productId}
            userId={userId}
            existingReview={userReview}
            onReviewSubmitted={handleReviewSubmitted}
            onReviewUpdated={handleReviewUpdated}
            onReviewDeleted={handleReviewDeleted}
          />
        );

      case 'reviews':
        return (
          <ReviewList
            productId={productId}
            userId={userId}
            isAdmin={isAdmin}
            reviews={reviews}
            onReviewUpdated={handleReviewUpdated}
            onReviewDeleted={handleReviewDeleted}
          />
        );

      case 'stats':
        return (
          <ReviewStats
            productId={productId}
            stats={stats}
            loading={loading}
          />
        );

      case 'featured':
        return (
          <FeaturedReviews
            productId={productId}
            featuredReviews={featuredReviews}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  if (loading && !reviews.length) {
    return (
      <div className={`review-system ${theme}`}>
        <div className="review-loading">
          <div className="review-loading-spinner"></div>
          <p>Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`review-system ${theme}`}>
      {/* Cabeçalho com resumo rápido */}
      <div className="review-header">
        <div className="review-summary">
          <div className="review-rating-summary">
            <div className="star-rating large">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`star ${i < Math.floor(stats.average_rating || 0) ? 'filled' : ''}`}
                />
              ))}
            </div>
            <span className="review-rating-text">
              {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
              {' '}({stats.total_reviews || 0} avaliações)
            </span>
            <div style={{fontSize: '10px', color: '#999'}}>
              Reviews carregadas: {reviews.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por tabs */}
      <div className="review-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`review-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da tab ativa */}
      <div className="review-content">
        {error ? (
          <div className="review-error">
            <p>⚠️ {error}</p>
            <button 
              onClick={loadAllData}
              className="review-form-button primary"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;