import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'cliente_pf',
    phone: '',
    cpf_cnpj: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/marketplace');
    } catch (err) {
      // Erro já é tratado no contexto
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#C8956D] rounded-full flex items-center justify-center mb-4">
            <span className="text-[#2B3A42] font-bold text-2xl">M</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Criar sua conta
          </h2>
          <p className="mt-2 text-gray-400">
            Cadastre-se para começar a comprar nossos cafés especiais
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center">
              <AlertCircle className="text-red-400 mr-3" size={20} />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tipo de Cliente
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  name="user_type"
                  value="cliente_pf"
                  checked={formData.user_type === 'cliente_pf'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.user_type === 'cliente_pf' 
                    ? 'border-[#C8956D] bg-[#C8956D]/10' 
                    : 'border-gray-600 bg-[#1A2328]'
                }`}>
                  <div className="flex items-center">
                    <User className="mr-3 text-[#C8956D]" size={20} />
                    <div>
                      <p className="font-medium text-white">Pessoa Física</p>
                      <p className="text-sm text-gray-400">1 ponto por R$ gasto</p>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  name="user_type"
                  value="cliente_pj"
                  checked={formData.user_type === 'cliente_pj'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.user_type === 'cliente_pj' 
                    ? 'border-[#C8956D] bg-[#C8956D]/10' 
                    : 'border-gray-600 bg-[#1A2328]'
                }`}>
                  <div className="flex items-center">
                    <Building className="mr-3 text-[#C8956D]" size={20} />
                    <div>
                      <p className="font-medium text-white">Pessoa Jurídica</p>
                      <p className="text-sm text-gray-400">2 pontos por R$ gasto</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefone *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="(55) 99999-9999"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* CPF/CNPJ */}
            <div>
              <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-300 mb-2">
                {formData.user_type === 'cliente_pf' ? 'CPF' : 'CNPJ'}
              </label>
              <input
                id="cpf_cnpj"
                name="cpf_cnpj"
                type="text"
                value={formData.cpf_cnpj}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent"
                placeholder={formData.user_type === 'cliente_pf' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Endereço (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent"
                    placeholder="Rua, número, complemento"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-300 mb-2">
                  CEP
                </label>
                <input
                  id="zip_code"
                  name="zip_code"
                  type="text"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  Cidade
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent"
                  placeholder="Sua cidade"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-[#1A2328] text-white focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="PR">Paraná</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  {/* Adicionar outros estados conforme necessário */}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-[#2B3A42] bg-[#C8956D] hover:bg-[#C8956D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8956D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                'Criar Conta'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-[#C8956D] hover:text-[#C8956D]/80 font-medium">
                Entre aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

