import { ArrowLeft, CheckCircle, Coffee, Eye, EyeOff, Lock, Mail, Shield, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { validateAndCleanEmail, validatePassword } from '../utils/validators';

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
      title: "Cafes Premium",
      description: "Selecao exclusiva de graos especiais certificados SCA"
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Transacoes protegidas e dados seguros"
    },
    {
      icon: Star,
      title: "Qualidade Garantida",
      description: "Torrefacao artesanal e frescor em cada entrega"
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
      const emailValidation = validateAndCleanEmail(formData.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        setIsLoading(false);
        return;
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error);
        setIsLoading(false);
        return;
      }

      const result = await login(emailValidation.email, formData.password);

      if (result.success) {
        const userData = result.user;
        if (userData?.is_admin || userData?.user_type === 'admin') {
          navigate('/admin/crm');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (_err) {
      setError('Erro de conexao. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column - Visual */}
        <div className="hidden lg:flex bg-gradient-to-br from-brand-dark via-gray-900 to-coffee-950 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-brown/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="absolute inset-0 bg-coffee-pattern opacity-5" />
          </div>

          <div className="relative flex flex-col justify-center p-12 xl:p-16 text-white w-full">
            {/* Logo */}
            <div className="mb-12">
              <Logo size="large" showText={true} variant="dark" />
              <p className="text-white/60 mt-3 text-lg">Cafes especiais certificados SCA</p>
            </div>

            {/* Features */}
            <div className="space-y-6 mb-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-brand-brown/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-brand-brown" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 text-warning-500 fill-warning-500" />
                ))}
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-4 italic">
                "A melhor experiencia em cafe especial. Qualidade excepcional e atendimento impecavel!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-brown rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MS</span>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Maria Silva</div>
                  <div className="text-white/50 text-xs">Cliente ha 2 anos</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-20 h-20 border border-brand-brown/20 rounded-full" />
            <div className="absolute bottom-40 left-20 w-32 h-32 border border-brand-brown/10 rounded-full" />
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-10">
              <Logo size="large" showText={true} variant="light" />
            </div>

            {/* Back Link - Mobile */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-brown transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Voltar ao inicio</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-brand-brown" />
                <span className="text-sm font-medium text-brand-brown">Bem-vindo de volta!</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                Acesse sua conta
              </h1>
              <p className="text-muted-foreground">
                Entre para explorar nossos cafes especiais
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-xl animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-error-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="text-sm text-error-700 dark:text-error-200">{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-base pl-12"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-base pl-12 pr-12"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-brand-brown focus:ring-brand-brown focus:ring-offset-0"
                  />
                  <span className="text-sm text-muted-foreground">Lembrar de mim</span>
                </label>
                <Link
                  to="/esqueci-senha"
                  className="text-sm font-medium text-brand-brown hover:text-brand-brown/80 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-base"
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-5 h-5" />
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
            <div className="relative my-8">
              <div className="divider" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background text-muted-foreground text-sm">
                ou
              </span>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Ainda nao tem conta?{' '}
                <Link
                  to="/registro"
                  className="font-semibold text-brand-brown hover:text-brand-brown/80 transition-colors"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 text-success-500" />
                <span className="text-xs">SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span className="text-xs">SCA Certificado</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-warning-500" />
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
