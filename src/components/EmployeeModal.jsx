import React, { useState, useEffect } from 'react';
// import { _X, _Save, _AlertCircle, _User, _Calendar, _DollarSign, _Phone, _Mail, _MapPin, _Building, _UserCheck, _Shield } from 'lucide-react'; // Temporarily commented - unused import
import { _hrAPI } from '../lib/supabase-erp-api';
import { _useNotifications } from '../contexts/NotificationContext';

const _EmployeeModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' | 'edit' | 'view'
  employee = null,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    position: '',
    department: '',
    hire_date: '',
    salary: '',
    status: 'ativo',
    manager_id: '',
    bank_account: '',
    emergency_contact: '',
    emergency_phone: ''
  });

  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { notifySuccess, notifyError } = useNotifications();

  const _statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'demitido', label: 'Demitido' },
    { value: 'licenca', label: 'Licença' }
  ];

  const _departmentOptions = [
    'Administrativo',
    'Vendas',
    'Produção',
    'Logística',
    'Marketing',
    'Financeiro',
    'Recursos Humanos',
    'TI'
  ];

  const _stateOptions = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      
      if (mode === 'edit' && employee) {
        setFormData({
          employee_code: employee.employee_code || '',
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          cpf: employee.cpf || '',
          rg: employee.rg || '',
          birth_date: employee.birth_date || '',
          address: employee.address || '',
          city: employee.city || '',
          state: employee.state || '',
          zip_code: employee.zip_code || '',
          position: employee.position || '',
          department: employee.department || '',
          hire_date: employee.hire_date || '',
          salary: employee.salary ? employee.salary.toString() : '',
          status: employee.status || 'ativo',
          manager_id: employee.manager_id || '',
          bank_account: employee.bank_account || '',
          emergency_contact: employee.emergency_contact || '',
          emergency_phone: employee.emergency_phone || ''
        });
      } else if (mode === 'create') {
        setFormData({
          employee_code: generateEmployeeCode(),
          name: '',
          email: '',
          phone: '',
          cpf: '',
          rg: '',
          birth_date: '',
          address: '',
          city: '',
          state: 'RS',
          zip_code: '',
          position: '',
          department: '',
          hire_date: new Date().toISOString().split('T')[0],
          salary: '',
          status: 'ativo',
          manager_id: '',
          bank_account: '',
          emergency_contact: '',
          emergency_phone: ''
        });
      }
      
      setError('');
      setFieldErrors({});
    }
  }, [isOpen, mode, employee]);

  const _loadEmployees = async () => {
    try {
      const _result = await hrAPI.getEmployees();
      if (result.success) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const _generateEmployeeCode = () => {
    const _timestamp = Date.now().toString().slice(-4);
    return `EMP${timestamp}`;
  };

  const _handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const _formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const _formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2');
  };

  const _formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const _handleCPFChange = (e) => {
    const _formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const _handlePhoneChange = (e) => {
    const _formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const _handleEmergencyPhoneChange = (e) => {
    const _formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, emergency_phone: formatted }));
  };

  const _handleCEPChange = (e) => {
    const _formatted = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, zip_code: formatted }));
  };

  const _validateForm = () => {
    const _errors = {};

    // Campos obrigatórios
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    if (!formData.position.trim()) errors.position = 'Cargo é obrigatório';
    if (!formData.department.trim()) errors.department = 'Departamento é obrigatório';
    if (!formData.hire_date) errors.hire_date = 'Data de admissão é obrigatória';

    // Validação de email
    const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validação de CPF (básica)
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      errors.cpf = 'CPF deve ter 11 dígitos';
    }

    // Validação de salário
    if (formData.salary && isNaN(parseFloat(formData.salary))) {
      errors.salary = 'Salário deve ser um número válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const _employeeData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        emergency_phone: formData.emergency_phone.replace(/\D/g, ''),
        zip_code: formData.zip_code.replace(/\D/g, '')
      };

      let result;
      if (mode === 'create') {
        result = await hrAPI.createEmployee(employeeData);
      } else {
        result = await hrAPI.updateEmployee(employee.id, employeeData);
      }

      if (result.success) {
        notifySuccess(
          mode === 'create' ? '✅ Funcionário Criado' : '✅ Funcionário Atualizado',
          `${formData.name} foi ${mode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso`,
          '/admin/rh'
        );
        onSuccess && onSuccess(result.data);
        onClose();
      } else {
        setError(result.error);
        notifyError('❌ Erro', result.error);
      }
    } catch (error) {
      setError('Erro interno do servidor');
      notifyError('❌ Erro', 'Erro interno do servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const _isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold">
              {mode === 'create' ? 'Novo Funcionário' : mode === 'edit' ? 'Editar Funcionário' : 'Visualizar Funcionário'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Informações Pessoais */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Código do Funcionário
                </label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="EMP001"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    fieldErrors.name ? 'border-red-300' : 'border-gray-200'
                  } ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="João da Silva"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      fieldErrors.email ? 'border-red-300' : 'border-gray-200'
                    } ${isReadOnly ? 'bg-gray-100' : ''}`}
                    placeholder="joao@email.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={isReadOnly}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {fieldErrors.cpf && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.cpf}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  RG
                </label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Santa Maria"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Estado
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  {stateOptions.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleCEPChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="97000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Informações Profissionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    fieldErrors.position ? 'border-red-300' : 'border-gray-200'
                  } ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Analista de Vendas"
                />
                {fieldErrors.position && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.position}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Departamento *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    fieldErrors.department ? 'border-red-300' : 'border-gray-200'
                  } ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Selecione um departamento</option>
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {fieldErrors.department && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Data de Admissão *
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    fieldErrors.hire_date ? 'border-red-300' : 'border-gray-200'
                  } ${isReadOnly ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.hire_date && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.hire_date}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Salário (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.salary && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.salary}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Gestor Direto
                </label>
                <select
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Selecione um gestor</option>
                  {employees
                    .filter(emp => emp.id !== employee?.id) // Não pode ser gestor de si mesmo
                    .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Conta Bancária
                </label>
                <input
                  type="text"
                  name="bank_account"
                  value={formData.bank_account}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Banco: 001 Ag: 1234 CC: 12345-6"
                />
              </div>
            </div>
          </div>

          {/* Contato de Emergência */}
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Contato de Emergência
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nome do Contato
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Maria da Silva"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Telefone de Emergência
                </label>
                <input
                  type="text"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleEmergencyPhoneChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'create' ? 'Criando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {mode === 'create' ? 'Criar Funcionário' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Botão Visualizar */}
          {isReadOnly && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Fechar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal; 