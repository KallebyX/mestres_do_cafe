import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, MapPin, 
  AlertCircle, Check, Building, Calendar,
  MessageSquare, ShoppingCart, DollarSign
} from 'lucide-react';

const CustomerModal = ({ 
  isOpen, 
  onClose, 
  customer = null, 
  onSuccess,
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);

  // Preencher formulário quando editar cliente existente
  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
        password: '' // Nunca preencher senha
      });
      
      // Se for modo view, carregar detalhes completos
      if (mode === 'view') {
        loadCustomerDetails(customer.id);
      }
    } else if (!customer && isOpen) {
      // Reset para novo cliente
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        password: ''
      });
    }
    setErrors([]);
  }, [customer, isOpen, mode]);

  const loadCustomerDetails = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCustomerDetails(result);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.name.trim()) {
      newErrors.push('Nome é obrigatório');
    }
    
    if (!formData.email.trim()) {
      newErrors.push('Email é obrigatório');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Email inválido');
    }
    
    if (mode === 'create' && !formData.password) {
      newErrors.push('Senha é obrigatória para novos clientes');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar dados
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      let response;
      let url;
      let method;
      
      if (mode === 'create') {
        url = 'http://localhost:5001/api/admin/customers';
        method = 'POST';
      } else {
        url = `http://localhost:5001/api/admin/customers/${customer.id}`;
        method = 'PUT';
      }

      // Remover senha vazia para updates
      const submitData = { ...formData };
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        onSuccess && onSuccess(result.customer || result, mode);
        onClose();
      } else {
        setErrors([result.error || 'Erro ao salvar cliente']);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setErrors(['Erro interno do servidor']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreateMode ? 'Novo Cliente' : isEditMode ? 'Editar Cliente' : 'Detalhes do Cliente'}
              </h2>
              <p className="text-sm text-slate-600">
                {isCreateMode ? 'Adicione um novo cliente manualmente' : 
                 isEditMode ? 'Atualize as informações do cliente' : 
                 'Visualize todas as informações do cliente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Erros */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Corrija os seguintes erros:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {isViewMode ? (
            /* View Mode - Detailed Customer View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">👤 Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                      <p className="text-slate-900">{customerDetails?.name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <p className="text-slate-900">{customerDetails?.email || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <p className="text-slate-900">{customerDetails?.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                      <p className="text-slate-900">{customerDetails?.address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Purchase History */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">🛒 Histórico de Compras</h3>
                  <div className="space-y-3">
                    {customerDetails?.orders?.map((order, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">Pedido #{order.id}</p>
                            <p className="text-sm text-slate-600">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">R$ {order.total.toFixed(2)}</p>
                            <p className="text-sm text-slate-600">{order.items_count} itens</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status === 'delivered' ? 'Entregue' :
                             order.status === 'processing' ? 'Processando' :
                             'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactions */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">💬 Interações</h3>
                  <div className="space-y-3">
                    {customerDetails?.interactions?.map((interaction, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-slate-900">{interaction.subject}</p>
                              <span className="text-xs text-slate-500">
                                {new Date(interaction.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{interaction.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">📊 Estatísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total gasto:</span>
                      <span className="font-medium">R$ {customerDetails?.total_spent?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total pedidos:</span>
                      <span className="font-medium">{customerDetails?.total_orders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Último login:</span>
                      <span className="font-medium text-sm">
                        {customerDetails?.last_login ? new Date(customerDetails.last_login).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-medium text-slate-900 mb-3">📝 Notas</h4>
                  <p className="text-sm text-slate-600">
                    {customerDetails?.notes || 'Nenhuma nota registrada'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Form Mode - Create/Edit */
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Senha {isCreateMode && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={isCreateMode ? "Digite uma senha" : "Digite uma nova senha (opcional)"}
                    required={isCreateMode}
                  />
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Rua, número, bairro, cidade, estado"
                  />
                </div>

                {/* Notas */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Adicione notas internas sobre o cliente..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isCreateMode ? 'Criar Cliente' : 'Atualizar Cliente'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;