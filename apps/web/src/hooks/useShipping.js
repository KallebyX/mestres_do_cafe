import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar operações de envio
 */
export const useShipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calcular frete
  const calculateShipping = useCallback(async (products, destinationCep) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shipping/melhor-envio/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_cep: '97010-000', // CEP da empresa
          destination_cep: destinationCep,
          products: products.map(product => ({
            name: product.name || 'Produto',
            weight: product.weight || 0.5,
            width: product.width || 10,
            height: product.height || 10,
            length: product.length || 15,
            quantity: product.quantity || 1,
            price: product.price || 0
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao calcular frete');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          quotes: data.quotes || [],
          fallback: data.fallback || false
        };
      } else {
        throw new Error(data.error || 'Erro ao calcular frete');
      }
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Rastrear envio
  const trackShipment = useCallback(async (trackingCode) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shipping/melhor-envio/track/${trackingCode}`);

      if (!response.ok) {
        throw new Error('Erro ao rastrear envio');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          tracking_data: data.tracking_data
        };
      } else {
        throw new Error(data.error || 'Erro ao rastrear envio');
      }
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar envio (admin)
  const createShipment = useCallback(async (orderData, token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shipping/melhor-envio/create-shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar envio');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          shipment_id: data.shipment_id,
          tracking_code: data.tracking_code,
          label_url: data.label_url,
          service_name: data.service_name,
          price: data.price
        };
      } else {
        throw new Error(data.error || 'Erro ao criar envio');
      }
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Listar envios (admin)
  const listShipments = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shipping/melhor-envio/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar envios');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          shipments: data.shipments || [],
          total: data.total || 0
        };
      } else {
        throw new Error(data.error || 'Erro ao carregar envios');
      }
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar envio (admin)
  const cancelShipment = useCallback(async (shipmentId, token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shipping/melhor-envio/cancel-shipment/${shipmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar envio');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: data.message
        };
      } else {
        throw new Error(data.error || 'Erro ao cancelar envio');
      }
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Formatar valores para exibição
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  const formatDeliveryTime = useCallback((days) => {
    if (days === 1) return '1 dia útil';
    return `${days} dias úteis`;
  }, []);

  const formatCep = useCallback((cep) => {
    const cleaned = cep.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
    if (match) {
      return match[1] + (match[2] ? '-' + match[2] : '');
    }
    return cep;
  }, []);

  // Validar CEP
  const validateCep = useCallback((cep) => {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
  }, []);

  return {
    // Estado
    loading,
    error,
    
    // Ações
    calculateShipping,
    trackShipment,
    createShipment,
    listShipments,
    cancelShipment,
    clearError,
    
    // Utilitários
    formatPrice,
    formatDeliveryTime,
    formatCep,
    validateCep
  };
};

export default useShipping;