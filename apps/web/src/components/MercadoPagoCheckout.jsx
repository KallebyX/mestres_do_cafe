import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const MercadoPagoCheckout = ({ 
  orderId, 
  amount, 
  customerData, 
  onSuccess, 
  onError, 
  onPending 
}) => {
  const [loading, setLoading] = useState(false);
  const [preferenceData, setPreferenceData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('checkout_pro');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    cardholderName: '',
    installments: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentMethods();
    loadMercadoPagoScript();
  }, []);

  const loadMercadoPagoScript = () => {
    // Carregar script do Mercado Pago se não estiver carregado
    if (!window.MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        console.log('Mercado Pago SDK loaded');
      };
      document.head.appendChild(script);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/mercadopago/payment-methods');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.payment_methods);
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const createPreference = async () => {
    try {
      setLoading(true);
      setError('');

      const preferenceData = {
        order_id: orderId,
        title: `Pedido #${orderId.slice(-8)}`,
        description: 'Compra de produtos Mestres do Café',
        payer_name: customerData.name,
        payer_email: customerData.email,
        payer_phone: customerData.phone || '',
        payer_doc_type: customerData.docType || 'CPF',
        payer_doc_number: customerData.docNumber,
        payer_address_street: customerData.address?.street || '',
        payer_address_number: customerData.address?.number || '',
        payer_address_zip: customerData.address?.zipCode || ''
      };

      const response = await fetch('/api/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferenceData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreferenceData(data);
          // Redirecionar para checkout do Mercado Pago
          const initPoint = data.environment === 'sandbox' 
            ? data.sandbox_init_point 
            : data.init_point;
          
          window.location.href = initPoint;
        } else {
          setError(data.error || 'Erro ao criar preferência de pagamento');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro na comunicação com o servidor');
      }
    } catch (error) {
      console.error('Error creating preference:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const processDirectPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar dados do cartão
      if (!cardData.cardNumber || !cardData.expirationDate || 
          !cardData.securityCode || !cardData.cardholderName) {
        setError('Por favor, preencha todos os dados do cartão');
        return;
      }

      // Aqui você integraria com o SDK do Mercado Pago para tokenizar o cartão
      // Por questões de segurança, os dados do cartão devem ser tokenizados no frontend
      
      const paymentData = {
        order_id: orderId,
        payment_method_id: 'visa', // Seria detectado automaticamente
        token: 'card_token_here', // Token gerado pelo SDK
        installments: cardData.installments,
        payer_email: customerData.email,
        payer_doc_type: customerData.docType || 'CPF',
        payer_doc_number: customerData.docNumber,
        description: `Pedido #${orderId.slice(-8)} - Mestres do Café`
      };

      const response = await fetch('/api/payments/mercadopago/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.status === 'approved') {
            onSuccess?.(data);
          } else if (data.status === 'pending' || data.status === 'in_process') {
            onPending?.(data);
          } else {
            onError?.(data.status_detail || 'Pagamento rejeitado');
          }
        } else {
          setError(data.error || 'Erro ao processar pagamento');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro na comunicação com o servidor');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setCardData(prev => ({
        ...prev,
        cardNumber: value
      }));
    }
  };

  const handleExpirationChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    if (value.length <= 5) {
      setCardData(prev => ({
        ...prev,
        expirationDate: value
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-gray-900">Finalizar Pagamento</h2>
        <p className="text-gray-600">Total: {formatAmount(amount)}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Seleção do método de pagamento */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Método de Pagamento</h3>
        
        <div className="space-y-3">
          <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="checkout_pro"
              checked={selectedMethod === 'checkout_pro'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="font-medium text-gray-900">Checkout Mercado Pago</p>
                <p className="text-sm text-gray-600">Pix, cartão, boleto e mais opções</p>
              </div>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="direct_card"
              checked={selectedMethod === 'direct_card'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="font-medium text-gray-900">Cartão de Crédito</p>
                <p className="text-sm text-gray-600">Pagamento direto</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Formulário de cartão (se método direto selecionado) */}
      {selectedMethod === 'direct_card' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Cartão
            </label>
            <input
              type="text"
              value={formatCardNumber(cardData.cardNumber)}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validade
              </label>
              <input
                type="text"
                value={cardData.expirationDate}
                onChange={handleExpirationChange}
                placeholder="MM/AA"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cardData.securityCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCardData(prev => ({ ...prev, securityCode: value }));
                  }
                }}
                placeholder="123"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome no Cartão
            </label>
            <input
              type="text"
              value={cardData.cardholderName}
              onChange={(e) => setCardData(prev => ({ 
                ...prev, 
                cardholderName: e.target.value.toUpperCase() 
              }))}
              placeholder="NOME COMPLETO"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parcelas
            </label>
            <select
              value={cardData.installments}
              onChange={(e) => setCardData(prev => ({ 
                ...prev, 
                installments: parseInt(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 6, 12].map(installment => (
                <option key={installment} value={installment}>
                  {installment}x de {formatAmount(amount / installment)}
                  {installment === 1 ? ' à vista' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Botão de pagamento */}
      <button
        onClick={selectedMethod === 'checkout_pro' ? createPreference : processDirectPayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processando...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Lock className="h-5 w-5 mr-2" />
            {selectedMethod === 'checkout_pro' 
              ? 'Ir para Mercado Pago' 
              : 'Pagar com Cartão'
            }
          </div>
        )}
      </button>

      {/* Informações de segurança */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Lock className="h-4 w-4 mr-1" />
          Pagamento 100% seguro com Mercado Pago
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoCheckout;