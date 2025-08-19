import React, { useState, useEffect } from 'react';
import { Truck, Package, Clock, DollarSign, Shield, MapPin } from 'lucide-react';
import { buildApiUrl } from '../config/api.js';

const ShippingCalculator = ({ 
  products = [], 
  onQuoteSelect, 
  defaultDestinationCep = '',
  showDetails = true 
}) => {
  const [destinationCep, setDestinationCep] = useState(defaultDestinationCep);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  const calculateShipping = async () => {
    if (!destinationCep || destinationCep.length < 8) {
      setError('Por favor, informe um CEP válido');
      return;
    }

    if (!products || products.length === 0) {
      setError('Nenhum produto selecionado');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(buildApiUrl('api/melhor-envio/calculate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin_cep: '97010-000', // CEP da empresa (Santa Maria - RS)
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

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuotes(data.quotes || []);
          if (data.fallback) {
            setError('Usando cotações estimadas (Melhor Envio não configurado)');
          }
        } else {
          setError(data.error || 'Erro ao calcular frete');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro na comunicação com o servidor');
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSelect = (quote) => {
    setSelectedQuote(quote);
    onQuoteSelect?.(quote);
  };

  const formatCep = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
    if (match) {
      return match[1] + (match[2] ? '-' + match[2] : '');
    }
    return value;
  };

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    if (formatted.length <= 9) {
      setDestinationCep(formatted);
    }
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDeliveryTime = (days) => {
    if (days === 1) return '1 dia útil';
    return `${days} dias úteis`;
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('sedex') || name.includes('expres')) {
      return <Clock className="h-5 w-5 text-red-600" />;
    } else if (name.includes('econom')) {
      return <DollarSign className="h-5 w-5 text-green-600" />;
    }
    return <Package className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Truck className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Calcular Frete</h3>
      </div>

      {/* Input CEP */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CEP de Entrega
        </label>
        <div className="flex">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={destinationCep}
              onChange={handleCepChange}
              placeholder="00000-000"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={calculateShipping}
            disabled={loading || !destinationCep}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculando...
              </div>
            ) : (
              'Calcular'
            )}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Cotações */}
      {quotes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Opções de Entrega
          </h4>
          
          {quotes.map((quote, index) => (
            <div
              key={index}
              onClick={() => handleQuoteSelect(quote)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedQuote?.service_code === quote.service_code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getServiceIcon(quote.service_name)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">
                        {quote.carrier_name}
                      </h5>
                      <span className="text-sm text-gray-500">
                        {quote.service_name}
                      </span>
                    </div>
                    
                    {showDetails && (
                      <p className="text-sm text-gray-600 mt-1">
                        {quote.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDeliveryTime(quote.delivery_time)}
                      </span>
                      
                      {quote.insurance_included && (
                        <span className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          Seguro incluído
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatAmount(quote.price)}
                  </div>
                  {showDetails && quote.price > 0 && (
                    <div className="text-sm text-gray-500">
                      ou até 3x de {formatAmount(quote.price / 3)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações adicionais */}
      {quotes.length > 0 && showDetails && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Informações Importantes
          </h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Prazos calculados em dias úteis</li>
                            <li>• Frete grátis para compras acima de R$ 200,00 em Santa Maria</li>
            <li>• Rastreamento incluído em todas as modalidades</li>
            <li>• Seguro automático contra perdas e avarias</li>
          </ul>
        </div>
      )}

      {/* Origem */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Enviado de Santa Maria - RS (CEP: 97010-000)
      </div>
    </div>
  );
};

export default ShippingCalculator;