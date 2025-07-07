import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Pagination,
  Row,
  Spinner
} from 'react-bootstrap';
import {
  HandThumbsDown,
  HandThumbsDownFill,
  HandThumbsUp,
  HandThumbsUpFill,
  Star,
  StarFill,
  ThreeDotsVertical
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsAPI } from '../../services/api';

const ReviewList = ({ productId, onReviewsChange }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros e paginação
  const [filters, setFilters] = useState({
    rating: '',
    verified_only: false,
    featured_only: false,
    approved_only: true
  });
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  
  // Estados para votos
  const [votingReview, setVotingReview] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    loadReviews();
  }, [productId, filters, sortBy, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        per_page: 10,
        sort_by: sortBy,
        ...filters
      };

      // Remover parâmetros vazios
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === false) {
          delete params[key];
        }
      });

      const response = await reviewsAPI.getProductReviews(productId, params);
      
      if (response.data.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
        
        if (onReviewsChange) {
          onReviewsChange(response.data.reviews);
        }
      }
    } catch (err) {
      setError('Erro ao carregar avaliações');
      console.error('Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset página
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset página
  };

  const handleVoteReview = async (reviewId, isHelpful) => {
    if (!user) {
      setError('Você precisa estar logado para votar');
      return;
    }

    try {
      setVotingReview(reviewId);
      
      await reviewsAPI.voteReviewHelpful(reviewId, { is_helpful: isHelpful });
      
      // Atualizar votos localmente
      setUserVotes(prev => ({
        ...prev,
        [reviewId]: isHelpful
      }));
      
      // Recarregar avaliações para atualizar contadores
      await loadReviews();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao votar na avaliação');
    } finally {
      setVotingReview(null);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const star = index + 1;
      return (
        <span key={star} className="text-warning">
          {star <= rating ? <StarFill size={16} /> : <Star size={16} />}
        </span>
      );
    });
  };

  const renderReviewImage = (images) => {
    if (!images || images.length === 0) return null;
    
    return (
      <div className="review-images mt-2">
        <Row>
          {images.slice(0, 3).map((image, index) => (
            <Col xs={4} key={index}>
              <img 
                src={image} 
                alt={`Review ${index + 1}`}
                className="img-fluid rounded review-image"
                style={{ maxHeight: '80px', objectFit: 'cover' }}
              />
            </Col>
          ))}
          {images.length > 3 && (
            <Col xs={4} className="d-flex align-items-center justify-content-center">
              <Badge bg="secondary">+{images.length - 3}</Badge>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const renderReviewResponse = (responses) => {
    if (!responses || responses.length === 0) return null;
    
    return responses.map((response, index) => (
      <Card key={index} className="mt-3 ms-4 company-response">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center mb-2">
            <Badge bg="primary" className="me-2">
              Resposta da Empresa
            </Badge>
            <small className="text-muted">
              {new Date(response.created_at).toLocaleDateString('pt-BR')}
            </small>
          </div>
          <p className="mb-0">{response.response_text}</p>
        </Card.Body>
      </Card>
    ));
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="review-list">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Filtros e Ordenação */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Filtrar por:</Form.Label>
                <Form.Select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                  <option value="">Todas as notas</option>
                  <option value="5">5 estrelas</option>
                  <option value="4">4 estrelas</option>
                  <option value="3">3 estrelas</option>
                  <option value="2">2 estrelas</option>
                  <option value="1">1 estrela</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Ordenar por:</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Mais recentes</option>
                  <option value="oldest">Mais antigas</option>
                  <option value="highest_rated">Maior avaliação</option>
                  <option value="lowest_rated">Menor avaliação</option>
                  <option value="most_helpful">Mais úteis</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Label className="fw-bold">Filtros especiais:</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="checkbox"
                  id="verified-only"
                  label="Só compras verificadas"
                  checked={filters.verified_only}
                  onChange={(e) => handleFilterChange('verified_only', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  id="featured-only"
                  label="Só em destaque"
                  checked={filters.featured_only}
                  onChange={(e) => handleFilterChange('featured_only', e.target.checked)}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Avaliações */}
      {reviews.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Nenhuma avaliação encontrada</Alert.Heading>
          <p>Este produto ainda não possui avaliações ou não há avaliações que correspondam aos filtros selecionados.</p>
        </Alert>
      ) : (
        <div className="reviews-container">
          {reviews.map((review) => (
            <Card key={review.id} className="mb-3 review-card">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    {/* Header da Avaliação */}
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-3">
                        {renderStars(review.rating)}
                      </div>
                      <div className="d-flex gap-2">
                        {review.is_verified && (
                          <Badge bg="success">✓ Compra Verificada</Badge>
                        )}
                        {review.is_featured && (
                          <Badge bg="warning">⭐ Em Destaque</Badge>
                        )}
                      </div>
                    </div>

                    {/* Título */}
                    {review.title && (
                      <h6 className="review-title">{review.title}</h6>
                    )}

                    {/* Usuário e Data */}
                    <div className="review-meta mb-2">
                      <span className="fw-bold">{review.user?.name || 'Usuário'}</span>
                      <span className="text-muted ms-2">
                        em {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Comentário */}
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}

                    {/* Prós e Contras */}
                    {(review.pros?.length > 0 || review.cons?.length > 0) && (
                      <Row className="mt-3">
                        {review.pros?.length > 0 && (
                          <Col md={6}>
                            <h6 className="text-success">👍 Pontos Positivos:</h6>
                            <ul className="list-unstyled">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="text-success">• {pro}</li>
                              ))}
                            </ul>
                          </Col>
                        )}
                        {review.cons?.length > 0 && (
                          <Col md={6}>
                            <h6 className="text-danger">👎 Pontos Negativos:</h6>
                            <ul className="list-unstyled">
                              {review.cons.map((con, index) => (
                                <li key={index} className="text-danger">• {con}</li>
                              ))}
                            </ul>
                          </Col>
                        )}
                      </Row>
                    )}

                    {/* Recomendação */}
                    {review.recommend !== null && (
                      <div className="recommendation mt-2">
                        <Badge 
                          bg={review.recommend ? 'success' : 'danger'}
                          className="recommendation-badge"
                        >
                          {review.recommend ? '👍 Recomenda' : '👎 Não Recomenda'}
                        </Badge>
                      </div>
                    )}

                    {/* Imagens */}
                    {renderReviewImage(review.images)}
                  </Col>

                  <Col md={4}>
                    {/* Botões de Ação */}
                    <div className="review-actions">
                      <div className="helpful-votes">
                        <span className="text-muted d-block mb-2">Esta avaliação foi útil?</span>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant={userVotes[review.id] === true ? 'success' : 'outline-success'}
                            size="sm"
                            onClick={() => handleVoteReview(review.id, true)}
                            disabled={votingReview === review.id || !user}
                          >
                            {userVotes[review.id] === true ? <HandThumbsUpFill /> : <HandThumbsUp />}
                            <span className="ms-1">{review.helpful_count}</span>
                          </Button>
                          
                          <Button
                            variant={userVotes[review.id] === false ? 'danger' : 'outline-danger'}
                            size="sm"
                            onClick={() => handleVoteReview(review.id, false)}
                            disabled={votingReview === review.id || !user}
                          >
                            {userVotes[review.id] === false ? <HandThumbsDownFill /> : <HandThumbsDown />}
                            <span className="ms-1">{review.not_helpful_count}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Menu de Ações */}
                      {user && (
                        <Dropdown className="mt-2">
                          <Dropdown.Toggle variant="link" className="p-0">
                            <ThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item href="#/action-1">
                              Reportar Avaliação
                            </Dropdown.Item>
                            {user.id === review.user_id && (
                              <>
                                <Dropdown.Item href="#/action-2">
                                  Editar Avaliação
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item href="#/action-3" className="text-danger">
                                  Excluir Avaliação
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Resposta da Empresa */}
                {renderReviewResponse(review.responses)}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev 
              disabled={!pagination.has_prev}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            
            {Array.from({ length: pagination.pages }, (_, index) => {
              const page = index + 1;
              return (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              disabled={!pagination.has_next}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ReviewList;