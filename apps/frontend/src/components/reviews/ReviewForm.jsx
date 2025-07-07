import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row
} from 'react-bootstrap';
import {
  Camera,
  CheckCircle,
  Plus,
  Star,
  StarFill,
  X,
  XCircle
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsAPI } from '../../services/api';

const ReviewForm = ({ productId, onReviewCreated, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [],
    cons: [],
    recommend: true,
    images: []
  });
  
  const [tempPro, setTempPro] = useState('');
  const [tempCon, setTempCon] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (star) => {
    setHoveredStar(star);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const addPro = () => {
    if (tempPro.trim() && formData.pros.length < 5) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, tempPro.trim()]
      }));
      setTempPro('');
    }
  };

  const removePro = (index) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const addCon = () => {
    if (tempCon.trim() && formData.cons.length < 5) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, tempCon.trim()]
      }));
      setTempCon('');
    }
  };

  const removeCon = (index) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      setError('Máximo de 5 imagens por avaliação');
      return;
    }

    // Simular upload de imagem (aqui você integraria com serviço de upload)
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.rating === 0) {
        setError('Por favor, selecione uma avaliação');
        return;
      }

      const reviewData = {
        ...formData,
        images: formData.images.map(img => img.url) // URLs das imagens
      };

      await reviewsAPI.createReview(productId, reviewData);
      
      if (onReviewCreated) {
        onReviewCreated();
      }

      // Resetar formulário
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        pros: [],
        cons: [],
        recommend: true,
        images: []
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const star = index + 1;
      const isActive = star <= (hoveredStar || formData.rating);
      
      return (
        <span
          key={star}
          className={`star-rating ${isActive ? 'active' : ''}`}
          onMouseEnter={() => handleStarHover(star)}
          onMouseLeave={handleStarLeave}
          onClick={() => handleStarClick(star)}
        >
          {isActive ? <StarFill size={24} /> : <Star size={24} />}
        </span>
      );
    });
  };

  if (!user) {
    return (
      <Alert variant="info">
        <Alert.Heading>Faça login para avaliar</Alert.Heading>
        <p>Você precisa estar logado para deixar uma avaliação do produto.</p>
      </Alert>
    );
  }

  return (
    <Card className="review-form-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">✍️ Avaliar Produto</h5>
        {onCancel && (
          <Button variant="link" onClick={onCancel} className="p-0">
            <X size={20} />
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Avaliação por Estrelas */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Sua Avaliação *</Form.Label>
            <div className="star-rating-container">
              {renderStars()}
              <span className="ms-2 text-muted">
                {formData.rating > 0 && `${formData.rating} de 5 estrelas`}
              </span>
            </div>
          </Form.Group>

          {/* Título da Avaliação */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Título da Avaliação</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Café excelente, sabor marcante!"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={200}
            />
            <Form.Text className="text-muted">
              {formData.title.length}/200 caracteres
            </Form.Text>
          </Form.Group>

          {/* Comentário */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Comentário</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Conte sua experiência com o produto..."
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              maxLength={1000}
            />
            <Form.Text className="text-muted">
              {formData.comment.length}/1000 caracteres
            </Form.Text>
          </Form.Group>

          {/* Pontos Positivos */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <CheckCircle className="text-success me-1" size={16} />
              Pontos Positivos
            </Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Ex: Sabor equilibrado"
                value={tempPro}
                onChange={(e) => setTempPro(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                maxLength={100}
              />
              <Button 
                variant="outline-success" 
                onClick={addPro}
                disabled={!tempPro.trim() || formData.pros.length >= 5}
                className="ms-2"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="pros-list">
              {formData.pros.map((pro, index) => (
                <Badge 
                  key={index} 
                  bg="success" 
                  className="me-1 mb-1 pro-badge"
                >
                  {pro}
                  <button
                    type="button"
                    className="btn-close-badge"
                    onClick={() => removePro(index)}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
            <Form.Text className="text-muted">
              {formData.pros.length}/5 pontos positivos
            </Form.Text>
          </Form.Group>

          {/* Pontos Negativos */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <XCircle className="text-danger me-1" size={16} />
              Pontos Negativos
            </Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Ex: Preço elevado"
                value={tempCon}
                onChange={(e) => setTempCon(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                maxLength={100}
              />
              <Button 
                variant="outline-danger" 
                onClick={addCon}
                disabled={!tempCon.trim() || formData.cons.length >= 5}
                className="ms-2"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="cons-list">
              {formData.cons.map((con, index) => (
                <Badge 
                  key={index} 
                  bg="danger" 
                  className="me-1 mb-1 con-badge"
                >
                  {con}
                  <button
                    type="button"
                    className="btn-close-badge"
                    onClick={() => removeCon(index)}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
            <Form.Text className="text-muted">
              {formData.cons.length}/5 pontos negativos
            </Form.Text>
          </Form.Group>

          {/* Upload de Imagens */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <Camera className="me-1" size={16} />
              Fotos do Produto
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={formData.images.length >= 5}
            />
            {formData.images.length > 0 && (
              <div className="uploaded-images mt-2">
                <Row>
                  {formData.images.map((image) => (
                    <Col xs={6} md={4} key={image.id} className="mb-2">
                      <div className="image-preview">
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="img-fluid rounded"
                        />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => removeImage(image.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
            <Form.Text className="text-muted">
              {formData.images.length}/5 imagens
            </Form.Text>
          </Form.Group>

          {/* Recomendação */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Recomendação</Form.Label>
            <div>
              <Form.Check
                type="radio"
                name="recommend"
                id="recommend-yes"
                label="👍 Sim, eu recomendo este produto"
                checked={formData.recommend === true}
                onChange={() => setFormData(prev => ({ ...prev, recommend: true }))}
              />
              <Form.Check
                type="radio"
                name="recommend"
                id="recommend-no"
                label="👎 Não, eu não recomendo este produto"
                checked={formData.recommend === false}
                onChange={() => setFormData(prev => ({ ...prev, recommend: false }))}
              />
            </div>
          </Form.Group>

          {/* Botões */}
          <div className="d-flex justify-content-end gap-2">
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || formData.rating === 0}
            >
              {loading ? 'Enviando...' : 'Publicar Avaliação'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReviewForm;