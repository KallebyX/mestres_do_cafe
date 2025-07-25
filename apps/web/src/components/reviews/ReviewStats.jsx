import { Award, BarChart3, Star, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import reviewsAPI from '../../services/reviewsAPI';

const ReviewStats = ({ productId, stats: propStats = {}, loading: propLoading = false }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(propLoading);
  const [error, setError] = useState('');
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [engagementMetrics, setEngagementMetrics] = useState({});

  useEffect(() => {
    if (Object.keys(propStats).length > 0) {
      setStats(propStats);
      setLoading(false);
    } else if (productId) {
      loadStats();
    }
  }, [propStats, productId]);

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, distributionRes, engagementRes] = await Promise.all([
        reviewsAPI.getProductStats(productId),
        reviewsAPI.getRatingDistribution(productId),
        reviewsAPI.getEngagementMetrics(productId)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data.stats || {});
      }

      if (distributionRes.success && distributionRes.data) {
        setRatingDistribution(distributionRes.data.distribution || {});
      }

      if (engagementRes.success && engagementRes.data) {
        setEngagementMetrics(engagementRes.data.engagement || {});
      }

    } catch (err) {
      console.error('🔍 ReviewStats loadStats error:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0 || !value || isNaN(value) || isNaN(total)) return 0;
    return Math.round((value / total) * 100);
  };

  const getRecommendationPercentage = () => {
    if (!stats.total_reviews || stats.total_reviews === 0) return 0;
    const recommendationsCount = stats.recommendations_count || 0;
    if (!recommendationsCount) return 0;
    return Math.round((recommendationsCount / stats.total_reviews) * 100);
  };

  const getRatingColor = (rating) => {
    const colors = {
      5: '#10b981', // green
      4: '#84cc16', // lime
      3: '#f59e0b', // amber
      2: '#f97316', // orange
      1: '#ef4444'  // red
    };
    return colors[rating] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="review-stats">
        <div className="review-loading">
          <div className="review-loading-spinner"></div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-stats">
        <div className="review-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="review-stats">
      {/* Resumo Geral */}
      <div className="review-stats-summary">
        <div className="review-stats-card">
          <div className="review-stats-icon">
            <Star className="text-yellow-500" size={24} />
          </div>
          <div className="review-stats-content">
            <div className="review-stats-value">
              {(stats && stats.average_rating) ? stats.average_rating.toFixed(1) : '0.0'}
            </div>
            <div className="review-stats-label">Média Geral</div>
          </div>
        </div>

        <div className="review-stats-card">
          <div className="review-stats-icon">
            <Users className="text-blue-500" size={24} />
          </div>
          <div className="review-stats-content">
            <div className="review-stats-value">
              {(stats && stats.total_reviews) || 0}
            </div>
            <div className="review-stats-label">Total de Avaliações</div>
          </div>
        </div>

        <div className="review-stats-card">
          <div className="review-stats-icon">
            <Award className="text-purple-500" size={24} />
          </div>
          <div className="review-stats-content">
            <div className="review-stats-value">
              {stats ? getRecommendationPercentage() : 0}%
            </div>
            <div className="review-stats-label">Recomendações</div>
          </div>
        </div>

        <div className="review-stats-card">
          <div className="review-stats-icon">
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <div className="review-stats-content">
            <div className="review-stats-value">
              {(engagementMetrics && engagementMetrics.average_helpful_votes) || 0}
            </div>
            <div className="review-stats-label">Votos Úteis (Média)</div>
          </div>
        </div>
      </div>

      {/* Distribuição de Ratings */}
      <div className="review-stats-section">
        <h3 className="review-stats-title">
          <BarChart3 size={20} />
          Distribuição de Avaliações
        </h3>
        
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => {
            const data = (ratingDistribution && ratingDistribution[rating]) || { count: 0, percentage: 0 };
            const percentage = data.percentage || calculatePercentage(data.count, (stats && stats.total_reviews) || 1);
            
            
            return (
              <div key={rating} className="rating-bar">
                <div className="rating-bar-label">
                  <div className="star-rating small">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="star filled" size={12} />
                    ))}
                  </div>
                  <span>{rating}</span>
                </div>
                
                <div className="rating-bar-fill">
                  <div 
                    className="rating-bar-progress" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getRatingColor(rating)
                    }}
                  />
                </div>
                
                <div className="rating-bar-count">
                  {data.count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Métricas de Engajamento */}
      <div className="review-stats-section">
        <h3 className="review-stats-title">
          <TrendingUp size={20} />
          Métricas de Engajamento
        </h3>
        
        <div className="engagement-metrics">
          <div className="engagement-metric">
            <div className="engagement-metric-label">Avaliações com Imagens</div>
            <div className="engagement-metric-value">
              {(engagementMetrics && engagementMetrics.reviews_with_images) || 0}
              <span className="engagement-metric-percentage">
                ({calculatePercentage((engagementMetrics && engagementMetrics.reviews_with_images) || 0, (stats && stats.total_reviews) || 1)}%)
              </span>
            </div>
          </div>

          <div className="engagement-metric">
            <div className="engagement-metric-label">Avaliações Detalhadas</div>
            <div className="engagement-metric-value">
              {(engagementMetrics && engagementMetrics.detailed_reviews) || 0}
              <span className="engagement-metric-percentage">
                ({calculatePercentage((engagementMetrics && engagementMetrics.detailed_reviews) || 0, (stats && stats.total_reviews) || 1)}%)
              </span>
            </div>
          </div>

          <div className="engagement-metric">
            <div className="engagement-metric-label">Tempo Médio de Resposta</div>
            <div className="engagement-metric-value">
              {(engagementMetrics && (engagementMetrics.avg_response_time || (engagementMetrics.avg_response_time_hours ? `${engagementMetrics.avg_response_time_hours}h` : null))) || 'N/A'}
            </div>
          </div>

          <div className="engagement-metric">
            <div className="engagement-metric-label">Taxa de Resposta da Empresa</div>
            <div className="engagement-metric-value">
              {(engagementMetrics && engagementMetrics.company_response_rate) || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Insights Automatizados */}
      <div className="review-stats-section">
        <h3 className="review-stats-title">
          <Award size={20} />
          Insights do Produto
        </h3>
        
        <div className="product-insights">
          {(stats && stats.average_rating >= 4.5) && (
            <div className="insight-item positive">
              <span className="insight-icon">⭐</span>
              <span className="insight-text">Produto altamente recomendado pelos clientes</span>
            </div>
          )}

          {(stats && getRecommendationPercentage() >= 80) && (
            <div className="insight-item positive">
              <span className="insight-icon">👍</span>
              <span className="insight-text">Alta taxa de recomendação ({getRecommendationPercentage()}%)</span>
            </div>
          )}

          {(stats && stats.total_reviews >= 10) && (
            <div className="insight-item positive">
              <span className="insight-icon">📊</span>
              <span className="insight-text">Produto com muitas avaliações - dados confiáveis</span>
            </div>
          )}

          {(engagementMetrics && engagementMetrics.average_helpful_votes >= 3) && (
            <div className="insight-item positive">
              <span className="insight-icon">💬</span>
              <span className="insight-text">Avaliações consideradas úteis pela comunidade</span>
            </div>
          )}

          {(stats && stats.average_rating < 3.0 && stats.total_reviews >= 5) && (
            <div className="insight-item negative">
              <span className="insight-icon">⚠️</span>
              <span className="insight-text">Produto com avaliações abaixo da média</span>
            </div>
          )}

          {(stats && stats.total_reviews < 5) && (
            <div className="insight-item neutral">
              <span className="insight-icon">📝</span>
              <span className="insight-text">Produto novo - poucas avaliações disponíveis</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumo de Qualidade */}
      <div className="review-stats-section">
        <h3 className="review-stats-title">
          <Award size={20} />
          Score de Qualidade
        </h3>
        
        <div className="quality-score">
          <div className="quality-score-circle">
            <div className="quality-score-value">
              {(stats && stats.quality_score) || 0}
            </div>
            <div className="quality-score-label">Score</div>
          </div>
          
          <div className="quality-factors">
            <div className="quality-factor">
              <span className="quality-factor-label">Média de Estrelas</span>
              <div className="quality-factor-bar">
                <div 
                  className="quality-factor-progress" 
                  style={{ width: `${((stats && stats.average_rating) / 5) * 100 || 0}%` }}
                />
              </div>
            </div>
            
            <div className="quality-factor">
              <span className="quality-factor-label">Volume de Avaliações</span>
              <div className="quality-factor-bar">
                <div 
                  className="quality-factor-progress" 
                  style={{ width: `${Math.min(((stats && stats.total_reviews) / 100) * 100 || 0, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="quality-factor">
              <span className="quality-factor-label">Engajamento</span>
              <div className="quality-factor-bar">
                <div 
                  className="quality-factor-progress" 
                  style={{ width: `${Math.min(((engagementMetrics && engagementMetrics.average_helpful_votes) / 10) * 100 || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;