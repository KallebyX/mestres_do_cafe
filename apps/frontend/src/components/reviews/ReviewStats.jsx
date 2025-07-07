import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Card,
  Col,
  ProgressBar,
  Row,
  Spinner
} from 'react-bootstrap';
import {
  Award,
  CheckCircle,
  HandThumbsUp,
  Heart,
  Star,
  StarFill
} from 'react-bootstrap-icons';
import { reviewsAPI } from '../../services/api';

const ReviewStats = ({ productId, onStatsLoad }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [productId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getEnhancedProductStats(productId);
      
      if (response.data.success) {
        setStats(response.data.stats);
        if (onStatsLoad) {
          onStatsLoad(response.data.stats);
        }
      }
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="d-flex align-items-center">
        {Array.from({ length: 5 }, (_, index) => {
          const star = index + 1;
          if (star <= fullStars) {
            return <StarFill key={star} className="text-warning" size={20} />;
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <div key={star} className="position-relative">
                <Star className="text-warning" size={20} />
                <StarFill 
                  className="text-warning position-absolute top-0 start-0" 
                  size={20}
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                />
              </div>
            );
          } else {
            return <Star key={star} className="text-muted" size={20} />;
          }
        })}
        <span className="ms-2 fw-bold fs-5">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats || stats.total_reviews === 0) return null;

    const distribution = stats.rating_distribution;
    const maxCount = Math.max(...Object.values(distribution));

    return (
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = distribution[rating.toString()] || 0;
          const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
          
          return (
            <div key={rating} className="d-flex align-items-center mb-2">
              <div className="rating-label me-2" style={{ minWidth: '60px' }}>
                <span className="me-1">{rating}</span>
                <Star className="text-warning" size={14} />
              </div>
              <div className="flex-fill me-2">
                <ProgressBar 
                  now={percentage}
                  variant={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'danger'}
                  style={{ height: '8px' }}
                />
              </div>
              <div className="count-label" style={{ minWidth: '40px', fontSize: '0.875rem' }}>
                <span className="text-muted">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStatCard = (icon, title, value, subtitle, variant = 'primary') => {
    return (
      <Card className="h-100 stat-card">
        <Card.Body className="text-center">
          <div className={`stat-icon text-${variant} mb-2`}>
            {icon}
          </div>
          <div className="stat-value">
            <h4 className="mb-1">{value}</h4>
            <h6 className="text-muted mb-0">{title}</h6>
            {subtitle && (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando estatísticas...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <Alert variant="info" className="mb-0">
            <Alert.Heading>Sem avaliações</Alert.Heading>
            <p className="mb-0">Este produto ainda não possui avaliações.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="review-stats">
      {/* Resumo Geral */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">📊 Resumo das Avaliações</h5>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="text-center">
              <div className="overall-rating">
                {renderStars(stats.average_rating)}
                <div className="mt-2">
                  <span className="text-muted">
                    Baseado em {stats.total_reviews} avaliação{stats.total_reviews !== 1 ? 'ões' : ''}
                  </span>
                </div>
              </div>
            </Col>
            <Col md={8}>
              <h6 className="mb-3">Distribuição de Notas</h6>
              {renderRatingDistribution()}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Estatísticas Detalhadas */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          {renderStatCard(
            <CheckCircle size={24} />,
            'Compras Verificadas',
            stats.verified_reviews,
            `${((stats.verified_reviews / stats.total_reviews) * 100).toFixed(1)}% do total`,
            'success'
          )}
        </Col>
        
        <Col md={3} className="mb-3">
          {renderStatCard(
            <Award size={24} />,
            'Em Destaque',
            stats.featured_reviews,
            stats.featured_reviews > 0 ? 'Selecionadas pela equipe' : 'Nenhuma selecionada',
            'warning'
          )}
        </Col>
        
        <Col md={3} className="mb-3">
          {renderStatCard(
            <HandThumbsUp size={24} />,
            'Votos Úteis',
            stats.total_helpful_votes,
            'Total de curtidas',
            'info'
          )}
        </Col>
        
        <Col md={3} className="mb-3">
          {renderStatCard(
            <Heart size={24} />,
            'Taxa de Recomendação',
            `${stats.recommendation_rate}%`,
            'dos clientes recomendam',
            stats.recommendation_rate >= 80 ? 'success' : stats.recommendation_rate >= 60 ? 'warning' : 'danger'
          )}
        </Col>
      </Row>

      {/* Insights e Badges */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">🎯 Insights do Produto</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            {stats.average_rating >= 4.5 && (
              <Badge bg="success" className="insights-badge">
                ⭐ Produto Altamente Avaliado
              </Badge>
            )}
            
            {stats.recommendation_rate >= 90 && (
              <Badge bg="success" className="insights-badge">
                💖 Altamente Recomendado
              </Badge>
            )}
            
            {stats.verified_reviews >= stats.total_reviews * 0.7 && (
              <Badge bg="info" className="insights-badge">
                ✅ Muitas Compras Verificadas
              </Badge>
            )}
            
            {stats.featured_reviews > 0 && (
              <Badge bg="warning" className="insights-badge">
                🌟 Avaliações em Destaque
              </Badge>
            )}
            
            {stats.total_helpful_votes >= stats.total_reviews && (
              <Badge bg="primary" className="insights-badge">
                👍 Avaliações Muito Úteis
              </Badge>
            )}
            
            {stats.total_reviews >= 50 && (
              <Badge bg="secondary" className="insights-badge">
                📈 Produto Popular
              </Badge>
            )}

            {/* Insights negativos */}
            {stats.average_rating < 3 && (
              <Badge bg="danger" className="insights-badge">
                ⚠️ Avaliação Baixa
              </Badge>
            )}
            
            {stats.recommendation_rate < 50 && (
              <Badge bg="danger" className="insights-badge">
                👎 Baixa Recomendação
              </Badge>
            )}
          </div>
          
          {/* Mensagem quando não há insights */}
          {stats.average_rating < 4.5 && 
           stats.recommendation_rate < 90 && 
           stats.verified_reviews < stats.total_reviews * 0.7 && 
           stats.featured_reviews === 0 && 
           stats.total_helpful_votes < stats.total_reviews && 
           stats.total_reviews < 50 && 
           stats.average_rating >= 3 && 
           stats.recommendation_rate >= 50 && (
            <p className="text-muted mb-0 fst-italic">
              Continue coletando avaliações para gerar mais insights sobre este produto.
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReviewStats;