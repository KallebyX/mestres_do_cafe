import { useState } from 'react';
import './OrderSummary.css';

const OrderSummary = ({ paymentResult, orderData, onBackToDemo }) => {
  const [copied, setCopied] = useState(false);

  if (!paymentResult) {
    return (
      <div className="order-summary-container">
        <div className="order-summary-error">
          <h2>❌ Dados do pagamento não encontrados</h2>
          <button onClick={onBackToDemo} className="btn-back">
            Voltar para Demonstração
          </button>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const renderPaymentDetails = () => {
    const { payment_method, status, id } = paymentResult;

    switch (payment_method) {
      case 'pix':
        return (
          <div className="payment-details pix-details">
            <div className="payment-header">
              <span className="payment-icon">📱</span>
              <h2>Pagamento PIX</h2>
              <div className={`status-badge ${status}`}>
                {status === 'pending' ? '⏳ Aguardando Pagamento' : '✅ Aprovado'}
              </div>
            </div>

            <div className="pix-info">
              <div className="discount-info">
                <span className="discount-icon">⭐</span>
                <span>Você economizou 5% pagando com PIX!</span>
              </div>
              
              <div className="amount-section">
                <div className="original-amount">
                  <span>Valor original:</span>
                  <span>R$ {orderData?.original_amount || '99,70'}</span>
                </div>
                <div className="final-amount">
                  <span>Valor com desconto PIX:</span>
                  <span className="highlight">R$ {paymentResult.transaction_amount || '94,72'}</span>
                </div>
              </div>

              <div className="qr-section">
                <h3>QR Code para Pagamento</h3>
                <div className="qr-container">
                  <div className="qr-placeholder">
                    <div className="qr-code">
                      {/* QR Code simulado */}
                      <div className="qr-pattern">
                        <div className="qr-squares">
                          {Array.from({ length: 25 }, (_, i) => (
                            <div key={i} className={`qr-square ${Math.random() > 0.5 ? 'filled' : ''}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p>Escaneie com o app do seu banco</p>
                  </div>
                </div>
              </div>

              <div className="pix-code-section">
                <h3>Código PIX para Cópia e Cola</h3>
                <div className="pix-code-container">
                  <textarea
                    readOnly
                    value={paymentResult.qr_code_base64 || "00020126580014br.gov.bcb.pix013652c9dcaa-3048-4c9e-a6d6-ffc5c6b2c4e4520400005303986540594.725802BR5925MESTRES DO CAFE TORREFACAO6009SAO PAULO62070503***63041D3A"}
                    className="pix-code"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentResult.qr_code_base64 || "00020126580014br.gov.bcb.pix013652c9dcaa-3048-4c9e-a6d6-ffc5c6b2c4e4520400005303986540594.725802BR5925MESTRES DO CAFE TORREFACAO6009SAO PAULO62070503***63041D3A")}
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                  >
                    {copied ? '✅ Copiado!' : '📋 Copiar Código'}
                  </button>
                </div>
              </div>

              <div className="payment-instructions">
                <h4>Como pagar:</h4>
                <ol>
                  <li>Abra o app do seu banco ou carteira digital</li>
                  <li>Escaneie o QR Code ou cole o código PIX</li>
                  <li>Confirme o pagamento de <strong>R$ {paymentResult.transaction_amount || '94,72'}</strong></li>
                  <li>Aguarde a confirmação automática</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'credit_card':
        return (
          <div className="payment-details card-details">
            <div className="payment-header">
              <span className="payment-icon">💳</span>
              <h2>Pagamento com Cartão de Crédito</h2>
              <div className={`status-badge ${status}`}>
                {status === 'approved' ? '✅ Aprovado' : '⏳ Processando'}
              </div>
            </div>

            <div className="card-info">
              <div className="amount-section">
                <div className="final-amount">
                  <span>Valor cobrado:</span>
                  <span className="highlight">R$ {paymentResult.transaction_amount || '99,70'}</span>
                </div>
                <div className="installments-info">
                  <span>Parcelamento:</span>
                  <span>{paymentResult.installments || '1'}x de R$ {paymentResult.transaction_amount || '99,70'}</span>
                </div>
              </div>

              <div className="transaction-info">
                <div className="info-row">
                  <span>ID da Transação:</span>
                  <code>{id}</code>
                </div>
                <div className="info-row">
                  <span>Autorização:</span>
                  <code>{paymentResult.authorization_code || 'AUTH123456'}</code>
                </div>
                <div className="info-row">
                  <span>Cartão Final:</span>
                  <span>**** **** **** {paymentResult.card?.last_four_digits || '1234'}</span>
                </div>
              </div>

              <div className="success-message">
                <span className="success-icon">✅</span>
                <p>Seu pagamento foi processado com sucesso! Você receberá um email de confirmação em breve.</p>
              </div>
            </div>
          </div>
        );

      case 'ticket':
        return (
          <div className="payment-details ticket-details">
            <div className="payment-header">
              <span className="payment-icon">📄</span>
              <h2>Boleto Bancário</h2>
              <div className={`status-badge ${status}`}>
                {status === 'pending' ? '⏳ Aguardando Pagamento' : '✅ Pago'}
              </div>
            </div>

            <div className="ticket-info">
              <div className="amount-section">
                <div className="final-amount">
                  <span>Valor do boleto:</span>
                  <span className="highlight">R$ {paymentResult.transaction_amount || '99,70'}</span>
                </div>
                <div className="due-date">
                  <span>Vencimento:</span>
                  <span>{paymentResult.date_of_expiration || '25/07/2025'}</span>
                </div>
              </div>

              <div className="barcode-section">
                <h3>Código de Barras</h3>
                <div className="barcode-container">
                  <code className="barcode">
                    {paymentResult.barcode || '03399.07505 60000.001014 41147.101015 2 98370000009970'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(paymentResult.barcode || '03399.07505 60000.001014 41147.101015 2 98370000009970')}
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                  >
                    {copied ? '✅ Copiado!' : '📋 Copiar Código'}
                  </button>
                </div>
              </div>

              <div className="ticket-actions">
                <a
                  href={paymentResult.transaction_details?.external_resource_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                >
                  📥 Baixar Boleto PDF
                </a>
                <button
                  onClick={() => window.print()}
                  className="print-btn"
                >
                  🖨️ Imprimir Boleto
                </button>
              </div>

              <div className="payment-instructions">
                <h4>Como pagar:</h4>
                <ol>
                  <li>Baixe ou imprima o boleto</li>
                  <li>Pague em qualquer banco, lotérica ou app bancário</li>
                  <li>Use o código de barras para pagamento digital</li>
                  <li>O prazo de vencimento é {paymentResult.date_of_expiration || '25/07/2025'}</li>
                </ol>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="payment-details default-details">
            <h2>Pagamento Processado</h2>
            <p>Método: {payment_method}</p>
            <p>Status: {status}</p>
            <p>ID: {id}</p>
          </div>
        );
    }
  };

  return (
    <div className="order-summary-container">
      <div className="order-summary">
        <div className="summary-header">
          <h1>🎉 Pedido Confirmado!</h1>
          <p>Obrigado por escolher a Mestres do Café</p>
        </div>

        <div className="order-info">
          <h3>📦 Resumo do Pedido</h3>
          <div className="order-items">
            <div className="item">
              <span>Café Especial Bourbon Amarelo (2x)</span>
              <span>R$ 71,80</span>
            </div>
            <div className="item">
              <span>Filtro V60 Hário (1x)</span>
              <span>R$ 12,90</span>
            </div>
            <div className="item subtotal">
              <span>Subtotal:</span>
              <span>R$ 84,70</span>
            </div>
            <div className="item shipping">
              <span>Frete:</span>
              <span>R$ 15,00</span>
            </div>
            <div className="item total">
              <span>Total:</span>
              <span>R$ {paymentResult.transaction_amount || '99,70'}</span>
            </div>
          </div>
        </div>

        {renderPaymentDetails()}

        <div className="next-steps">
          <h3>📬 Próximos Passos</h3>
          <ul>
            <li>Você receberá um email de confirmação</li>
            <li>Acompanhe o status do seu pedido na sua conta</li>
            <li>Após confirmação do pagamento, prepararemos seu pedido</li>
            <li>Prazo de entrega: 3-5 dias úteis</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={onBackToDemo} className="btn-secondary">
            🔙 Nova Demonstração
          </button>
          <button onClick={() => window.location.href = '/'} className="btn-primary">
            🏠 Voltar ao Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;