/**
 * Exemplo de Integração - Checkout com MercadoPago
 * ================================================
 * 
 * Este arquivo demonstra como integrar o MercadoPago Checkout Transparente
 * com o sistema de checkout existente da aplicação.
 */

import React, { useState, useEffect } from 'react';
import { useMercadoPago, usePaymentForm, usePaymentStatus } from '../hooks/useMercadoPago';
import MercadoPagoTransparentCheckout from '../components/MercadoPagoTransparentCheckout';
import { MercadoPagoUtils } from '../config/mercadopago';

// Simulação de dados do carrinho/pedido existente
const SAMPLE_ORDER = {
  id: 'order-123456',
  items: [
    {
      id: 'product-1',
      name: 'Café Premium 250g',
      price: 45.90,
      quantity: 2
    },
    {
      id: 'product-2', 
      name: 'Café Gourmet 500g',
      price: 89.90,
      quantity: 1
    }
  ],
  shipping: 15.00,
  total: 181.70
};

/**
 * Componente principal de integração
 */
const CheckoutIntegration = () => {
  // Estados do checkout
  const [currentStep, setCurrentStep] = useState('cart'); // cart -> payment -> processing -> success
  const [orderData, setOrderData] = useState(SAMPLE_ORDER);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Hooks do MercadoPago
  const { 
    isLoaded, 
    isLoading, 
    error, 
    processPayment,
    clearError 
  } = useMercadoPago({
    onPaymentSuccess: handlePaymentSuccess,
    onPaymentError: handlePaymentError,
    onPaymentPending: handlePaymentPending
  });

  const { trackPayment, updatePaymentStatus, getPaymentStatus } = usePaymentStatus();

  /**
   * Handlers para eventos de pagamento
   */
  function handlePaymentSuccess(result) {
    console.log('Pagamento aprovado:', result);
    updatePaymentStatus(result.payment_id, 'approved', result);
    setCurrentStep('success');
    setProcessingPayment(false);
    
    // Aqui você integraria com o sistema existente:
    // - Atualizar status do pedido no banco
    // - Enviar email de confirmação
    // - Atualizar estoque
    // - etc.
  }

  function handlePaymentError(result) {
    console.error('Erro no pagamento:', result);
    if (result.payment_id) {
      updatePaymentStatus(result.payment_id, 'rejected', result);
    }
    setProcessingPayment(false);
    // Manter no step de pagamento para permitir nova tentativa
  }

  function handlePaymentPending(result) {
    console.log('Pagamento pendente:', result);
    updatePaymentStatus(result.payment_id, 'pending', result);
    setCurrentStep('processing');
    setProcessingPayment(false);
    
    // Para PIX e Boleto, redirecionar para página de instruções
  }

  /**
   * Processa o pagamento quando recebido do componente MercadoPago
   */
  const handleMercadoPagoPayment = async (paymentData) => {
    try {
      setProcessingPayment(true);
      
      // Adiciona dados do pedido ao pagamento
      const fullPaymentData = {
        ...paymentData,
        order_id: orderData.id,
        amount: orderData.total,
        description: `Pedido ${orderData.id} - ${orderData.items.length} itens`
      };

      // Inicia tracking do pagamento
      const tempPaymentId = `temp-${Date.now()}`;
      trackPayment(tempPaymentId, 'processing');

      // Processa via API
      const result = await processPayment(fullPaymentData);
      
      // Atualiza tracking com ID real
      if (result.payment_id) {
        trackPayment(result.payment_id, result.status);
      }

      return result;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setProcessingPayment(false);
      throw error;
    }
  };

  /**
   * Renderização condicional baseada no step
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'cart':
        return <CartReview />;
      case 'payment':
        return <PaymentStep />;
      case 'processing':
        return <ProcessingStep />;
      case 'success':
        return <SuccessStep />;
      default:
        return <CartReview />;
    }
  };

  /**
   * Componente de revisão do carrinho
   */
  const CartReview = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Revisão do Pedido</h2>
      
      <div className="space-y-3 mb-4">
        {orderData.items.map(item => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name} (x{item.quantity})</span>
            <span>{MercadoPagoUtils.formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span>Frete</span>
          <span>{MercadoPagoUtils.formatCurrency(orderData.shipping)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Total</span>
          <span>{MercadoPagoUtils.formatCurrency(orderData.total)}</span>
        </div>
      </div>

      <button
        onClick={() => setCurrentStep('payment')}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Continuar para Pagamento
      </button>
    </div>
  );

  /**
   * Componente do step de pagamento
   */
  const PaymentStep = () => (
    <div className="space-y-6">
      {/* Resumo do pedido compacto */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Pedido #{orderData.id}</h3>
        <p className="text-sm text-gray-600">
          {orderData.items.length} itens • {MercadoPagoUtils.formatCurrency(orderData.total)}
        </p>
      </div>

      {/* Componente MercadoPago */}
      {isLoaded ? (
        <MercadoPagoTransparentCheckout
          amount={orderData.total}
          orderId={orderData.id}
          onPaymentSubmit={handleMercadoPagoPayment}
          onPaymentMethodSelect={setSelectedPaymentMethod}
          disabled={processingPayment}
        />
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando métodos de pagamento...</span>
        </div>
      )}

      {/* Erros */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-600 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Botão voltar */}
      <button
        onClick={() => setCurrentStep('cart')}
        className="text-blue-600 underline"
        disabled={processingPayment}
      >
        ← Voltar para revisão
      </button>
    </div>
  );

  /**
   * Componente de processamento
   */
  const ProcessingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">Processando Pagamento</h2>
      <p className="text-gray-600">
        Aguarde enquanto confirmamos seu pagamento...
      </p>
      
      {selectedPaymentMethod === 'pix' && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm">
            Para PIX, o pagamento será confirmado em até 2 horas.
          </p>
        </div>
      )}
      
      {selectedPaymentMethod === 'boleto' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm">
            O boleto foi gerado. Você receberá as instruções por email.
          </p>
        </div>
      )}
    </div>
  );

  /**
   * Componente de sucesso
   */
  const SuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold mb-2 text-green-800">
        Pagamento Aprovado!
      </h2>
      
      <p className="text-gray-600 mb-6">
        Seu pedido #{orderData.id} foi confirmado e será processado em breve.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => {
            // Redirecionar para página de pedidos ou homepage
            console.log('Redirecionando para meus pedidos...');
          }}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Ver Meus Pedidos
        </button>
        
        <button
          onClick={() => {
            // Resetar checkout para novo pedido
            setCurrentStep('cart');
            setOrderData(SAMPLE_ORDER);
            setSelectedPaymentMethod(null);
            setProcessingPayment(false);
          }}
          className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50"
        >
          Fazer Novo Pedido
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Indicador de progresso */}
      <div className="flex items-center justify-between mb-8">
        {['cart', 'payment', 'processing', 'success'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep === step 
                ? 'bg-blue-600 text-white' 
                : index < ['cart', 'payment', 'processing', 'success'].indexOf(currentStep)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {index + 1}
            </div>
            {index < 3 && (
              <div className={`
                h-1 w-12 mx-2
                ${index < ['cart', 'payment', 'processing', 'success'].indexOf(currentStep)
                  ? 'bg-green-600'
                  : 'bg-gray-200'
                }
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo do step atual */}
      {renderCurrentStep()}

      {/* Debug info (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <details>
            <summary>Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify({
                currentStep,
                isLoaded,
                isLoading,
                error,
                selectedPaymentMethod,
                processingPayment
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default CheckoutIntegration;