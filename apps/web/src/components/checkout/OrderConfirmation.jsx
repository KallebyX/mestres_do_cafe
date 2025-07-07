import React, { useEffect, useState } from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ orderData, onNewOrder }) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Limpar dados do checkout do localStorage
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('cartItems');
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getEstimatedDeliveryDate = () => {
    const deliveryDays = orderData.shipping?.delivery_time || 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    return deliveryDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleTrackOrder = () => {
    // Redirecionar para página de rastreamento
    window.location.href = `/pedidos/${orderData.id}`;
  };

  const handleDownloadInvoice = () => {
    // Simular download da nota fiscal
    const link = document.createElement('a');
    link.href = `/api/orders/${orderData.id}/invoice`;
    link.download = `nota-fiscal-${orderData.id}.pdf`;
    link.click();
  };

  const handlePrintBoleto = () => {
    // Abrir boleto em nova aba
    window.open(`/api/orders/${orderData.id}/boleto`, '_blank');
  };

  const handleDownloadPixQR = () => {
    // Simular download do QR Code PIX
    const link = document.createElement('a');
    link.href = `/api/orders/${orderData.id}/pix-qr`;
    link.download = `pix-qr-${orderData.id}.png`;
    link.click();
  };

  if (!orderData) {
    return (
      <div className="order-confirmation">
        <div className="error-state">
          <h2>Erro ao processar pedido</h2>
          <p>Não foi possível processar seu pedido. Tente novamente.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="success-header">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="9"></circle>
          </svg>
        </div>
        
        <h1>Pedido Realizado com Sucesso!</h1>
        <p className="success-message">
          Obrigado por escolher a Mestres do Café! Seu pedido foi confirmado e será processado em breve.
        </p>
      </div>

      <div className="order-info">
        <div className="order-number">
          <h2>Pedido #{orderData.id}</h2>
          <p>Realizado em {formatDate(orderData.created_at)}</p>
        </div>

        <div className="order-status">
          <div className="status-badge processing">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            Processando
          </div>
        </div>
      </div>

      <div className="delivery-info">
        <h3>Informações de Entrega</h3>
        <div className="delivery-details">
          <div className="delivery-address">
            <h4>Endereço de Entrega</h4>
            <p>{orderData.shipping?.firstName} {orderData.shipping?.lastName}</p>
            <p>{orderData.shipping?.address}, {orderData.shipping?.number}</p>
            {orderData.shipping?.complement && <p>{orderData.shipping?.complement}</p>}
            <p>{orderData.shipping?.neighborhood}</p>
            <p>{orderData.shipping?.city} - {orderData.shipping?.state}</p>
            <p>CEP: {orderData.shipping?.zipCode}</p>
          </div>
          
          <div className="delivery-method">
            <h4>Método de Entrega</h4>
            <p>{orderData.shipping?.service_name}</p>
            <p>Prazo: {orderData.shipping?.delivery_time} dias úteis</p>
            <p className="estimated-delivery">
              <strong>Previsão de entrega:</strong> {getEstimatedDeliveryDate()}
            </p>
          </div>
        </div>
      </div>

      <div className="payment-info">
        <h3>Informações de Pagamento</h3>
        <div className="payment-details">
          <div className="payment-method">
            <h4>Forma de Pagamento</h4>
            <p>{getPaymentMethodLabel(orderData.payment?.paymentMethod)}</p>
            
            {orderData.payment?.paymentMethod === 'pix' && (
              <div className="pix-info">
                <p>Pagamento via PIX com 5% de desconto</p>
                <div className="pix-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={handleDownloadPixQR}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7,10 12,15 17,10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Baixar QR Code PIX
                  </button>
                  <p className="pix-note">Use o QR Code ou copie o código PIX para pagar</p>
                </div>
              </div>
            )}
            
            {orderData.payment?.paymentMethod === 'credit_card' && (
              <div className="card-info">
                <p>Cartão final {orderData.payment?.cardData?.number?.slice(-4)}</p>
                <p>{orderData.payment?.cardData?.installments}x de {formatPrice(orderData.total / orderData.payment?.cardData?.installments)}</p>
                <p className="card-note">Cobrança será processada em até 2 dias úteis</p>
              </div>
            )}
            
            {orderData.payment?.paymentMethod === 'boleto' && (
              <div className="boleto-info">
                <p>Vencimento em 3 dias úteis</p>
                <div className="boleto-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={handlePrintBoleto}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 6,2 18,2 18,9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Imprimir Boleto
                  </button>
                  <p className="boleto-note">Boleto também foi enviado para seu email</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="payment-total">
            <h4>Total Pago</h4>
            <p className="total-amount">{formatPrice(orderData.total)}</p>
          </div>
        </div>
      </div>

      <div className="order-items">
        <div className="items-header">
          <h3>Itens do Pedido</h3>
          <button 
            className="btn btn-link"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar' : 'Ver'} Detalhes
          </button>
        </div>
        
        {showDetails && (
          <div className="items-list">
            {orderData.items.map((item) => (
              <div key={item.id} className="order-item">
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
        )}
      </div>

      <div className="next-steps">
        <h3>Próximos Passos</h3>
        <div className="steps-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Confirmação por Email</h4>
              <p>Enviamos um email de confirmação com todos os detalhes do pedido para {orderData.shipping?.email}</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Processamento</h4>
              <p>Seu pedido será processado e preparado para envio em até 1 dia útil</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Envio</h4>
              <p>Após o processamento, você receberá o código de rastreamento por email</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Entrega</h4>
              <p>Seu pedido será entregue no endereço informado até {getEstimatedDeliveryDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <button 
          className="btn btn-primary"
          onClick={handleTrackOrder}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Acompanhar Pedido
        </button>
        
        <button 
          className="btn btn-outline"
          onClick={handleDownloadInvoice}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Baixar Nota Fiscal
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={onNewOrder}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8l-2.1-5.2M7 13L5.4 5H2m5 8v6a1 1 0 0 0 1 1h1m5-1v6a1 1 0 0 0 1 1h1"></path>
          </svg>
          Continuar Comprando
        </button>
      </div>

      <div className="support-info">
        <h3>Precisa de Ajuda?</h3>
        <p>
          Se você tiver alguma dúvida sobre seu pedido, entre em contato conosco:
        </p>
        <div className="contact-options">
          <div className="contact-option">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>contato@mestresdocafe.com.br</span>
          </div>
          
          <div className="contact-option">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>(11) 3456-7890</span>
          </div>
          
          <div className="contact-option">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>Chat online 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;