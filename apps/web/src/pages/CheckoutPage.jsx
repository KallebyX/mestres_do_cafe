import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
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
  { id: 1, name: 'Carrinho', component: 'cart' },
  { id: 2, name: 'Entrega', component: 'shipping' },
  { id: 3, name: 'Frete', component: 'shipping-options' },
  { id: 4, name: 'Pagamento', component: 'payment' },
  { id: 5, name: 'Revisão', component: 'summary' },
  { id: 6, name: 'Confirmação', component: 'confirmation' }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // Inicializar checkout
  useEffect(() => {
    const initializeCheckout = async () => {
      if (cartItems.length === 0) {
        navigate('/cart');
        return;
      }

      try {
        setLoading(true);
        
        // Simular user_id (em produção viria do contexto de autenticação)
        const userId = 1;
        
        const response = await checkoutAPI.startCheckout({ user_id: userId });
        
        if (response.session_token) {
          setSessionToken(response.session_token);
          
          // Atualizar totais iniciais
          setCheckoutData(prev => ({
            ...prev,
            totals: {
              ...prev.totals,
              subtotal: response.checkout_session.subtotal,
              finalTotal: response.checkout_session.final_total
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
  }, [cartItems.length, navigate]);

  // Navegar para próxima etapa
  const nextStep = () => {
    if (currentStep < CHECKOUT_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navegar para etapa anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  // Calcular frete
  const calculateShipping = async (cep) => {
    try {
      setLoading(true);
      
      const products = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        weight: item.weight || 0.5
      }));

      const response = await checkoutAPI.calculateShipping({
        session_token: sessionToken,
        user_id: 1,
        destination_cep: cep,
        products
      });

      return response.shipping_options;
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      throw err;
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
        user_id: 1,
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
        user_id: 1,
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
            options={[]}
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
      <div className="container">
        <div className="checkout-header">
          <h1>Finalizar Compra</h1>
          <CheckoutProgress 
            steps={CHECKOUT_STEPS} 
            currentStep={currentStep} 
          />
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {renderCurrentStep()}
          </div>
          
          {currentStep < CHECKOUT_STEPS.length - 1 && (
            <div className="checkout-sidebar">
              <div className="order-summary-widget">
                <h3>Resumo do Pedido</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
