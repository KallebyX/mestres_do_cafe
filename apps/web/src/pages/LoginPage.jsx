import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Coffee, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loginWithGoogle, profile, getUserProfile, isAdmin } = useAuth();
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
        setTimeout(() => {
          const currentProfile = getUserProfile();
          
          // Verificar se é uma conta criada pelo admin que precisa ser ativada
          if (currentProfile?.criado_por_admin && currentProfile?.pendente_ativacao) {
            console.log('Conta criada pelo admin detectada, redirecionando para ativação');
            navigate('/ativar-conta');
            return;
          }
          
          if (currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin' || isAdmin) {
            console.log('Usuário admin detectado, redirecionando para /admin/crm');
            navigate('/admin/crm');
          } else {
            console.log('Usuário comum, redirecionando para /dashboard');
            navigate('/dashboard');
          }
        }, 500);
      } else {
        setError(result.error || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (_err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        // O redirecionamento será feito automaticamente pelo Google OAuth
        console.log('Redirecionando para o Google...');
      } else {
        setError(result.error || 'Erro ao fazer login com Google. Tente novamente.');
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
              <Logo size="large" showText={true} variant="dark" textColor="text-white" className="items-start" />
              <p className="text-slate-300 mt-2 ml-19">Cafés especiais certificados SCA</p>
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
                  <Coffee className="w-4 h-4 text-white" />
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
              <Logo size="large" showText={true} variant="light" className="justify-center" />
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
                  to="/esqueci-senha"
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

            {/* Google Login */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500">ou continue com</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path 
                      fill="#4285F4" 
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path 
                      fill="#34A853" 
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path 
                      fill="#FBBC05" 
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path 
                      fill="#EA4335" 
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </>
              )}
            </button>
            
            {/* Footer */}
            <div className="text-center space-y-4 mt-8">
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

