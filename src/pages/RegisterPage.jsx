import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  FileText, 
  Building, 
  ChevronRight, 
  ChevronLeft,
  Coffee,
  Shield,
  Star,
  CheckCircle,
  Award,
  Truck,
  Target
} from 'lucide-react';
import Logo from '../components/Logo';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('pf');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf_cnpj: '',
    company_name: '',
    company_segment: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Award,
      title: "Certificação SCA",
      description: "Cafés especiais com pontuação acima de 80 pontos"
    },
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Frete grátis para Santa Maria e região"
    },
    {
      icon: Coffee,
      title: "Torrefação Artesanal",
      description: "Processo 100% artesanal com torra personalizada"
    },
    {
      icon: Target,
      title: "Atendimento Premium",
      description: "Suporte especializado e consultoria em cafés"
    }
  ];

  // Validação e máscaras
  const validateCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    
    return digit === parseInt(cpf.charAt(10));
  };

  const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.length === 14;
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf_cnpj') {
      const numbers = value.replace(/\D/g, '');
      if (accountType === 'pf') {
        formattedValue = formatCPF(numbers.slice(0, 11));
      } else {
        formattedValue = formatCNPJ(numbers.slice(0, 14));
      }
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erro específico do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.cpf_cnpj.trim()) {
      newErrors.cpf_cnpj = accountType === 'pf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
    } else {
      const isValid = accountType === 'pf' 
        ? validateCPF(formData.cpf_cnpj) 
        : validateCNPJ(formData.cpf_cnpj);
      
      if (!isValid) {
        newErrors.cpf_cnpj = accountType === 'pf' ? 'CPF inválido' : 'CNPJ inválido';
      }
    }

    if (accountType === 'pj') {
      if (!formData.company_name.trim()) {
        newErrors.company_name = 'Razão social é obrigatória';
      }
      
      if (!formData.company_segment.trim()) {
        newErrors.company_segment = 'Segmento é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const result = await register({
        ...formData,
        accountType
      });
      
      if (result.success) {
        navigate('/marketplace');
      } else {
        setErrors({ submit: result.error || 'Erro ao criar conta' });
      }
    } catch (_err) {
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
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
              <p className="text-slate-300 mt-2 ml-19">Sua jornada no café especial começa aqui</p>
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

            {/* Trust Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white text-sm leading-relaxed mb-4">
                "Processo simples e rápido. Em poucos minutos já estava aproveitando os melhores cafés!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Carlos Silva</div>
                  <div className="text-slate-400 text-xs">Novo cliente</div>
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

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    1
                  </div>
                  <div className={`w-20 h-1 mx-2 ${
                    step >= 2 ? 'bg-amber-600' : 'bg-slate-200'
                  }`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    2
                  </div>
                </div>
              </div>
              <p className="text-center text-slate-600 text-sm">
                Etapa {step} de 2 - {step === 1 ? 'Dados Pessoais' : 'Contato e Segurança'}
              </p>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                {step === 1 ? 'Criar Conta' : 'Finalize seu Cadastro'}
              </h2>
              <p className="text-slate-600 text-lg">
                {step === 1 ? 'Escolha seu tipo de conta e preencha seus dados' : 'Adicione suas informações de contato e defina sua senha'}
              </p>
            </div>

            {/* Error Messages */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  {/* Account Type */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-3">
                      Tipo de Conta
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAccountType('pf')}
                        className={`p-4 border-2 rounded-2xl transition-all text-left ${
                          accountType === 'pf'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">👤 Pessoa Física</div>
                        <div className="text-sm text-slate-600">Para uso pessoal</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setAccountType('pj')}
                        className={`p-4 border-2 rounded-2xl transition-all text-left ${
                          accountType === 'pj'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">🏢 Pessoa Jurídica</div>
                        <div className="text-sm text-slate-600">Empresa/Cafeteria</div>
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-slate-700 font-medium mb-2">
                      {accountType === 'pf' ? 'Nome Completo' : 'Nome do Responsável'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder={accountType === 'pf' ? 'Seu nome completo' : 'Nome do responsável'}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-slate-700 font-medium mb-2">
                      E-mail
                    </label>
                    <div className="relative">
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
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* CPF/CNPJ */}
                  <div>
                    <label htmlFor="cpf_cnpj" className="block text-slate-700 font-medium mb-2">
                      {accountType === 'pf' ? 'CPF' : 'CNPJ'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cpf_cnpj"
                        name="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder={accountType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                    </div>
                    {errors.cpf_cnpj && <p className="text-red-500 text-sm mt-1">{errors.cpf_cnpj}</p>}
                  </div>

                  {/* Company Fields (PJ only) */}
                  {accountType === 'pj' && (
                    <>
                      <div>
                        <label htmlFor="company_name" className="block text-slate-700 font-medium mb-2">
                          Razão Social
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="Nome da empresa"
                          />
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        </div>
                        {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="company_segment" className="block text-slate-700 font-medium mb-2">
                          Segmento de Atuação
                        </label>
                        <select
                          id="company_segment"
                          name="company_segment"
                          value={formData.company_segment}
                          onChange={handleChange}
                          required
                          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        >
                          <option value="">Selecione o segmento</option>
                          <option value="cafeteria">Cafeteria</option>
                          <option value="restaurante">Restaurante</option>
                          <option value="padaria">Padaria</option>
                          <option value="hotel">Hotel/Pousada</option>
                          <option value="escritorio">Escritório</option>
                          <option value="revenda">Revenda</option>
                          <option value="outros">Outros</option>
                        </select>
                        {errors.company_segment && <p className="text-red-500 text-sm mt-1">{errors.company_segment}</p>}
                      </div>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-slate-700 font-medium mb-2">
                      Telefone/WhatsApp
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="(55) 99999-9999"
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-slate-700 font-medium mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-slate-700 font-medium mb-2">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Repita sua senha"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}

              {/* Form Actions */}
              <div className="flex flex-col gap-4">
                {step === 1 ? (
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Criando conta...
                        </>
                      ) : (
                        <>
                          <Coffee className="w-5 h-5" />
                          Criar Conta
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Voltar
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-8 space-y-4">
              <p className="text-slate-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-amber-600 hover:text-amber-700 transition-colors font-semibold"
                >
                  Fazer login
                </Link>
              </p>
              
              <Link
                to="/"
                className="inline-flex items-center text-slate-500 hover:text-amber-600 transition-colors text-sm gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar ao início
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Dados Seguros</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Verificado</span>
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

export default RegisterPage; 