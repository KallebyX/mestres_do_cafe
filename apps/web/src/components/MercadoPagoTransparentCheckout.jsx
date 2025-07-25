import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  QrCode, 
  FileText, 
  Lock, 
  AlertCircle, 
  CheckCircle2,
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
    payer_doc_number: '',
    // Campos de endereço obrigatórios para boleto
    address_street_name: '',
    address_street_number: '',
    address_zip_code: '',
    address_city: '',
    address_federal_unit: ''
  });
  
  // Refs
  const mpRef = useRef(null);
  const cardFormRef = useRef(null);
  
  // Configuração do MercadoPago SDK
  const publicKey = environment === 'sandbox'
    ? 'TEST-78dd54f8-b60d-40f8-b339-24f92a8082b7'
    : 'PRODUCTION_PUBLIC_KEY'; // Será substituída pelas credenciais de produção
    
  useEffect(() => {
    initializeMercadoPago();
    loadPaymentMethods();
  }, []);
  
  const initializeMercadoPago = async () => {
    if (window.MercadoPago) {
      mpRef.current = new window.MercadoPago(publicKey);
      await loadIdentificationTypes();
      return;
    }
    
    // Aguarda o script carregar (já está no HTML)
    let attempts = 0;
    const checkMP = setInterval(() => {
      if (window.MercadoPago || attempts > 50) {
        clearInterval(checkMP);
        if (window.MercadoPago) {
          mpRef.current = new window.MercadoPago(publicKey);
          loadIdentificationTypes();
        }
      }
      attempts++;
    }, 100);
  };
  
  const loadIdentificationTypes = async () => {
    if (!mpRef.current) return;
    
    try {
      const identificationTypes = await mpRef.current.getIdentificationTypes();
      
      const docTypeSelect = document.getElementById('form-checkout__identificationType');
      if (docTypeSelect && identificationTypes) {
        // Limpa opções existentes
        docTypeSelect.innerHTML = '<option value="">Selecione o tipo</option>';
        
        identificationTypes.forEach(type => {
          const option = document.createElement('option');
          option.value = type.id;
          option.textContent = type.name;
          docTypeSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao obter tipos de documento:", error);
    }
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
  
  const initializeCardForm = () => {
    if (!mpRef.current) return;
    
    try {
      cardFormRef.current = mpRef.current.cardForm({
        amount: amount.toString(),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { 
            id: "form-checkout__cardNumber", 
            placeholder: "Número do cartão" 
          },
          expirationDate: { 
            id: "form-checkout__expirationDate", 
            placeholder: "MM/AA" 
          },
          securityCode: { 
            id: "form-checkout__securityCode", 
            placeholder: "CVV" 
          },
          cardholderName: { 
            id: "form-checkout__cardholderName" 
          },
          issuer: { 
            id: "form-checkout__issuer" 
          },
          installments: { 
            id: "form-checkout__installments" 
          },        
          identificationType: { 
            id: "form-checkout__identificationType" 
          },
          identificationNumber: { 
            id: "form-checkout__identificationNumber" 
          },
          cardholderEmail: { 
            id: "form-checkout__cardholderEmail" 
          }
        },
        callbacks: {
          onFormMounted: error => {
            if (error) {
              console.warn("Erro ao montar formulário:", error);
              setError("Erro ao carregar formulário de cartão");
            } else {
              console.log("Formulário montado com sucesso");
            }
          },
          onSubmit: event => {
            event.preventDefault();
            handleCardFormSubmit();
          },
          onFetching: (resource) => {
            const progressBar = document.querySelector(".progress-bar");
            if (progressBar) {
              progressBar.removeAttribute("value");
              return () => progressBar.setAttribute("value", "0");
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar cardForm:', error);
      setError('Erro ao inicializar formulário de cartão');
    }
  };
  
  const handleCardFormSubmit = async () => {
    if (!cardFormRef.current) return;
    
    setLoading(true);
    setError('');
    setStep('processing');
    
    try {
      const cardFormData = cardFormRef.current.getCardFormData();
      
      const {
        paymentMethodId: payment_method_id,
        issuerId: issuer_id,
        cardholderEmail: email,
        amount,
        token,
        installments,
        identificationNumber,
        identificationType
      } = cardFormData;
      
      const paymentData = {
        order_id: orderId,
        amount: parseFloat(amount),
        description: `Pedido #${orderId.slice(-8)} - Mestres do Café`,
        payment_method_id,
        token,
        installments: parseInt(installments),
        issuer_id,
        payer_email: email,
        payer_identification: {
          type: identificationType,
          number: identificationNumber
        },
        enable_3ds: true
      };
      
      await processPayment(paymentData);
      
    } catch (error) {
      console.error('Erro ao processar dados do cartão:', error);
      setError('Erro ao processar dados do cartão');
      setStep('form');
      setLoading(false);
    }
  };
  
  const processPixPayment = async () => {
    setLoading(true);
    setError('');
    setStep('processing');
    
    try {
      const paymentData = {
        order_id: orderId,
        amount: amount,
        description: `Pedido #${orderId.slice(-8)} - Mestres do Café`,
        payment_method_id: 'pix',
        payer_email: pixData.payer_email,
        payer_first_name: pixData.payer_first_name,
        payer_last_name: pixData.payer_last_name,
        payer_doc_type: pixData.payer_doc_type,
        payer_doc_number: pixData.payer_doc_number.replace(/\D/g, ''),
        pix_expiration: 3600 // 1 hora
      };
      
      await processPayment(paymentData);
    } catch (error) {
      console.error('Erro ao processar PIX:', error);
      setError('Erro ao processar pagamento PIX');
      setStep('form');
      setLoading(false);
    }
  };
  
  const processBoletoPayment = async () => {
    setLoading(true);
    setError('');
    setStep('processing');
    
    try {
      const paymentData = {
        order_id: orderId,
        amount: amount,
        description: `Pedido #${orderId.slice(-8)} - Mestres do Café`,
        payment_method_id: 'bolbradesco',
        payer_email: boletoData.payer_email,
        payer_first_name: boletoData.payer_first_name,
        payer_last_name: boletoData.payer_last_name,
        payer_doc_type: boletoData.payer_doc_type,
        payer_doc_number: boletoData.payer_doc_number.replace(/\D/g, ''),
        // Endereço obrigatório para boleto
        payer_address: {
          street_name: boletoData.address_street_name,
          street_number: boletoData.address_street_number,
          zip_code: boletoData.address_zip_code.replace(/\D/g, ''),
          city: boletoData.address_city,
          federal_unit: boletoData.address_federal_unit
        }
      };
      
      await processPayment(paymentData);
    } catch (error) {
      console.error('Erro ao processar boleto:', error);
      setError('Erro ao processar pagamento por boleto');
      setStep('form');
      setLoading(false);
    }
  };
  
  const processPayment = async (paymentData) => {
    try {
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
  
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  
  const formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
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
  
  // Seleção de método de pagamento
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
                // Inicializar cardForm para métodos de cartão
                if (method.id.startsWith('card_') || ['visa', 'master', 'elo', 'amex'].includes(method.id)) {
                  setTimeout(initializeCardForm, 100);
                }
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
                    {(method.id.startsWith('card_') || ['visa', 'master', 'elo', 'amex'].includes(method.id)) && 'Até 12x sem juros'}
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
  
  // Formulários de pagamento
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
        
        {/* Formulário do Cartão - Estrutura exata do prompt.md */}
        {(selectedMethod.startsWith('card_') || ['visa', 'master', 'elo', 'amex'].includes(selectedMethod)) && (
          <form id="form-checkout">
            <div id="form-checkout__cardNumber" className="container mb-4 p-3 border rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div id="form-checkout__expirationDate" className="container p-3 border rounded-lg"></div>
              <div id="form-checkout__securityCode" className="container p-3 border rounded-lg"></div>
            </div>
            <input 
              type="text" 
              id="form-checkout__cardholderName" 
              placeholder="Titular do cartão"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select 
              id="form-checkout__issuer"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione o banco</option>
            </select>
            <select 
              id="form-checkout__installments"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione as parcelas</option>
            </select>
            <select 
              id="form-checkout__identificationType"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tipo de documento</option>
            </select>
            <input 
              type="text" 
              id="form-checkout__identificationNumber" 
              placeholder="CPF do titular"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input 
              type="email" 
              id="form-checkout__cardholderEmail" 
              placeholder="E-mail"
              defaultValue={customerData?.email || ''}
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="submit" 
              id="form-checkout__submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pagar
                </>
              )}
            </button>
            <progress value="0" className="progress-bar w-full mt-4 hidden">Carregando...</progress>
          </form>
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
            
            <button
              onClick={processPixPayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Finalizar Pagamento PIX
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Formulário Boleto com campos de endereço */}
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
            
            {/* Campos de endereço obrigatórios para boleto */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço de Cobrança</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rua/Logradouro
                  </label>
                  <input
                    type="text"
                    value={boletoData.address_street_name}
                    onChange={(e) => setBoletoData(prev => ({ 
                      ...prev, 
                      address_street_name: e.target.value 
                    }))}
                    placeholder="Nome da rua"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={boletoData.address_street_number}
                    onChange={(e) => setBoletoData(prev => ({ 
                      ...prev, 
                      address_street_number: e.target.value 
                    }))}
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formatCEP(boletoData.address_zip_code)}
                    onChange={(e) => setBoletoData(prev => ({ 
                      ...prev, 
                      address_zip_code: e.target.value.replace(/\D/g, '') 
                    }))}
                    placeholder="00000-000"
                    maxLength="9"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={boletoData.address_city}
                    onChange={(e) => setBoletoData(prev => ({ 
                      ...prev, 
                      address_city: e.target.value 
                    }))}
                    placeholder="Cidade"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={boletoData.address_federal_unit}
                    onChange={(e) => setBoletoData(prev => ({ 
                      ...prev, 
                      address_federal_unit: e.target.value 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Estado</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button
              onClick={processBoletoPayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Gerar Boleto
                </>
              )}
            </button>
          </div>
        )}
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <Lock className="h-4 w-4 inline mr-1" />
          Seus dados estão protegidos com criptografia SSL
        </div>
      </div>
    );
  }
  
  // Tela de processamento
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