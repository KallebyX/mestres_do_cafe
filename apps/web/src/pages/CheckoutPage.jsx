import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  Package,
  Star,
  AlertCircle
} from 'lucide-react';
import CartReview from '../components/checkout/CartReview';
import ShippingForm from '../components/checkout/ShippingForm';
import ShippingOptions from '../components/checkout/ShippingOptions';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderSummary from '../components/checkout/OrderSummary';
import OrderConfirmation from '../components/checkout/OrderConfirmation';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import { checkoutAPI } from '../services/checkout-api';
import './CheckoutPage.css';

const CHECKOUT_STEPS = [
  { 
    id: 1, 
    name: 'Carrinho', 
    component: 'cart',
    icon: ShoppingCart,
    description: 'Revise seus itens'
  },
  { 
    id: 2, 
    name: 'Entrega', 
    component: 'shipping',
    icon: MapPin,
    description: 'Dados de entrega'
  },
  { 
    id: 3, 
    name: 'Frete', 
    component: 'shipping-options',
    icon: Truck,
    description: 'Escolha o frete'
  },
  { 
    id: 4, 
    name: 'Pagamento', 
    component: 'payment',
    icon: CreditCard,
    description: 'Forma de pagamento'
  },
  { 
    id: 5, 
    name: 'Revisão', 
    component: 'summary',
    icon: CheckCircle,
    description: 'Confirme o pedido'
  },
  { 
    id: 6, 
    name: 'Confirmação', 
    component: 'confirmation',
    icon: CheckCircle,
    description: 'Pedido confirmado'
  }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Dados do checkout
  const [checkoutData, setCheckoutData] = useState({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      cpf: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      deliveryInstructions: ''
    },
    shippingOptions: [],
    shippingOption: null,
    payment: {
      method: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvc: '',
      installments: 1
    },
    totals: {
      subtotal: 0,
      shippingTotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      finalTotal: 0
    },
    couponCode: '',
    order: null
  });

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inicializar checkout
  useEffect(() => {
    const initializeCheckout = async () => {
      if (cartItems.length === 0) {
        navigate('/cart');
        return;
      }

      try {
        setLoading(true);
        
        // Verificar se usuário está autenticado
        if (!user || !user.id) {
          navigate('/login');
          return;
        }
        
        const response = await checkoutAPI.startCheckout({ user_id: user.id });
        
        if (response.session_token) {
          setSessionToken(response.session_token);
          
          // Atualizar totais iniciais
          setCheckoutData(prev => ({
            ...prev,
            totals: {
              ...prev.totals,
              subtotal: response.checkout_session?.subtotal || cartTotal,
              finalTotal: response.checkout_session?.final_total || cartTotal
            }
          }));
        }
      } catch (err) {
        console.error('Erro ao inicializar checkout:', err);
        setError('Erro ao inicializar checkout');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [cartItems.length, navigate, user, cartTotal]);

  // Navegar para próxima etapa
  const nextStep = () => {
    if (currentStep < CHECKOUT_STEPS.length) {
      setCurrentStep(currentStep + 1);
      // Scroll para o topo em mobile
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Navegar para etapa anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll para o topo em mobile
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Atualizar dados do checkout
  const updateCheckoutData = (section, data) => {
    setCheckoutData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  // Validar CEP
  const validateCEP = async (cep) => {
    try {
      const response = await checkoutAPI.validateCEP({ cep });
      return response;
    } catch (err) {
      console.error('Erro ao validar CEP:', err);
      throw err;
    }
  };

  // Calcular frete usando Melhor Envio
  const calculateShipping = async (cep) => {
    try {
      setLoading(true);
      
      const products = cartItems.map(item => ({
        name: item.name || 'Produto',
        quantity: item.quantity,
        weight: item.weight || 0.5,
        width: item.width || 10,
        height: item.height || 10,
        length: item.length || 15,
        price: item.price || 0
      }));

      const response = await fetch('/api/shipping/melhor-envio/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_cep: '97010-000', // CEP da empresa
          destination_cep: cep,
          products
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao calcular frete');
      }

      const data = await response.json();
      
      if (data.success && data.quotes) {
        // Atualizar opções de frete no estado
        updateCheckoutData('shippingOptions', data.quotes);
        
        // Se estivermos na etapa de entrega, avançar para seleção de frete
        if (currentStep === 2) {
          nextStep();
        }
        
        return data.quotes;
      } else {
        throw new Error(data.error || 'Erro ao calcular frete');
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      
      // Adicionar opções de frete simuladas em caso de erro
      const mockOptions = [
        {
          id: 'pac',
          service: 'PAC',
          service_name: 'PAC - Econômico',
          price: 15.50,
          delivery_time: 7,
          description: 'Entrega econômica dos Correios'
        },
        {
          id: 'sedex',
          service: 'SEDEX',
          service_name: 'SEDEX - Rápido',
          price: 25.90,
          delivery_time: 3,
          description: 'Entrega expressa dos Correios'
        }
      ];
      
      updateCheckoutData('shippingOptions', mockOptions);
      
      if (currentStep === 2) {
        nextStep();
      }
      
      return mockOptions;
    } finally {
      setLoading(false);
    }
  };

  // Aplicar cupom
  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      
      const response = await checkoutAPI.applyCoupon({
        session_token: sessionToken,
        user_id: user.id,
        coupon_code: couponCode,
        subtotal: checkoutData.totals.subtotal
      });

      // Atualizar totais
      const newTotals = {
        ...checkoutData.totals,
        discountTotal: response.discount_amount,
        shippingTotal: response.free_shipping ? 0 : checkoutData.totals.shippingTotal
      };
      
      newTotals.finalTotal = newTotals.subtotal + newTotals.shippingTotal + newTotals.taxTotal - newTotals.discountTotal;

      updateCheckoutData('totals', newTotals);
      updateCheckoutData('couponCode', couponCode);

      return response;
    } catch (err) {
      console.error('Erro ao aplicar cupom:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar checkout
  const completeCheckout = async () => {
    try {
      setLoading(true);

      const orderData = {
        session_token: sessionToken,
        user_id: user.id,
        shipping_data: checkoutData.shipping,
        payment_data: checkoutData.payment,
        cart_data: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        totals: checkoutData.totals
      };

      const response = await checkoutAPI.completeCheckout(orderData);
      
      updateCheckoutData('order', response.order);
      clearCart();
      nextStep();
      
      return response;
    } catch (err) {
      console.error('Erro ao finalizar checkout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Renderizar componente da etapa atual
  const renderCurrentStep = () => {
    const step = CHECKOUT_STEPS[currentStep - 1];
    
    switch (step.component) {
      case 'cart':
        return (
          <CartReview
            items={cartItems}
            total={cartTotal}
            onNext={nextStep}
            loading={loading}
          />
        );
      
      case 'shipping':
        return (
          <ShippingForm
            data={checkoutData.shipping}
            onUpdate={(data) => updateCheckoutData('shipping', data)}
            onNext={nextStep}
            onPrev={prevStep}
            onValidateCEP={validateCEP}
            loading={loading}
          />
        );
      
      case 'shipping-options':
        return (
          <ShippingOptions
            options={checkoutData.shippingOptions || []}
            selected={checkoutData.shippingOption}
            onSelect={(option) => {
              updateCheckoutData('shippingOption', option);
              updateCheckoutData('totals', {
                ...checkoutData.totals,
                shippingTotal: option.price,
                finalTotal: checkoutData.totals.subtotal + option.price + checkoutData.totals.taxTotal - checkoutData.totals.discountTotal
              });
            }}
            onNext={nextStep}
            onPrev={prevStep}
            onCalculate={() => calculateShipping(checkoutData.shipping.cep)}
            loading={loading}
          />
        );
      
      case 'payment':
        return (
          <PaymentForm
            data={checkoutData.payment}
            onUpdate={(data) => updateCheckoutData('payment', data)}
            onNext={nextStep}
            onPrev={prevStep}
            loading={loading}
          />
        );
      
      case 'summary':
        return (
          <OrderSummary
            checkoutData={checkoutData}
            items={cartItems}
            onPrev={prevStep}
            onConfirm={completeCheckout}
            onApplyCoupon={applyCoupon}
            loading={loading}
          />
        );
      
      case 'confirmation':
        return (
          <OrderConfirmation
            order={checkoutData.order}
            onContinueShopping={() => navigate('/')}
          />
        );
      
      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  if (loading && currentStep === 1) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>Inicializando checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <div className="error-icon">
          <AlertCircle size={48} />
        </div>
        <h2>Erro no Checkout</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/cart')} className="btn btn-primary">
          Voltar ao Carrinho
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header do Checkout */}
      <div className="checkout-header">
        <div className="container">
          <div className="header-content">
            <button 
              onClick={() => navigate('/cart')} 
              className="back-button"
              aria-label="Voltar ao carrinho"
            >
              <ArrowLeft size={20} />
              <span>Voltar ao Carrinho</span>
            </button>
            
            <div className="header-title">
              <h1>Finalizar Compra</h1>
              <p>Complete seu pedido em poucos passos</p>
            </div>
            
            <div className="header-security">
              <Shield size={20} />
              <span>Compra 100% Segura</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="checkout-layout">
          {/* Barra de Progresso */}
          <div className="checkout-progress-wrapper">
            <CheckoutProgress 
              steps={CHECKOUT_STEPS} 
              currentStep={currentStep}
              isMobile={isMobile}
            />
          </div>

          <div className="checkout-content">
            {/* Conteúdo Principal */}
            <div className="checkout-main">
              {renderCurrentStep()}
            </div>
            
            {/* Sidebar com Resumo */}
            {currentStep < CHECKOUT_STEPS.length - 1 && (
              <div className="checkout-sidebar">
                <div className="order-summary-widget">
                  <div className="summary-header">
                    <Package size={20} />
                    <h3>Resumo do Pedido</h3>
                  </div>
                  
                  <div className="summary-items">
                    {cartItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="summary-item">
                        <div className="item-image">
                          <img 
                            src={item.image || '/images/coffee-placeholder.jpg'} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/images/coffee-placeholder.jpg';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Qtd: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    {cartItems.length > 3 && (
                      <div className="more-items">
                        +{cartItems.length - 3} mais itens
                      </div>
                    )}
                  </div>
                  
                  <div className="summary-totals">
                    <div className="summary-line">
                      <span>Subtotal:</span>
                      <span>R$ {checkoutData.totals.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {checkoutData.totals.shippingTotal > 0 && (
                      <div className="summary-line">
                        <span>Frete:</span>
                        <span>R$ {checkoutData.totals.shippingTotal.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {checkoutData.totals.discountTotal > 0 && (
                      <div className="summary-line discount">
                        <span>Desconto:</span>
                        <span>-R$ {checkoutData.totals.discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="summary-line total">
                      <span>Total:</span>
                      <span>R$ {checkoutData.totals.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="summary-benefits">
                    <div className="benefit-item">
                      <Shield size={16} />
                      <span>Compra 100% Segura</span>
                    </div>
                    <div className="benefit-item">
                      <Truck size={16} />
                      <span>Entrega Rápida</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle size={16} />
                      <span>Garantia de Qualidade</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
