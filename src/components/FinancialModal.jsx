import React, { useState, useEffect } from 'react';
// import { _X, _Save, _Calendar, _DollarSign, _User, _Building, _AlertCircle, _CheckCircle } from 'lucide-react'; // Temporarily commented - unused import

const _FinancialModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  type = 'receivable', // 'receivable', 'payable', 'bank'
  data = null,
  onSave
}) => {
  const [formData, setFormData] = useState({
    // Campos comuns
    amount: '',
    due_date: '',
    description: '',
    status: 'pendente',
    
    // Específicos para recebimentos
    customer_name: '',
    customer_email: '',
    installment: '1/1',
    
    // Específicos para pagamentos  
    supplier_name: '',
    supplier_email: '',
    category: 'geral',
    
    // Específicos para bancos
    bank_name: '',
    account_number: '',
    agency: '',
    account_type: 'conta-corrente',
    current_balance: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        setFormData({
          ...formData,
          ...data,
          amount: data.valor || data.amount || '',
          due_date: data.vencimento || data.due_date || '',
          customer_name: data.cliente || data.customer_name || '',
          supplier_name: data.fornecedor || data.supplier_name || '',
          current_balance: data.saldo || data.current_balance || '',
          bank_name: data.banco || data.bank_name || '',
          account_number: data.conta || data.account_number || '',
          agency: data.agencia || data.agency || ''
        });
      } else {
        // Reset para criar novo
        setFormData({
          amount: '',
          due_date: '',
          description: '',
          status: 'pendente',
          customer_name: '',
          customer_email: '',
          installment: '1/1',
          supplier_name: '',
          supplier_email: '',
          category: 'geral',
          bank_name: '',
          account_number: '',
          agency: '',
          account_type: 'conta-corrente',
          current_balance: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, data]);

  const _validateForm = () => {
    const _newErrors = {};

    if (type === 'bank') {
      if (!formData.bank_name.trim()) newErrors.bank_name = 'Nome do banco é obrigatório';
      if (!formData.account_number.trim()) newErrors.account_number = 'Número da conta é obrigatório';
      if (!formData.current_balance || parseFloat(formData.current_balance) < 0) {
        newErrors.current_balance = 'Saldo inicial deve ser um valor válido';
      }
    } else {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero';
      }
      if (!formData.due_date) newErrors.due_date = 'Data de vencimento é obrigatória';
      
      if (type === 'receivable') {
        if (!formData.customer_name.trim()) newErrors.customer_name = 'Nome do cliente é obrigatório';
      } else if (type === 'payable') {
        if (!formData.supplier_name.trim()) newErrors.supplier_name = 'Nome do fornecedor é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const _handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const _getTitle = () => {
    const _action = mode === 'create' ? 'Nova' : mode === 'edit' ? 'Editar' : 'Visualizar';
    const _typeTitle = {
      receivable: 'Conta a Receber',
      payable: 'Conta a Pagar', 
      bank: 'Conta Bancária'
    };
    return `${action} ${typeTitle[type]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campos para Conta Bancária */}
          {type === 'bank' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Banco *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => handleChange('bank_name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.bank_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Banco do Brasil"
                      disabled={mode === 'view'}
                    />
                  </div>
                  {errors.bank_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.bank_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => handleChange('account_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === 'view'}
                  >
                    <option value="conta-corrente">Conta Corrente</option>
                    <option value="conta-poupanca">Conta Poupança</option>
                    <option value="conta-digital">Conta Digital</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agência
                  </label>
                  <input
                    type="text"
                    value={formData.agency}
                    onChange={(e) => handleChange('agency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 1234-5"
                    disabled={mode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Conta *
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => handleChange('account_number', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.account_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 12345-6"
                    disabled={mode === 'view'}
                  />
                  {errors.account_number && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.account_number}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo Inicial *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_balance}
                    onChange={(e) => handleChange('current_balance', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.current_balance ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                    disabled={mode === 'view'}
                  />
                </div>
                {errors.current_balance && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.current_balance}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Campos para Contas a Receber/Pagar */}
          {(type === 'receivable' || type === 'payable') && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {type === 'receivable' ? 'Cliente *' : 'Fornecedor *'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={type === 'receivable' ? formData.customer_name : formData.supplier_name}
                      onChange={(e) => handleChange(
                        type === 'receivable' ? 'customer_name' : 'supplier_name', 
                        e.target.value
                      )}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[type === 'receivable' ? 'customer_name' : 'supplier_name'] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={type === 'receivable' ? 'Nome do cliente' : 'Nome do fornecedor'}
                      disabled={mode === 'view'}
                    />
                  </div>
                  {errors[type === 'receivable' ? 'customer_name' : 'supplier_name'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors[type === 'receivable' ? 'customer_name' : 'supplier_name']}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={type === 'receivable' ? formData.customer_email : formData.supplier_email}
                    onChange={(e) => handleChange(
                      type === 'receivable' ? 'customer_email' : 'supplier_email', 
                      e.target.value
                    )}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                    disabled={mode === 'view'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.amount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0,00"
                      disabled={mode === 'view'}
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleChange('due_date', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.due_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={mode === 'view'}
                    />
                  </div>
                  {errors.due_date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.due_date}
                    </p>
                  )}
                </div>
              </div>

              {type === 'receivable' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parcela
                    </label>
                    <input
                      type="text"
                      value={formData.installment}
                      onChange={(e) => handleChange('installment', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1/1"
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={mode === 'view'}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="recebido">Recebido</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </div>
                </div>
              )}

              {type === 'payable' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={mode === 'view'}
                    >
                      <option value="geral">Geral</option>
                      <option value="materia-prima">Matéria Prima</option>
                      <option value="operacional">Operacional</option>
                      <option value="logistica">Logística</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={mode === 'view'}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Observações adicionais..."
                  disabled={mode === 'view'}
                />
              </div>
            </>
          )}

          {/* Actions */}
          {mode !== 'view' && (
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {mode === 'create' ? 'Criar' : 'Salvar'}
              </button>
            </div>
          )}

          {/* View mode actions */}
          {mode === 'view' && (
            <div className="flex items-center justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FinancialModal; 