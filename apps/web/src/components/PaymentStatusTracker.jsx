import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, DollarSign } from 'lucide-react';
import { apiClient } from '../config/api';
import EscrowStatus from './EscrowStatus';

const PaymentStatusTracker = ({ paymentId, onStatusChange }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus();
      
      // Verificar status a cada 30 segundos se pagamento estiver pendente
      const interval = setInterval(() => {
        if (payment && ['pending', 'processing'].includes(payment.status)) {
          checkPaymentStatus();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [paymentId, payment?.status]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(`/api/payments/mercadopago/payment/${paymentId}`);
      
      if (response.data.success) {
        const oldStatus = payment?.status;
        setPayment(response.data.payment);
        
        // Notificar mudança de status
        if (oldStatus && oldStatus !== response.data.payment.status) {
          onStatusChange?.(response.data.payment.status, oldStatus);
        }
      } else {
        setError(response.data.error || 'Erro ao buscar status do pagamento');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = () => {
    if (!payment) return null;

    switch (payment.status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Pagamento Pendente',
          description: 'Aguardando confirmação do pagamento',
          showRefresh: true
        };
      case 'processing':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Processando Pagamento',
          description: 'Seu pagamento está sendo processado',
          showRefresh: true
        };
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Pagamento Aprovado',
          description: 'Seu pagamento foi aprovado com sucesso',
          showRefresh: false
        };
      case 'held':
        return {
          icon: AlertTriangle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Pagamento em Escrow',
          description: 'Pagamento retido até confirmação da entrega',
          showRefresh: false
        };
      case 'released':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Pagamento Liberado',
          description: 'Pagamento liberado para o vendedor',
          showRefresh: false
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Pagamento Rejeitado',
          description: 'Seu pagamento foi rejeitado',
          showRefresh: true
        };
      case 'refunded':
        return {
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          title: 'Pagamento Estornado',
          description: 'O valor foi estornado para sua conta',
          showRefresh: false
        };
      case 'disputed':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Pagamento em Disputa',
          description: 'Há uma disputa em andamento para este pagamento',
          showRefresh: false
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Status Desconhecido',
          description: 'Status do pagamento não identificado',
          showRefresh: true
        };
    }
  };

  const formatAmount = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !payment) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button
          onClick={checkPaymentStatus}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-600">
        Pagamento não encontrado
      </div>
    );
  }

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Status Principal */}
      <div className={`rounded-lg border p-6 ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Icon className={`h-6 w-6 ${config.color} mr-3`} />
            <div>
              <h3 className={`text-lg font-medium ${config.color}`}>
                {config.title}
              </h3>
              <p className="text-sm text-gray-600">
                {config.description}
              </p>
            </div>
          </div>
          
          {config.showRefresh && (
            <button
              onClick={checkPaymentStatus}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
              title="Atualizar status"
            >
              <Clock className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Informações do Pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Valor:</span>
            <p className="text-gray-900">{formatAmount(payment.amount)}</p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Método:</span>
            <p className="text-gray-900 capitalize">
              {payment.payment_method?.replace('_', ' ') || 'Mercado Pago'}
            </p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Data:</span>
            <p className="text-gray-900">
              {formatDate(payment.created_at)}
            </p>
          </div>
        </div>

        {/* ID da Transação */}
        {payment.provider_transaction_id && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-500">
              ID da Transação: {payment.provider_transaction_id}
            </span>
          </div>
        )}
      </div>

      {/* Status do Escrow (se aplicável) */}
      {payment.status === 'held' && (
        <EscrowStatus payment={payment} />
      )}

      {/* Timeline do Pagamento */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Histórico do Pagamento
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Pagamento criado
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(payment.created_at)}
              </p>
            </div>
          </div>

          {payment.processed_at && (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Pagamento processado
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(payment.processed_at)}
                </p>
              </div>
            </div>
          )}

          {payment.held_at && (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-600 rounded-full"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Pagamento retido em escrow
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(payment.held_at)}
                </p>
              </div>
            </div>
          )}

          {payment.released_at && (
            <div className="flex items-center">
              <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Pagamento liberado
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(payment.released_at)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusTracker;