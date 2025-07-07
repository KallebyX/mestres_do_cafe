import { apiRequest } from './api';

// Serviços de integração com Melhor Envio
export const shippingAPI = {
  // Calcular frete usando API do Melhor Envio
  async calculateShipping(cepOrigem, cepDestino, produtos) {
    try {
      const response = await fetch('/api/melhor-envio/calcular-frete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          cep_origem: cepOrigem,
          cep_destino: cepDestino,
          produtos: produtos
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao calcular frete');
      }

      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Validar CEP
  validateCEP(cep) {
    const cepRegex = /^[0-9]{8}$/;
    return cepRegex.test(cep.replace(/\D/g, ''));
  },

  // Formatar CEP
  formatCEP(cep) {
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  },

  // Buscar endereço por CEP (usando ViaCEP)
  async getAddressByCEP(cep) {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (!this.validateCEP(cleanCEP)) {
        throw new Error('CEP inválido');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        success: true,
        data: {
          cep: data.cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          ibge: data.ibge
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default shippingAPI;