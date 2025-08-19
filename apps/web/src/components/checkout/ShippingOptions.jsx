import React, { useEffect, useState } from 'react';
import { Truck, Clock, Package, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import './ShippingOptions.css';

const ShippingOptions = ({
  options,
  selected,
  onSelect,
  onNext,
  onPrev,
  onCalculate,
  loading
}) => {
  const [selectedShipping, setSelectedShipping] = useState(selected);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setSelectedShipping(selected);
    }
  }, [selected]);

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
    onSelect(option);
  };

  const handleCalculateShipping = async () => {
    if (onCalculate) {
      await onCalculate();
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
        return <Package size={20} />;
      case 'sedex':
        return <Zap size={20} />;
      case 'jadlog':
        return <Truck size={20} />;
      default:
        return <Truck size={20} />;
    }
  };

  const getShippingColor = (service) => {
    switch (service.toLowerCase()) {
      case 'pac':
        return 'from-blue-500 to-blue-600';
      case 'sedex':
        return 'from-green-500 to-green-600';
      case 'jadlog':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="shipping-options">
        <div className="options-header">
          <div className="header-icon">
            <Truck size={24} />
          </div>
          <div className="header-content">
            <h2>Opções de Frete</h2>
            <p>Calculando as melhores opções para sua entrega</p>
          </div>
        </div>
        
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p>Calculando opções de frete...</p>
          <p className="loading-subtitle">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="shipping-options">
        <div className="options-header">
          <div className="header-icon">
            <AlertCircle size={24} />
          </div>
          <div className="header-content">
            <h2>Opções de Frete</h2>
            <p>Não foi possível calcular o frete para este endereço</p>
          </div>
        </div>
        
        <div className="no-options">
          <div className="error-message">
            <AlertCircle size={48} />
            <h3>Erro no Cálculo</h3>
            <p>Verifique se o CEP está correto e tente novamente</p>
          </div>
          
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleCalculateShipping}>
              <Truck size={16} />
              Calcular Frete Novamente
            </button>
            <button className="btn btn-secondary" onClick={onPrev}>
              <Package size={16} />
              Voltar e Corrigir Endereço
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-options">
      <div className="options-header">
        <div className="header-icon">
          <Truck size={24} />
        </div>
        <div className="header-content">
          <h2>Opções de Frete</h2>
          <p>Selecione a opção de entrega que melhor atende suas necessidades</p>
        </div>
      </div>

      <div className="shipping-list">
        {options.map((option) => (
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
                id={`shipping-${option.id}`}
              />
              <label htmlFor={`shipping-${option.id}`} className="radio-label"></label>
            </div>

            <div className="option-icon">
              <div className={`icon-wrapper ${getShippingColor(option.service)}`}>
                {getShippingIcon(option.service)}
              </div>
            </div>

            <div className="option-details">
              <div className="option-header">
                <h3 className="service-name">{option.service_name}</h3>
                {option.price === 0 && (
                  <span className="free-badge">GRÁTIS</span>
                )}
              </div>
              
              <div className="delivery-info">
                <div className="delivery-time">
                  <Clock size={16} />
                  <span>Entrega em {formatDeliveryTime(option.delivery_time)}</span>
                </div>
                
                <div className="service-features">
                  {option.service === 'PAC' && (
                    <span className="feature-tag economy">• Econômico</span>
                  )}
                  {option.service === 'SEDEX' && (
                    <span className="feature-tag fast">• Rápido</span>
                  )}
                  {option.service === 'JADLOG' && (
                    <span className="feature-tag premium">• Premium</span>
                  )}
                </div>
              </div>

              {option.description && (
                <p className="option-description">{option.description}</p>
              )}
            </div>

            <div className="option-price">
              <span className="price">
                {option.price === 0 ? 'Grátis' : formatPrice(option.price)}
              </span>
              {option.price > 0 && (
                <span className="price-note">por pedido</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="delivery-info-box">
        <div className="info-header">
          <Package size={20} />
          <h3>Informações de Entrega</h3>
        </div>
        
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">
              <Clock size={16} />
            </div>
            <div className="info-content">
              <h4>Horário de Entrega</h4>
              <p>Segunda a sexta-feira, das 8h às 18h</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <CheckCircle size={16} />
            </div>
            <div className="info-content">
              <h4>Rastreamento</h4>
              <p>Código de rastreamento enviado por email</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <Truck size={16} />
            </div>
            <div className="info-content">
              <h4>Segurança</h4>
              <p>Entrega com assinatura e comprovante</p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onPrev}
        >
          <Package size={16} />
          Voltar
        </button>
        
        <button 
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!selectedShipping}
        >
          <Truck size={16} />
          Continuar para Pagamento
        </button>
      </div>
    </div>
  );
};

export default ShippingOptions;