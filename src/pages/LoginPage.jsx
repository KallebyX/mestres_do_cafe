import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Coffee, Shield, Star, CheckCircle, ArrowRight, User } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Coffee,
      title: "Cafés Premium",
      description: "Seleção exclusiva de grãos especiais certificados SCA"
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Transações protegidas e dados seguros"
    },
    {
      icon: Star,
      title: "Qualidade Garantida",
      description: "Torrefação artesanal e frescor em cada entrega"
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/marketplace');
      } else {
        setError(result.error || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (_err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column - Visual */}
        <div className="hidden lg:flex bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.1),transparent_70%)]"></div>
          
          <div className="relative flex flex-col justify-center p-12 text-white">
            {/* Logo */}
            <div className="mb-12">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Mestres do Café</h1>
              <p className="text-slate-300 mt-2">Cafés especiais certificados SCA</p>
            </div>

            {/* Features */}
            <div className="space-y-8 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white text-sm leading-relaxed mb-4">
                "A melhor experiência em café especial. Qualidade excepcional e atendimento impecável!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Maria Silva</div>
                  <div className="text-slate-400 text-xs">Cliente há 2 anos</div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-20 w-20 h-20 bg-amber-400/10 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-400/5 rounded-full"></div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Mestres do Café</h1>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                Bem-vindo de volta!
              </h2>
              <p className="text-slate-600 text-lg">
                Acesse sua conta e explore nossos cafés especiais
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-slate-700 font-medium mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-slate-700 font-medium mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <span className="ml-2 text-slate-600 text-sm">Lembrar de mim</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-amber-600 hover:text-amber-700 transition-colors text-sm font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <Coffee className="w-5 h-5" />
                    Entrar na Conta
                  </>
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="my-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-50 text-slate-500">ou</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Ainda não tem conta?{' '}
                <Link
                  to="/registro"
                  className="text-amber-600 hover:text-amber-700 transition-colors font-semibold"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>
              
              <Link
                to="/"
                className="inline-flex items-center text-slate-500 hover:text-amber-600 transition-colors text-sm gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Voltar ao início
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500">
                <Shield className="w-4 h-4" />
                <span className="text-xs">SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">SCA Certificado</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Star className="w-4 h-4" />
                <span className="text-xs">Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

