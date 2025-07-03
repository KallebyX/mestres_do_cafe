import React, { useState, useEffect } from 'react';
// import { _X, _Save, _AlertCircle, _CheckCircle, _User, _Building, _Mail, _Phone, _MapPin, _FileText, _Loader } from 'lucide-react'; // Temporarily commented - unused import
import { _createManualCustomer, _editAdminCustomer, _validateCPF, _validateCNPJ, _validateEmail, _formatCPF, _formatCNPJ, _formatPhone, _formatCEP, _fetchAddressByCEP } from '../lib/admin-customers-api';

const _CustomerCreateModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' | 'edit'
  customer = null,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    user_type: 'cliente_pf',
    phone: '',
    cpf_cnpj: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    company_name: '',
    company_segment: '',
    observacao: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  // Estados brasileiros
  const _states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Preencher formulário em modo edição
  useEffect(() => {
    if (mode === 'edit' && customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        user_type: customer.user_type || 'cliente_pf',
        phone: customer.phone || '',
        cpf_cnpj: customer.cpf_cnpj || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        company_name: customer.company_name || '',
        company_segment: customer.company_segment || '',
        observacao: customer.observacao || ''
      });
    } else {
      // Reset em modo criação
      setFormData({
        name: '',
        email: '',
        user_type: 'cliente_pf',
        phone: '',
        cpf_cnpj: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        company_name: '',
        company_segment: '',
        observacao: ''
      });
    }
    setError('');
    setSuccess('');
    setFieldErrors({});
  }, [mode, customer, isOpen]);

  const _handleInputChange = (e) => {
    const { name, value } = e.target;
    let _formattedValue = value;

    // Formatação automática
    if (name === 'cpf_cnpj') {
      if (formData.user_type === 'cliente_pf') {
        formattedValue = formatCPF(value);
      } else {
        formattedValue = formatCNPJ(value);
      }
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'zip_code') {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Limpar erro do campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const _handleUserTypeChange = (e) => {
    const _newType = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      user_type: newType,
      cpf_cnpj: '', // Limpar documento ao mudar tipo
      company_name: newType === 'cliente_pf' ? '' : prev.company_name,
      company_segment: newType === 'cliente_pf' ? '' : prev.company_segment
    }));
  };

  const _handleCEPBlur = async () => {
    const _cep = formData.zip_code.replace(/[^\d]/g, '');
    if (cep.length === 8) {
      setIsLoadingCEP(true);
      try {
        const _result = await fetchAddressByCEP(cep);
        if (result.success) {
          setFormData(prev => ({
            ...prev,
            address: result.address.street || prev.address,
            city: result.address.city || prev.city,
            state: result.address.state || prev.state
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const _validateForm = () => {
    const _errors = {};

    // Campos obrigatórios
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    
    // Validação de email
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validação de documento
    if (formData.cpf_cnpj) {
      if (formData.user_type === 'cliente_pf') {
        if (!validateCPF(formData.cpf_cnpj)) {
          errors.cpf_cnpj = 'CPF inválido';
        }
      } else {
        if (!validateCNPJ(formData.cpf_cnpj)) {
          errors.cpf_cnpj = 'CNPJ inválido';
        }
      }
    }

    // Validação específica para PJ
    if (formData.user_type === 'cliente_pj' && !formData.company_name.trim()) {
      errors.company_name = 'Nome da empresa é obrigatório para pessoa jurídica';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (mode === 'create') {
        result = await createManualCustomer(formData);
      } else {
        result = await editAdminCustomer(customer.id, formData);
      }

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                {formData.user_type === 'cliente_pj' ? (
                  <Building className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === 'create' ? 'Criar Novo Cliente' : 'Editar Cliente'}
                </h2>
                <p className="text-slate-600">
                  {mode === 'create' 
                    ? 'Crie uma conta de cliente manualmente'
                    : 'Edite as informações do cliente'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mensagens */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Cliente */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tipo de Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
                  <input
                    type="radio"
                    name="user_type"
                    value="cliente_pf"
                    checked={formData.user_type === 'cliente_pf'}
                    onChange={handleUserTypeChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    formData.user_type === 'cliente_pf' 
                      ? 'border-amber-500 bg-amber-500' 
                      : 'border-slate-300'
                  }`}></div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-600" />
                    <span className="font-medium">Pessoa Física</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
                  <input
                    type="radio"
                    name="user_type"
                    value="cliente_pj"
                    checked={formData.user_type === 'cliente_pj'}
                    onChange={handleUserTypeChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    formData.user_type === 'cliente_pj' 
                      ? 'border-amber-500 bg-amber-500' 
                      : 'border-slate-300'
                  }`}></div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-slate-600" />
                    <span className="font-medium">Pessoa Jurídica</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                    fieldErrors.name ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Nome completo do cliente"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={mode === 'edit'} // Não permitir editar email
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      fieldErrors.email ? 'border-red-300' : 'border-slate-200'
                    } ${mode === 'edit' ? 'bg-slate-100' : ''}`}
                    placeholder="email@exemplo.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  {formData.user_type === 'cliente_pf' ? 'CPF' : 'CNPJ'}
                </label>
                <input
                  type="text"
                  name="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                    fieldErrors.cpf_cnpj ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder={formData.user_type === 'cliente_pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
                {fieldErrors.cpf_cnpj && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.cpf_cnpj}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Informações da Empresa (apenas PJ) */}
            {formData.user_type === 'cliente_pj' && (
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        fieldErrors.company_name ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="Razão social da empresa"
                    />
                    {fieldErrors.company_name && (
                      <p className="mt-1 text-red-600 text-sm">{fieldErrors.company_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Segmento
                    </label>
                    <select
                      name="company_segment"
                      value={formData.company_segment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione o segmento</option>
                      <option value="cafeteria">Cafeteria</option>
                      <option value="restaurante">Restaurante</option>
                      <option value="padaria">Padaria</option>
                      <option value="hotel">Hotel</option>
                      <option value="escritorio">Escritório</option>
                      <option value="varejo">Varejo</option>
                      <option value="industria">Indústria</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Endereço */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      onBlur={handleCEPBlur}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="00000-000"
                    />
                    {isLoadingCEP && (
                      <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-amber-600" />
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Estado
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Observações do Admin
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <textarea
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  placeholder="Ex: Cliente da loja física, sem WhatsApp, preferenciais, etc."
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {mode === 'create' ? 'Criando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreateModal; 