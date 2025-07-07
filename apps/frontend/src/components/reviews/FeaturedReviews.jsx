import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner
} from 'react-bootstrap';
import {
  ArrowRight,
  CheckCircle,
  Star,
  StarFill
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { reviewsAPI } from '../../services/api';

const FeaturedReviews = ({ limit = 6, showHeader = true, showViewAll = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeaturedReviews();
  }, [limit]);

  const loadFeaturedReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getFeaturedReviews({
        per_page: limit,
        page: 1
      });
      
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      setError('Erro ao carregar avaliações em destaque');
      console.error('Erro ao carregar avaliações em destaque:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const star = index + 1;
      return (
        <span key={star} className="text-warning">
          {star <= rating ? <StarFill size={14} /> : <Star size={14} />}
        </span>
      );
    });
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando avaliações...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reviews.length === 0) {
    return null; // Não mostrar nada se não houver avaliações em destaque
  }

  return (
    <div className="featured-reviews">
      {showHeader && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="mb-1">⭐ Avaliações em Destaque</h3>
            <p className="text-muted mb-0">
              As melhores avaliações selecionadas pela nossa equipe
            </p>
          </div>
          {showViewAll && (
            <Button 
              variant="outline-primary" 
              as={Link} 
              to="/reviews"
              className="d-flex align-items-center"
            >
              Ver Todas
              <ArrowRight className="ms-1" size={16} />
            </Button>
          )}
        </div>
      )}

      <Row>
        {reviews.map((review) => (
          <Col key={review.id} md={6} lg={4} className="mb-4">
            <Card className="h-100 featured-review-card">
              <Card.Body className="d-flex flex-column">
                {/* Header com produto */}
                <div className="review-product-info mb-3">
                  <Link 
                    to={`/products/${review.product?.slug || review.product?.id}`}
                    className="text-decoration-none"
                  >
                    <h6 className="product-name mb-1 text-primary">
                      {review.product?.name}
                    </h6>
                  </Link>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rating">
                      {renderStars(review.rating)}
                    </div>
                    <Badge bg="warning" className="featured-badge">
                      ⭐ Destaque
                    </Badge>
                    {review.is_verified && (
                      <Badge bg="success" className="verified-badge">
                        <CheckCircle size={12} className="me-1" />
                        Verificada
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Título da avaliação */}
                {review.title && (
                  <h6 className="review-title mb-2">"{review.title}"</h6>
                )}

                {/* Comentário */}
                <div className="flex-fill">
                  <p className="review-excerpt mb-3">
                    {truncateText(review.comment)}
                  </p>
                </div>

                {/* Prós em destaque */}
                {review.pros && review.pros.length > 0 && (
                  <div className="review-pros mb-3">
                    <div className="d-flex flex-wrap gap-1">
                      {review.pros.slice(0, 3).map((pro, index) => (
                        <Badge key={index} bg="success" className="pro-badge">
                          👍 {pro}
                        </Badge>
                      ))}
                      {review.pros.length > 3 && (
                        <Badge bg="light" text="dark">
                          +{review.pros.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Recomendação */}
                {review.recommend !== null && (
                  <div className="recommendation mb-3">
                    <Badge 
                      bg={review.recommend ? 'success' : 'danger'}
                      className="recommendation-badge w-100"
                    >
                      {review.recommend ? '👍 Recomenda este produto' : '👎 Não recomenda'}
                    </Badge>
                  </div>
                )}

                {/* Footer com usuário e utilidade */}
                <div className="review-footer">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="reviewer-info">
                      <small className="text-muted">
                        <strong>{review.user?.name || 'Cliente'}</strong>
                      </small>
                      <br />
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </small>
                    </div>
                    <div className="helpful-stats text-end">
                      <small className="text-muted">
                        {review.helpful_count > 0 && (
                          <>
                            👍 {review.helpful_count} acha{review.helpful_count !== 1 ? 'm' : ''} útil
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Botão para ver produto */}
                <div className="mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    as={Link}
                    to={`/products/${review.product?.slug || review.product?.id}`}
                    className="w-100"
                  >
                    Ver Produto
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Call to Action */}
      {showViewAll && reviews.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-muted mb-3">
            Gostou dessas avaliações? Veja todas as nossas avaliações em destaque!
          </p>
          <Button 
            variant="primary" 
            as={Link} 
            to="/reviews/featured"
            size="lg"
          >
            Ver Todas as Avaliações em Destaque
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeaturedReviews;