import React from 'react';
import './OrderSummary.css';

const OrderSummary = ({ 
  orderData, 
  onNext, 
  onBack, 
  onEdit, 
  loading 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'boleto': 'Boleto Bancário'
    };
    return labels[method] || method;
  };

  const calculateOrderTotal = () => {
    let subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shippingCost = orderData.shipping?.price || 0;
    let discount = orderData.couponDiscount || 0;
    
    // Aplicar desconto do PIX
    if (orderData.payment?.paymentMethod === 'pix') {
      discount += subtotal * 0.05; // 5% de desconto
    }
    
    return {
      subtotal,
      shippingCost,
      discount,
      total: subtotal + shippingCost - discount
    };
  };

  const totals = calculateOrderTotal();

  if (!orderData) {
    return (
      <div className="order-summary">
        <div className="error-state">
          <p>Erro ao carregar dados do pedido</p>
          <button className="btn btn-secondary" onClick={onBack}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <h2>Resumo do Pedido</h2>
      <p className="step-description">
        Revise todos os dados do seu pedido antes de finalizar a compra.
      </p>

      <div className="summary-sections">
        {/* Itens do Pedido */}
        <div className="summary-section">
          <div className="section-header">
            <h3>Itens do Pedido</h3>
            <button 
              className="btn btn-link"
              onClick={() => onEdit('cart')}
            >
              Editar
            </button>
          </div>
          
          <div className="items-list">
            {orderData.items.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-image">
                  <img 
                    src={item.image_url || '/images/products/default.jpg'} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/images/products/default.jpg';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-specs">
                    {item.weight && `${item.weight}g`}
                    {item.roast_level && ` • ${item.roast_level}`}
                    {item.origin && ` • ${item.origin}`}
                  </p>
                  <p className="item-quantity">Quantidade: {item.quantity}</p>
                </div>
                <div className="item-price">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dados de Entrega */}
        <div className="summary-section">
          <div className="section-header">
            <h3>Dados de Entrega</h3>
            <button 
              className="btn btn-link"
              onClick={() => onEdit('shipping')}
            >
              Editar
            </button>
          </div>
          
          <div className="shipping-info">
            <div className="address-info">
              <h4>{orderData.shipping?.firstName} {orderData.shipping?.lastName}</h4>
              <p>{orderData.shipping?.address}, {orderData.shipping?.number}</p>
              {orderData.shipping?.complement && (
                <p>{orderData.shipping?.complement}</p>
              )}
              <p>{orderData.shipping?.neighborhood}</p>
              <p>{orderData.shipping?.city} - {orderData.shipping?.state}</p>
              <p>CEP: {orderData.shipping?.zipCode}</p>
            </div>
            
            <div className="contact-info">
              <p><strong>Email:</strong> {orderData.shipping?.email}</p>
              <p><strong>Telefone:</strong> {orderData.shipping?.phone}</p>
              <p><strong>CPF:</strong> {orderData.shipping?.cpf}</p>
            </div>
          </div>
        </div>

        {/* Opção de Frete */}
        <div className="summary-section">
          <div className="section-header">
            <h3>Frete</h3>
            <button 
              className="btn btn-link"
              onClick={() => onEdit('shipping-options')}
            >
              Editar
            </button>
          </div>
          
          <div className="shipping-method">
            <div className="method-details">
              <h4>{orderData.shipping?.service_name}</h4>
              <p>Prazo: {orderData.shipping?.delivery_time} dias úteis</p>
              <p>Transportadora: {orderData.shipping?.service}</p>
            </div>
            <div className="method-price">
              {orderData.shipping?.price === 0 ? (
                <span className="free-shipping">Grátis</span>
              ) : (
                formatPrice(orderData.shipping?.price)
              )}
            </div>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="summary-section">
          <div className="section-header">
            <h3>Forma de Pagamento</h3>
            <button 
              className="btn btn-link"
              onClick={() => onEdit('payment')}
            >
              Editar
            </button>
          </div>
          
          <div className="payment-method">
            <div className="method-details">
              <h4>{getPaymentMethodLabel(orderData.payment?.paymentMethod)}</h4>
              
              {orderData.payment?.paymentMethod === 'pix' && (
                <div className="pix-details">
                  <p>Pagamento instantâneo</p>
                  <p className="discount-info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    5% de desconto aplicado
                  </p>
                </div>
              )}
              
              {orderData.payment?.paymentMethod === 'credit_card' && (
                <div className="card-details">
                  <p>Cartão final {orderData.payment?.cardData?.number?.slice(-4)}</p>
                  <p>{orderData.payment?.cardData?.installments}x de {formatPrice(totals.total / orderData.payment?.cardData?.installments)}</p>
                </div>
              )}
              
              {orderData.payment?.paymentMethod === 'debit_card' && (
                <div className="card-details">
                  <p>Cartão final {orderData.payment?.cardData?.number?.slice(-4)}</p>
                  <p>Débito à vista</p>
                </div>
              )}
              
              {orderData.payment?.paymentMethod === 'boleto' && (
                <div className="boleto-details">
                  <p>Vencimento em 3 dias úteis</p>
                  <p>Boleto será enviado por email</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cupom de Desconto */}
        {orderData.couponCode && (
          <div className="summary-section">
            <div className="section-header">
              <h3>Cupom de Desconto</h3>
              <button 
                className="btn btn-link"
                onClick={() => onEdit('shipping-options')}
              >
                Editar
              </button>
            </div>
            
            <div className="coupon-info">
              <div className="coupon-details">
                <h4>Cupom: {orderData.couponCode}</h4>
                <p>Desconto aplicado</p>
              </div>
              <div className="coupon-discount">
                -{formatPrice(orderData.couponDiscount)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="order-totals">
        <div className="totals-section">
          <h3>Resumo Financeiro</h3>
          
          <div className="total-line">
            <span>Subtotal ({orderData.items.length} {orderData.items.length === 1 ? 'item' : 'itens'})</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          
          <div className="total-line">
            <span>Frete</span>
            <span>
              {totals.shippingCost === 0 ? 'Grátis' : formatPrice(totals.shippingCost)}
            </span>
          </div>
          
          {totals.discount > 0 && (
            <div className="total-line discount">
              <span>Desconto</span>
              <span>-{formatPrice(totals.discount)}</span>
            </div>
          )}
          
          <div className="total-line total">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="terms-section">
        <label className="checkbox-label">
          <input type="checkbox" required />
          <span className="checkmark"></span>
          Aceito os{' '}
          <a href="/termos" target="_blank" rel="noopener noreferrer">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer">
            Política de Privacidade
          </a>
        </label>
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
          className="btn btn-primary btn-large"
          onClick={onNext}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Finalizando Pedido...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Finalizar Pedido - {formatPrice(totals.total)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;