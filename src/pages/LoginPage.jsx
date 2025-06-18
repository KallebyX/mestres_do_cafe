import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login, loading, error } = useAuth();
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

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData);
      navigate('/marketplace');
    } catch (err) {
      // Erro já é tratado no contexto
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#C8956D] rounded-full flex items-center justify-center mb-4">
            <span className="text-[#2B3A42] font-bold text-2xl">M</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-gray-400">
            Acesse sua conta para continuar suas compras
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

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-[#1A2328] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D] focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Sua senha"
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
                'Entrar'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-[#C8956D] hover:text-[#C8956D]/80 font-medium">
                Cadastre-se aqui
              </Link>
            </p>
            <p className="text-gray-400 text-sm">
              <a href="#" className="text-[#C8956D] hover:text-[#C8956D]/80">
                Esqueceu sua senha?
              </a>
            </p>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-[#1A2328] rounded-lg border border-[#C8956D]/20">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Credenciais de Teste:</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Admin:</strong> admin@mestrescafe.com.br / admin123</p>
            <p><strong>Cliente:</strong> Cadastre-se para testar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

