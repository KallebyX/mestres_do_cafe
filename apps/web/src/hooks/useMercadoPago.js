/**
 * Hook personalizado para integração MercadoPago
 * ==============================================
 * 
 * Este hook gerencia toda a lógica de integração com o MercadoPago,
 * incluindo inicialização do SDK, processamento de pagamentos e
 * gerenciamento de estados.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  MERCADO_PAGO_CONFIG, 
  MercadoPagoUtils, 
  PAYMENT_STATES, 
  ERROR_CODES 
} from '../config/mercadopago.js';

// Constantes
const SDK_URL = 'https://sdk.mercadopago.com/js/v2';

/**
 * Hook principal do MercadoPago
 */
export const useMercadoPago = (options = {}) => {
  // Estados
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mp, setMp] = useState(null);

  // Configurações
  const {
    onPaymentSuccess = () => {},
    onPaymentError = () => {},
    onPaymentPending = () => {},
    autoLoad = true
  } = options;

  /**
   * Carrega o SDK do MercadoPago
   */
  const loadMercadoPagoSDK = useCallback(async () => {
    if (window.MercadoPago) {
      return window.MercadoPago;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.onload = () => {
        if (window.MercadoPago) {
          resolve(window.MercadoPago);
        } else {
          reject(new Error('Falha ao carregar SDK do MercadoPago'));
        }
      };
      script.onerror = () => {
        reject(new Error('Erro ao carregar SDK do MercadoPago'));
      };
      document.head.appendChild(script);
    });
  }, []);

  /**
   * Inicializa o MercadoPago
   */
  const initializeMercadoPago = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const MercadoPago = await loadMercadoPagoSDK();
      const publicKey = MercadoPagoUtils.getPublicKey();
      
      const mpInstance = new MercadoPago(publicKey, {
        locale: MERCADO_PAGO_CONFIG.sdk.locale
      });

      setMp(mpInstance);
      setIsLoaded(true);
      
      return mpInstance;
    } catch (err) {
      console.error('Erro ao inicializar MercadoPago:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadMercadoPagoSDK]);

  /**
   * Cria token de cartão
   */
  const createCardToken = useCallback(async (cardData) => {
    if (!mp) {
      throw new Error('MercadoPago não inicializado');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await mp.createCardToken({
        cardNumber: cardData.card_number.replace(/\s/g, ''),
        cardholderName: cardData.cardholder_name,
        cardExpirationMonth: cardData.expiry_month,
        cardExpirationYear: cardData.expiry_year,
        securityCode: cardData.cvv,
        identificationType: cardData.payer_doc_type || 'CPF',
        identificationNumber: cardData.payer_doc_number
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar token');
      }

      return response.id;
    } catch (err) {
      console.error('Erro ao criar token:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mp]);

  /**
   * Processa pagamento
   */
  const processPayment = useCallback(async (paymentData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validação básica
      const validation = MercadoPagoUtils.validatePaymentData(paymentData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const apiUrl = MercadoPagoUtils.getApiUrl();
      const response = await fetch(`${apiUrl}/transparent/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no processamento');
      }

      const result = await response.json();

      // Chama callbacks baseado no status
      switch (result.status) {
        case 'approved':
          onPaymentSuccess(result);
          break;
        case 'pending':
        case 'in_process':
          onPaymentPending(result);
          break;
        case 'rejected':
        case 'cancelled':
          onPaymentError(result);
          break;
      }

      return result;
    } catch (err) {
      console.error('Erro no processamento:', err);
      setError(err.message);
      onPaymentError({ error: err.message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onPaymentSuccess, onPaymentError, onPaymentPending]);

  /**
   * Obtém métodos de pagamento
   */
  const getPaymentMethods = useCallback(async () => {
    try {
      const apiUrl = MercadoPagoUtils.getApiUrl();
      const response = await fetch(`${apiUrl}/transparent/payment-methods`);

      if (!response.ok) {
        throw new Error('Erro ao obter métodos de pagamento');
      }

      const data = await response.json();
      return data.payment_methods || [];
    } catch (err) {
      console.error('Erro ao obter métodos:', err);
      setError(err.message);
      return [];
    }
  }, []);

  /**
   * Calcula parcelas
   */
  const getInstallments = useCallback(async (amount, paymentMethodId) => {
    try {
      const apiUrl = MercadoPagoUtils.getApiUrl();
      const response = await fetch(
        `${apiUrl}/transparent/installments?amount=${amount}&payment_method_id=${paymentMethodId}`
      );

      if (!response.ok) {
        throw new Error('Erro ao calcular parcelas');
      }

      const data = await response.json();
      return data.installments || [];
    } catch (err) {
      console.error('Erro ao calcular parcelas:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Inicialização automática
  useEffect(() => {
    if (autoLoad && !isLoaded && !isLoading) {
      initializeMercadoPago().catch(console.error);
    }
  }, [autoLoad, isLoaded, isLoading, initializeMercadoPago]);

  return {
    // Estados
    isLoaded,
    isLoading,
    error,
    mp,
    
    // Métodos
    initialize: initializeMercadoPago,
    createCardToken,
    processPayment,
    getPaymentMethods,
    getInstallments,
    
    // Utilitários
    clearError: () => setError(null),
    formatCurrency: MercadoPagoUtils.formatCurrency,
    isPaymentMethodEnabled: MercadoPagoUtils.isPaymentMethodEnabled
  };
};

/**
 * Hook para gerenciamento de formulário de pagamento
 */
export const usePaymentForm = (paymentMethod = 'card') => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  /**
   * Atualiza campo do formulário
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Remove erro do campo quando atualizado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Valida formulário
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validações básicas sempre necessárias
    if (!formData.payer_email || !MercadoPagoUtils.isValidEmail(formData.payer_email)) {
      newErrors.payer_email = 'Email inválido';
    }

    if (!formData.payer_doc_number) {
      newErrors.payer_doc_number = 'CPF/CNPJ obrigatório';
    }

    // Validações específicas por método
    if (paymentMethod === 'card') {
      if (!formData.card_number || formData.card_number.length < 16) {
        newErrors.card_number = 'Número do cartão inválido';
      }

      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'CVV inválido';
      }

      if (!formData.cardholder_name) {
        newErrors.cardholder_name = 'Nome obrigatório';
      }

      if (!formData.expiry_month || !formData.expiry_year) {
        newErrors.expiry = 'Data de validade obrigatória';
      }
    }

    if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
      if (!formData.payer_first_name) {
        newErrors.payer_first_name = 'Nome obrigatório';
      }

      if (!formData.payer_last_name) {
        newErrors.payer_last_name = 'Sobrenome obrigatório';
      }
    }

    setErrors(newErrors);
    const formIsValid = Object.keys(newErrors).length === 0;
    setIsValid(formIsValid);
    
    return formIsValid;
  }, [formData, paymentMethod]);

  /**
   * Reset do formulário
   */
  const resetForm = useCallback(() => {
    setFormData({});
    setErrors({});
    setIsValid(false);
  }, []);

  // Revalida quando dados mudam
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      validateForm();
    }
  }, [formData, validateForm]);

  return {
    formData,
    errors,
    isValid,
    updateField,
    validateForm,
    resetForm
  };
};

/**
 * Hook para gerenciamento de status de pagamento
 */
export const usePaymentStatus = () => {
  const [payments, setPayments] = useState(new Map());

  /**
   * Adiciona pagamento para tracking
   */
  const trackPayment = useCallback((paymentId, initialStatus = 'pending') => {
    setPayments(prev => new Map(prev.set(paymentId, {
      status: initialStatus,
      timestamp: new Date(),
      updates: []
    })));
  }, []);

  /**
   * Atualiza status do pagamento
   */
  const updatePaymentStatus = useCallback((paymentId, newStatus, data = {}) => {
    setPayments(prev => {
      const payment = prev.get(paymentId);
      if (!payment) return prev;

      const updatedPayment = {
        ...payment,
        status: newStatus,
        updates: [
          ...payment.updates,
          {
            status: newStatus,
            timestamp: new Date(),
            data
          }
        ]
      };

      return new Map(prev.set(paymentId, updatedPayment));
    });
  }, []);

  /**
   * Obtém status do pagamento
   */
  const getPaymentStatus = useCallback((paymentId) => {
    const payment = payments.get(paymentId);
    if (!payment) return null;

    return {
      ...payment,
      statusInfo: PAYMENT_STATES[payment.status] || {
        label: payment.status,
        color: 'default',
        description: 'Status desconhecido'
      }
    };
  }, [payments]);

  /**
   * Remove pagamento do tracking
   */
  const stopTracking = useCallback((paymentId) => {
    setPayments(prev => {
      const newMap = new Map(prev);
      newMap.delete(paymentId);
      return newMap;
    });
  }, []);

  return {
    trackPayment,
    updatePaymentStatus,
    getPaymentStatus,
    stopTracking,
    getAllPayments: () => Array.from(payments.entries())
  };
};

// Exporta hooks como padrão
export default {
  useMercadoPago,
  usePaymentForm,
  usePaymentStatus
};