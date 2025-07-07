import { AlertCircle, Check, Star, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import reviewsAPI from '../../services/reviewsAPI';

const ReviewForm = ({ 
  productId, 
  userId, 
  existingReview = null, 
  onReviewSubmitted, 
  onReviewUpdated, 
  onReviewDeleted 
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: '',
    wouldRecommend: false,
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  // Preencher formulário se existir avaliação
  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating || 0,
        title: existingReview.title || '',
        comment: existingReview.comment || '',
        pros: existingReview.pros || '',
        cons: existingReview.cons || '',
        wouldRecommend: existingReview.would_recommend || false,
        images: existingReview.images || []
      });
    }
  }, [existingReview]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar mensagens ao editar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleStarClick = (rating) => {
    handleInputChange('rating', rating);
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages = [];

    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Imagem muito grande. Máximo 5MB por arquivo.');
        }

        const result = await reviewsAPI.uploadReviewImage(file);
        if (result.success) {
          newImages.push(result.data.url);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

    } catch (err) {
      setError(err.message || 'Erro ao fazer upload das imagens');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (formData.rating === 0) {
      setError('Por favor, selecione uma classificação');
      return false;
    }

    if (!formData.title.trim()) {
      setError('Por favor, adicione um título para sua avaliação');
      return false;
    }

    if (!formData.comment.trim()) {
      setError('Por favor, escreva um comentário sobre o produto');
      return false;
    }

    if (formData.comment.length < 10) {
      setError('O comentário deve ter pelo menos 10 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: formData.pros.trim(),
        cons: formData.cons.trim(),
        would_recommend: formData.wouldRecommend,
        images: formData.images,
        user_id: userId
      };

      let result;
      if (existingReview) {
        result = await reviewsAPI.updateReview(existingReview.id, reviewData);
        if (result.success) {
          setSuccess('Avaliação atualizada com sucesso!');
          onReviewUpdated && onReviewUpdated();
        }
      } else {
        result = await reviewsAPI.createReview(productId, reviewData);
        if (result.success) {
          setSuccess('Avaliação enviada com sucesso!');
          onReviewSubmitted && onReviewSubmitted();
          // Limpar formulário
          setFormData({
            rating: 0,
            title: '',
            comment: '',
            pros: '',
            cons: '',
            wouldRecommend: false,
            images: []
          });
        }
      }

      if (!result.success) {
        throw new Error(result.error || 'Erro ao salvar avaliação');
      }

    } catch (err) {
      setError(err.message || 'Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    if (!window.confirm('Tem certeza que deseja excluir sua avaliação?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await reviewsAPI.deleteReview(existingReview.id);
      if (result.success) {
        setSuccess('Avaliação excluída com sucesso!');
        onReviewDeleted && onReviewDeleted();
      } else {
        throw new Error(result.error || 'Erro ao excluir avaliação');
      }
    } catch (err) {
      setError(err.message || 'Erro ao excluir avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h3 className="review-form-title">
        {existingReview ? 'Editar Avaliação' : 'Avaliar Produto'}
      </h3>

      {error && (
        <div className="review-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="review-success">
          <Check size={16} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Classificação */}
        <div className="review-form-field">
          <label className="review-form-label">
            Classificação *
          </label>
          <div className="star-rating large">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`star hoverable ${i < formData.rating ? 'filled' : ''}`}
                onClick={() => handleStarClick(i + 1)}
              />
            ))}
          </div>
          <span className="review-rating-text">
            {formData.rating > 0 ? `${formData.rating} estrela${formData.rating > 1 ? 's' : ''}` : 'Clique para avaliar'}
          </span>
        </div>

        {/* Título */}
        <div className="review-form-field">
          <label className="review-form-label">
            Título da Avaliação *
          </label>
          <input
            type="text"
            className="review-form-input"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Resumo da sua experiência"
            maxLength={100}
            required
          />
          <small className="review-form-help">
            {formData.title.length}/100 caracteres
          </small>
        </div>

        {/* Comentário */}
        <div className="review-form-field">
          <label className="review-form-label">
            Comentário *
          </label>
          <textarea
            className="review-form-textarea"
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            placeholder="Conte-nos sobre sua experiência com o produto..."
            rows={4}
            maxLength={1000}
            required
          />
          <small className="review-form-help">
            {formData.comment.length}/1000 caracteres
          </small>
        </div>

        {/* Prós e Contras */}
        <div className="review-form-pros-cons">
          <div className="review-form-field">
            <label className="review-form-label">
              Pontos Positivos
            </label>
            <textarea
              className="review-form-textarea"
              value={formData.pros}
              onChange={(e) => handleInputChange('pros', e.target.value)}
              placeholder="O que você mais gostou..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="review-form-field">
            <label className="review-form-label">
              Pontos Negativos
            </label>
            <textarea
              className="review-form-textarea"
              value={formData.cons}
              onChange={(e) => handleInputChange('cons', e.target.value)}
              placeholder="O que poderia ser melhor..."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        {/* Recomendação */}
        <div className="review-form-checkbox">
          <input
            type="checkbox"
            id="wouldRecommend"
            checked={formData.wouldRecommend}
            onChange={(e) => handleInputChange('wouldRecommend', e.target.checked)}
          />
          <label htmlFor="wouldRecommend">
            Eu recomendaria este produto para outras pessoas
          </label>
        </div>

        {/* Upload de Imagens */}
        <div className="review-form-field">
          <label className="review-form-label">
            Imagens (opcional)
          </label>
          <div className="review-form-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(Array.from(e.target.files))}
              disabled={uploadingImages}
              style={{ display: 'none' }}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="review-form-upload-button">
              <Upload size={16} />
              {uploadingImages ? 'Enviando...' : 'Adicionar Imagens'}
            </label>
          </div>

          {/* Preview das Imagens */}
          {formData.images.length > 0 && (
            <div className="review-images-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="review-image-preview">
                  <img src={image} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="review-image-remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="review-form-actions">
          {existingReview && (
            <button
              type="button"
              onClick={handleDelete}
              className="review-form-button secondary"
              disabled={loading}
            >
              Excluir Avaliação
            </button>
          )}

          <button
            type="submit"
            className="review-form-button primary"
            disabled={loading || uploadingImages}
          >
            {loading ? 'Salvando...' : existingReview ? 'Atualizar' : 'Publicar Avaliação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;