import React from 'react';
import './CartReview.css';

const CartReview = ({ items, total, onNext, loading }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!items || items.length === 0) {
    return (
      <div className="cart-review">
        <div className="empty-cart">
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos ao carrinho para continuar com a compra.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-review">
      <h2>Revisão do Carrinho</h2>
      <p className="step-description">
        Revise os itens do seu carrinho antes de prosseguir com a compra.
      </p>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
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
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              
              <div className="item-specs">
                {item.roast_level && (
                  <span className="spec">Torra: {item.roast_level}</span>
                )}
                {item.weight && (
                  <span className="spec">Peso: {item.weight}g</span>
                )}
                {item.origin && (
                  <span className="spec">Origem: {item.origin}</span>
                )}
              </div>
            </div>
            
            <div className="item-quantity">
              <span className="quantity-label">Quantidade:</span>
              <span className="quantity-value">{item.quantity}</span>
            </div>
            
            <div className="item-pricing">
              <div className="unit-price">
                {formatPrice(item.price)} cada
              </div>
              <div className="total-price">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'}):</span>
          <span className="amount">{formatPrice(total)}</span>
        </div>
        
        <div className="summary-row total">
          <span>Total do Carrinho:</span>
          <span className="amount">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="shipping-notice">
        <div className="notice-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        </div>
        <div className="notice-text">
          <strong>Frete grátis</strong> para compras acima de R$ 100,00 na Grande São Paulo
        </div>
      </div>

      <div className="security-badges">
        <div className="badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Compra Segura
        </div>
        <div className="badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
          </svg>
          Garantia de Qualidade
        </div>
        <div className="badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          Entrega Rápida
        </div>
      </div>

      <div className="cart-actions">
        <button 
          className="btn btn-primary btn-large"
          onClick={onNext}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processando...
            </>
          ) : (
            'Continuar para Entrega'
          )}
        </button>
        
        <p className="terms-text">
          Ao continuar, você concorda com nossos{' '}
          <a href="/termos" target="_blank" rel="noopener noreferrer">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
};

export default CartReview;