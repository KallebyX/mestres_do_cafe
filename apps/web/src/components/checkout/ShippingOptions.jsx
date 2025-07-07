import React, { useEffect, useState } from 'react';
import './ShippingOptions.css';

const ShippingOptions = ({ 
  shippingOptions, 
  selectedOption, 
  onOptionSelect, 
  onNext, 
  onBack, 
  loading,
  couponCode,
  onCouponApply,
  couponDiscount
}) => {
  const [selectedShipping, setSelectedShipping] = useState(selectedOption);
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (selectedOption) {
      setSelectedShipping(selectedOption);
    }
  }, [selectedOption]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDeliveryTime = (days) => {
    if (days === 1) return '1 dia útil';
    return `${days} dias úteis`;
  };

  const handleShippingSelect = (option) => {
    setSelectedShipping(option);
    onOptionSelect(option);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    
    if (!couponInput.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      await onCouponApply(couponInput.trim());
    } catch (error) {
      setCouponError(error.message || 'Cupom inválido');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedShipping) {
      alert('Por favor, selecione uma opção de frete');
      return;
    }
    onNext();
  };

  const getShippingIcon = (service) => {
    switch (service.toLowerCase()) {
      case 'pac':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16,8 20,8 23,11 23,16 16,16"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      case 'sedex':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        );
      case 'jadlog':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16,8 20,8 23,11 23,16 16,16"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16,8 20,8 23,11 23,16 16,16"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="shipping-options">
        <h2>Opções de Frete</h2>
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p>Calculando opções de frete...</p>
        </div>
      </div>
    );
  }

  if (!shippingOptions || shippingOptions.length === 0) {
    return (
      <div className="shipping-options">
        <h2>Opções de Frete</h2>
        <div className="no-options">
          <p>Não foi possível calcular o frete para este endereço.</p>
          <button className="btn btn-secondary" onClick={onBack}>
            Voltar e Corrigir Endereço
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-options">
      <h2>Opções de Frete</h2>
      <p className="step-description">
        Selecione a opção de entrega que melhor atende suas necessidades.
      </p>

      <div className="shipping-list">
        {shippingOptions.map((option) => (
          <div
            key={option.id}
            className={`shipping-option ${selectedShipping?.id === option.id ? 'selected' : ''}`}
            onClick={() => handleShippingSelect(option)}
          >
            <div className="option-radio">
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedShipping?.id === option.id}
                onChange={() => handleShippingSelect(option)}
              />
            </div>

            <div className="option-icon">
              {getShippingIcon(option.service)}
            </div>

            <div className="option-details">
              <div className="option-header">
                <h3 className="service-name">{option.service_name}</h3>
                {option.price === 0 && (
                  <span className="free-badge">GRÁTIS</span>
                )}
              </div>
              
              <div className="delivery-info">
                <span className="delivery-time">
                  Entrega em {formatDeliveryTime(option.delivery_time)}
                </span>
                {option.service === 'PAC' && (
                  <span className="service-note">• Econômico</span>
                )}
                {option.service === 'SEDEX' && (
                  <span className="service-note">• Rápido</span>
                )}
              </div>

              {option.description && (
                <p className="option-description">{option.description}</p>
              )}
            </div>

            <div className="option-price">
              <span className="price">
                {option.price === 0 ? 'Grátis' : formatPrice(option.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="coupon-section">
        <h3>Cupom de Desconto</h3>
        <form onSubmit={handleCouponSubmit} className="coupon-form">
          <div className="coupon-input-group">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Digite seu cupom de desconto"
              className={couponError ? 'error' : ''}
            />
            <button 
              type="submit"
              className="btn btn-outline"
              disabled={couponLoading}
            >
              {couponLoading ? (
                <span className="loading-spinner small"></span>
              ) : (
                'Aplicar'
              )}
            </button>
          </div>
          {couponError && (
            <span className="error-message">{couponError}</span>
          )}
          {couponDiscount && (
            <div className="coupon-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
              </svg>
              Cupom aplicado! Desconto de {formatPrice(couponDiscount)}
            </div>
          )}
        </form>
      </div>

      <div className="delivery-info-box">
        <h3>Informações de Entrega</h3>
        <div className="info-grid">
          <div className="info-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Entregas de segunda a sexta-feira</span>
          </div>
          <div className="info-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span>Horário comercial: 8h às 18h</span>
          </div>
          <div className="info-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            </svg>
            <span>Rastreamento incluído</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onBack}
        >
          Voltar
        </button>
        
        <button 
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedShipping}
        >
          Continuar para Pagamento
        </button>
      </div>
    </div>
  );
};

export default ShippingOptions;