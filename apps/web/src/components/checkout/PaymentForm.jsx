import React, { useState, useEffect } from 'react';
import { mercadoPagoAPI } from '../../services/mercadopago-api';
import './PaymentForm.css';

const PaymentForm = ({ onNext, onBack, initialData, loading, orderTotal, orderData }) => {
  // Calcular total do pedido
  const calculatedTotal = orderTotal || orderData?.total || 0;
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || '');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: 1,
    ...initialData?.cardData
  });
  const [pixData, setPixData] = useState({
    cpf: '',
    ...initialData?.pixData
  });
  const [errors, setErrors] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Carregar métodos de pagamento disponíveis
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await mercadoPagoAPI.getTransparentPaymentMethods();
        if (response.success) {
          setPaymentMethods(response.payment_methods || []);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar métodos de pagamento:', error);
      }
    };

    loadPaymentMethods();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setErrors({});
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Remover erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiry = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    
    return 'unknown';
  };

  const generateInstallmentOptions = (total) => {
    const options = [];
    const maxInstallments = 12;
    
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = total / i;
      const fee = i > 1 ? 0.025 : 0; // 2.5% fee for installments > 1
      const totalWithFee = total * (1 + fee);
      const installmentWithFee = totalWithFee / i;
      
      options.push({
        value: i,
        label: i === 1 
          ? `1x de ${formatPrice(installmentValue)} sem juros`
          : `${i}x de ${formatPrice(installmentWithFee)} ${fee > 0 ? 'com juros' : 'sem juros'}`,
        total: totalWithFee
      });
    }
    
    return options;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Selecione um método de pagamento';
    }

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardData.number.replace(/\s/g, '')) {
        newErrors.number = 'Número do cartão é obrigatório';
      } else if (cardData.number.replace(/\s/g, '').length < 13) {
        newErrors.number = 'Número do cartão inválido';
      }

      if (!cardData.name.trim()) {
        newErrors.name = 'Nome do portador é obrigatório';
      }

      if (!cardData.expiry) {
        newErrors.expiry = 'Data de validade é obrigatória';
      } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        newErrors.expiry = 'Data de validade inválida (MM/AA)';
      } else {
        const [month, year] = cardData.expiry.split('/');
        const currentDate = new Date();
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        
        if (expiryDate < currentDate) {
          newErrors.expiry = 'Cartão expirado';
        }
      }

      if (!cardData.cvv) {
        newErrors.cvv = 'CVV é obrigatório';
      } else if (cardData.cvv.length < 3) {
        newErrors.cvv = 'CVV inválido';
      }
    }

    if (paymentMethod === 'pix') {
      if (!pixData.cpf.replace(/\D/g, '')) {
        newErrors.pixCpf = 'CPF é obrigatório para PIX';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessingPayment(true);
    setPaymentResult(null);
    setErrors({});

    try {

      // Preparar dados do pedido
      const orderPaymentData = {
        order_id: orderData?.id || '1', // Simular ID do pedido
        order_number: orderData?.order_number || 'MC' + Date.now(),
        amount: calculatedTotal,
      };

      // Preparar dados do pagador
      const payerData = {
        email: initialData?.email || 'test@example.com',
        first_name: initialData?.firstName || 'Cliente',
        last_name: initialData?.lastName || 'Teste',
        doc_number: pixData.cpf.replace(/\D/g, '') || '12345678901',
      };

      let result;

      switch (paymentMethod) {
        case 'pix':
          result = await mercadoPagoAPI.processPayment('pix', {
            ...payerData,
            pixData,
          }, orderPaymentData);
          break;

        case 'credit_card':
        case 'debit_card':
          result = await mercadoPagoAPI.processPayment(paymentMethod, {
            ...payerData,
            cardData,
          }, orderPaymentData);
          break;

        case 'boleto':
          result = await mercadoPagoAPI.processPayment('boleto', {
            ...payerData,
          }, orderPaymentData);
          break;

        default:
          throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
      }

      if (result?.success) {
        setPaymentResult(result);
        
        // Passar resultado para próxima etapa
        const paymentData = {
          paymentMethod,
          paymentResult: result,
          ...(paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? { cardData } : {}),
          ...(paymentMethod === 'pix' ? { pixData, pixResult: result } : {}),
          ...(paymentMethod === 'boleto' ? { boletoResult: result } : {}),
        };
        
        onNext(paymentData);
      } else {
        throw new Error(result?.error || 'Falha no processamento do pagamento');
      }

    } catch (error) {
      console.error('❌ Erro no processamento do pagamento:', error);
      setErrors({
        general: error.message || 'Erro no processamento do pagamento. Tente novamente.'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const installmentOptions = generateInstallmentOptions(calculatedTotal);

  return (
    <div className="payment-form">
      <h2>Forma de Pagamento</h2>
      <p className="step-description">
        Escolha a forma de pagamento que preferir para finalizar sua compra.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="payment-methods">
          <div className="payment-method-grid">
            <div 
              className={`payment-option ${paymentMethod === 'pix' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('pix')}
            >
              <div className="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
              </div>
              <div className="payment-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <div className="payment-info">
                <h3>PIX</h3>
                <p>Pagamento instantâneo</p>
                <span className="discount-badge">5% de desconto</span>
              </div>
            </div>

            <div 
              className={`payment-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('credit_card')}
            >
              <div className="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
              </div>
              <div className="payment-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div className="payment-info">
                <h3>Cartão de Crédito</h3>
                <p>Até 12x com juros</p>
              </div>
            </div>

            <div 
              className={`payment-option ${paymentMethod === 'debit_card' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('debit_card')}
            >
              <div className="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="debit_card"
                  checked={paymentMethod === 'debit_card'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
              </div>
              <div className="payment-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div className="payment-info">
                <h3>Cartão de Débito</h3>
                <p>Débito à vista</p>
              </div>
            </div>

            <div 
              className={`payment-option ${paymentMethod === 'boleto' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('boleto')}
            >
              <div className="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="boleto"
                  checked={paymentMethod === 'boleto'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
              </div>
              <div className="payment-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <div className="payment-info">
                <h3>Boleto Bancário</h3>
                <p>Vencimento em 3 dias</p>
              </div>
            </div>
          </div>
        </div>

        {errors.paymentMethod && (
          <div className="error-message">{errors.paymentMethod}</div>
        )}

        {errors.general && (
          <div className="error-message general-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {errors.general}
          </div>
        )}

        {/* PIX Form */}
        {paymentMethod === 'pix' && (
          <div className="payment-details">
            <h3>Dados do PIX</h3>
            <div className="pix-info">
              <div className="pix-discount">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span>Pagando via PIX você ganha 5% de desconto!</span>
              </div>
              <div className="total-with-discount">
                <span>Total com desconto: {formatPrice(calculatedTotal * 0.95)}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="pixCpf">CPF para emissão da cobrança</label>
              <input
                type="text"
                id="pixCpf"
                value={pixData.cpf}
                onChange={(e) => setPixData(prev => ({ ...prev, cpf: e.target.value }))}
                className={errors.pixCpf ? 'error' : ''}
                placeholder="000.000.000-00"
              />
              {errors.pixCpf && <span className="error-message">{errors.pixCpf}</span>}
            </div>
          </div>
        )}

        {/* Card Form */}
        {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
          <div className="payment-details">
            <h3>Dados do Cartão</h3>
            
            <div className="form-group">
              <label htmlFor="cardNumber">Número do Cartão</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  id="cardNumber"
                  name="number"
                  value={cardData.number}
                  onChange={handleCardInputChange}
                  className={errors.number ? 'error' : ''}
                  placeholder="0000 0000 0000 0000"
                  maxLength="19"
                />
                <div className={`card-type ${getCardType(cardData.number)}`}>
                  {getCardType(cardData.number) !== 'unknown' && (
                    <span className="card-brand">{getCardType(cardData.number)}</span>
                  )}
                </div>
              </div>
              {errors.number && <span className="error-message">{errors.number}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cardName">Nome no Cartão</label>
              <input
                type="text"
                id="cardName"
                name="name"
                value={cardData.name}
                onChange={handleCardInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Nome como impresso no cartão"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Validade</label>
                <input
                  type="text"
                  id="cardExpiry"
                  name="expiry"
                  value={cardData.expiry}
                  onChange={handleCardInputChange}
                  className={errors.expiry ? 'error' : ''}
                  placeholder="MM/AA"
                  maxLength="5"
                />
                {errors.expiry && <span className="error-message">{errors.expiry}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cardCvv">CVV</label>
                <input
                  type="text"
                  id="cardCvv"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  className={errors.cvv ? 'error' : ''}
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="form-group">
                <label htmlFor="installments">Parcelamento</label>
                <select
                  id="installments"
                  name="installments"
                  value={cardData.installments}
                  onChange={handleCardInputChange}
                >
                  {installmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Boleto Info */}
        {paymentMethod === 'boleto' && (
          <div className="payment-details">
            <h3>Boleto Bancário</h3>
            <div className="boleto-info">
              <div className="info-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>Vencimento em 3 dias úteis</span>
              </div>
              <div className="info-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                <span>Boleto será enviado por email</span>
              </div>
              <div className="info-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                  <path d="M3 12c1 0 3-1-3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                </svg>
                <span>Processamento após confirmação do pagamento</span>
              </div>
            </div>
          </div>
        )}

        <div className="security-info">
          <div className="security-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Seus dados estão protegidos com criptografia SSL</span>
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
            type="submit"
            className="btn btn-primary"
            disabled={!paymentMethod || processingPayment}
          >
            {processingPayment ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" className="spin">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                Processando pagamento...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                </svg>
                Finalizar Compra
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;