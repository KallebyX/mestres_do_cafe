import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  QrCode, 
  FileText, 
  Lock, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck
} from 'lucide-react';

const MercadoPagoTransparentCheckout = ({ 
  orderId, 
  amount, 
  customerData, 
  onSuccess, 
  onError, 
  onPending,
  environment = 'sandbox'
}) => {
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState('method'); // method, form, processing, result
  
  // Estados específicos por método
  const [cardData, setCardData] = useState({
    number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    cardholder_name: '',
    cardholder_doc_type: 'CPF',
    cardholder_doc_number: ''
  });
  
  const [pixData, setPixData] = useState({
    payer_email: customerData?.email || '',
    payer_first_name: customerData?.firstName || '',
    payer_last_name: customerData?.lastName || '',
    payer_doc_type: 'CPF',
    payer_doc_number: ''
  });
  
  const [boletoData, setBoletoData] = useState({
    payer_email: customerData?.email || '',
    payer_first_name: customerData?.firstName || '',
    payer_last_name: customerData?.lastName || '',
    payer_doc_type: 'CPF',
    payer_doc_number: ''
  });
  
  const [installments, setInstallments] = useState([]);
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [cardToken, setCardToken] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Refs
  const mpRef = useRef(null);
  
  // Configuração do MercadoPago SDK
  const publicKey = environment === 'sandbox' 
    ? 'TEST-6470757372800949-072017-f45dc4b7ff499723f495a8525cfc9112-1211284486'
    : 'PRODUCTION_PUBLIC_KEY'; // Será substituída pelas credenciais de produção
    
  useEffect(() => {
    loadMercadoPagoSDK();
    loadPaymentMethods();
  }, []);
  
  const loadMercadoPagoSDK = async () => {
    if (window.MercadoPago) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        try {
          mpRef.current = new window.MercadoPago(publicKey);
          resolve();
        } catch (error) {
          console.error('Error initializing MercadoPago:', error);
          reject(error);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  
  const loadPaymentMethods = async () => {
    try {
      const response = await fetch(
        '/api/payments/mercadopago/transparent/payment-methods'
      );
      const data = await response.json();
      
      if (data.success) {
        setPaymentMethods(data.payment_methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };
  
  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };
  
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  
  const validateCard = () => {
    const errors = {};
    
    if (!cardData.number.replace(/\s/g, '')) {
      errors.number = 'Número do cartão é obrigatório';
    }
    
    if (!cardData.expiry_month || !cardData.expiry_year) {
      errors.expiry = 'Data de validade é obrigatória';
    }
    
    if (!cardData.cvv) {
      errors.cvv = 'CVV é obrigatório';
    }
    
    if (!cardData.cardholder_name.trim()) {
      errors.cardholder_name = 'Nome do portador é obrigatório';
    }
    
    if (!cardData.cardholder_doc_number) {
      errors.cardholder_doc_number = 'CPF é obrigatório';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const createCardToken = async () => {
    if (!mpRef.current || !validateCard()) return null;
    
    try {
      const response = await fetch(
        '/api/payments/mercadopago/transparent/create-card-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card_number: cardData.number.replace(/\s/g, ''),
            expiry_month: parseInt(cardData.expiry_month),
            expiry_year: parseInt(cardData.expiry_year),
            cvv: cardData.cvv,
            cardholder_name: cardData.cardholder_name
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setCardToken(data.token);
        return data.token;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating card token:', error);
      setError('Erro ao processar dados do cartão');
      return null;
    }
  };
  
  const loadInstallments = async (paymentMethodId) => {
    try {
      const response = await fetch(
        `/api/payments/mercadopago/transparent/installments?` +
        `amount=${amount}&payment_method_id=${paymentMethodId}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setInstallments(data.installments);
      }
    } catch (error) {
      console.error('Error loading installments:', error);
    }
  };
  
  const processPayment = async () => {
    setLoading(true);
    setError('');
    setStep('processing');
    
    try {
      let paymentData = {
        order_id: orderId,
        amount: amount,
        description: `Pedido #${orderId.slice(-8)} - Mestres do Café`
      };
      
      if (selectedMethod.startsWith('card_')) {
        const token = await createCardToken();
        if (!token) {
          setLoading(false);
          setStep('form');
          return;
        }
        
        paymentData = {
          ...paymentData,
          payment_method_id: selectedMethod,
          token: token,
          installments: selectedInstallments,
          payer_email: customerData?.email || '',
          payer_first_name: cardData.cardholder_name.split(' ')[0],
          payer_last_name: cardData.cardholder_name.split(' ').slice(1).join(' '),
          payer_doc_type: cardData.cardholder_doc_type,
          payer_doc_number: cardData.cardholder_doc_number.replace(/\D/g, ''),
          enable_3ds: true
        };
      } else if (selectedMethod === 'pix') {
        paymentData = {
          ...paymentData,
          payment_method_id: 'pix',
          payer_email: pixData.payer_email,
          payer_first_name: pixData.payer_first_name,
          payer_last_name: pixData.payer_last_name,
          payer_doc_type: pixData.payer_doc_type,
          payer_doc_number: pixData.payer_doc_number.replace(/\D/g, ''),
          pix_expiration: 3600 // 1 hora
        };
      } else if (selectedMethod === 'bolbradesco') {
        paymentData = {
          ...paymentData,
          payment_method_id: 'bolbradesco',
          payer_email: boletoData.payer_email,
          payer_first_name: boletoData.payer_first_name,
          payer_last_name: boletoData.payer_last_name,
          payer_doc_type: boletoData.payer_doc_type,
          payer_doc_number: boletoData.payer_doc_number.replace(/\D/g, '')
        };
      }
      
      const response = await fetch(
        '/api/payments/mercadopago/transparent/process-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(paymentData)
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setStep('result');
        
        if (result.status === 'approved') {
          onSuccess?.(result);
        } else if (result.status === 'pending') {
          onPending?.(result);
        } else {
          onError?.(result.status_detail);
        }
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Erro ao processar pagamento');
      setStep('form');
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
  
  const getMethodIcon = (method) => {
    if (method.startsWith('card_') || ['visa', 'master', 'elo', 'amex'].includes(method)) {
      return <CreditCard className="h-6 w-6" />;
    } else if (method === 'pix') {
      return <QrCode className="h-6 w-6" />;
    } else if (method === 'bolbradesco') {
      return <FileText className="h-6 w-6" />;
    }
    return <CreditCard className="h-6 w-6" />;
  };
  
  const getMethodName = (method) => {
    const names = {
      'visa': 'Visa',
      'master': 'Mastercard',
      'elo': 'Elo',
      'amex': 'American Express',
      'pix': 'PIX',
      'bolbradesco': 'Boleto Bancário'
    };
    return names[method] || method;
  };
  
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setCardData(prev => ({
        ...prev,
        number: value
      }));
      
      // Detectar bandeira e carregar parcelas
      if (value.length >= 6) {
        const bin = value.substring(0, 6);
        // Lógica para detectar bandeira e carregar parcelas
        if (value.startsWith('4')) {
          loadInstallments('visa');
        } else if (value.startsWith('5') || value.startsWith('2')) {
          loadInstallments('master');
        }
      }
    }
  };
  
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const month = value.substring(0, 2);
    const year = value.substring(2, 4);
    
    setCardData(prev => ({
      ...prev,
      expiry_month: month,
      expiry_year: year
    }));
  };
  
  if (step === 'method') {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pagamento Seguro
          </h2>
          <p className="text-gray-600">Total: {formatAmount(amount)}</p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                setSelectedMethod(method.id);
                setStep('form');
              }}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center">
                {getMethodIcon(method.id)}
                <div className="ml-3 text-left">
                  <p className="font-medium text-gray-900">
                    {getMethodName(method.id)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {method.id === 'pix' && 'Aprovação instantânea'}
                    {method.id.startsWith('card_') && 'Até 12x sem juros'}
                    {method.id === 'bolbradesco' && 'Vencimento em 3 dias'}
                  </p>
                </div>
              </div>
              
              {method.id === 'pix' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  5% desconto
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Lock className="h-4 w-4 mr-2" />
            Pagamento protegido por SSL
          </div>
        </div>
      </div>
    );
  }
  
  if (step === 'form') {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setStep('method')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <div className="flex items-center">
            {getMethodIcon(selectedMethod)}
            <div className="ml-3">
              <h2 className="text-xl font-bold text-gray-900">
                {getMethodName(selectedMethod)}
              </h2>
              <p className="text-sm text-gray-600">
                Total: {formatAmount(amount)}
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        {/* Formulário do Cartão */}
        {selectedMethod.startsWith('card_') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do cartão
              </label>
              <input
                type="text"
                value={formatCardNumber(cardData.number)}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.number ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {fieldErrors.number && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.number}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validade
                </label>
                <input
                  type="text"
                  value={`${cardData.expiry_month}${cardData.expiry_year ? '/' + cardData.expiry_year : ''}`}
                  onChange={handleExpiryChange}
                  placeholder="MM/AA"
                  maxLength="5"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.expiry ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.expiry && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.expiry}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type={showCvv ? 'text' : 'password'}
                    value={cardData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCardData(prev => ({ ...prev, cvv: value }));
                      }
                    }}
                    placeholder="123"
                    className={`w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      fieldErrors.cvv ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.cvv && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.cvv}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome no cartão
              </label>
              <input
                type="text"
                value={cardData.cardholder_name}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  cardholder_name: e.target.value.toUpperCase() 
                }))}
                placeholder="NOME COMO NO CARTÃO"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.cardholder_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {fieldErrors.cardholder_name && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.cardholder_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF do portador
              </label>
              <input
                type="text"
                value={formatCPF(cardData.cardholder_doc_number)}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  cardholder_doc_number: e.target.value.replace(/\D/g, '') 
                }))}
                placeholder="000.000.000-00"
                maxLength="14"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.cardholder_doc_number ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {fieldErrors.cardholder_doc_number && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.cardholder_doc_number}</p>
              )}
            </div>
            
            {installments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parcelas
                </label>
                <select
                  value={selectedInstallments}
                  onChange={(e) => setSelectedInstallments(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {installments.map((installment) => (
                    <option key={installment.installments} value={installment.installments}>
                      {installment.installments}x de {formatAmount(installment.installment_amount)}
                      {installment.installment_rate === 0 ? ' sem juros' : ' com juros'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        
        {/* Formulário PIX */}
        {selectedMethod === 'pix' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Aprovação instantânea com 5% de desconto!
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Total com desconto: {formatAmount(amount * 0.95)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={pixData.payer_first_name}
                  onChange={(e) => setPixData(prev => ({ 
                    ...prev, 
                    payer_first_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={pixData.payer_last_name}
                  onChange={(e) => setPixData(prev => ({ 
                    ...prev, 
                    payer_last_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                value={formatCPF(pixData.payer_doc_number)}
                onChange={(e) => setPixData(prev => ({ 
                  ...prev, 
                  payer_doc_number: e.target.value.replace(/\D/g, '') 
                }))}
                placeholder="000.000.000-00"
                maxLength="14"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={pixData.payer_email}
                onChange={(e) => setPixData(prev => ({ 
                  ...prev, 
                  payer_email: e.target.value 
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        {/* Formulário Boleto */}
        {selectedMethod === 'bolbradesco' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  Processamento em até 2 dias úteis
                </span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                O boleto será enviado para o email cadastrado
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={boletoData.payer_first_name}
                  onChange={(e) => setBoletoData(prev => ({ 
                    ...prev, 
                    payer_first_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={boletoData.payer_last_name}
                  onChange={(e) => setBoletoData(prev => ({ 
                    ...prev, 
                    payer_last_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                value={formatCPF(boletoData.payer_doc_number)}
                onChange={(e) => setBoletoData(prev => ({ 
                  ...prev, 
                  payer_doc_number: e.target.value.replace(/\D/g, '') 
                }))}
                placeholder="000.000.000-00"
                maxLength="14"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={boletoData.payer_email}
                onChange={(e) => setBoletoData(prev => ({ 
                  ...prev, 
                  payer_email: e.target.value 
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        <button
          onClick={processPayment}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Finalizar Pagamento
            </>
          )}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <Lock className="h-4 w-4 inline mr-1" />
          Seus dados estão protegidos com criptografia SSL
        </div>
      </div>
    );
  }
  
  if (step === 'processing') {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Processando pagamento...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto confirmamos sua transação
        </p>
      </div>
    );
  }
  
  return null;
};

export default MercadoPagoTransparentCheckout;