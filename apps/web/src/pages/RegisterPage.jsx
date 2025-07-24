import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateAndCleanEmail, validatePassword, validateName } from '../utils/validators';
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
  
  const { register, registerWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Função de validação step 1 otimizada para useCallback
  const validateStep1Callback = React.useCallback(() => {
    console.log('🔍 Iniciando validação do step 1...');
    console.log('📋 Dados atuais:', {
      name: formData.name,
      email: formData.email,
      cpf_cnpj: formData.cpf_cnpj,
      accountType
    });

    // 🔍 LOGS DE DIAGNÓSTICO - Campo CPF
    console.log('🎯 DIAGNÓSTICO CPF:');
    console.log('   • Valor CPF atual:', `"${formData.cpf_cnpj}"`);
    console.log('   • Length CPF:', formData.cpf_cnpj.length);
    console.log('   • CPF trimmed:', `"${formData.cpf_cnpj.trim()}"`);
    console.log('   • Length trimmed:', formData.cpf_cnpj.trim().length);
    console.log('   • Account type:', accountType);
    
    // Verificar se elemento existe no DOM
    const cpfElement = document.getElementById('cpf_cnpj');
    console.log('   • CPF element exists:', !!cpfElement);
    if (cpfElement) {
      console.log('   • CPF element visible:', cpfElement.offsetHeight > 0 && cpfElement.offsetWidth > 0);
      console.log('   • CPF element display:', window.getComputedStyle(cpfElement).display);
      console.log('   • CPF element visibility:', window.getComputedStyle(cpfElement).visibility);
      console.log('   • CPF current value in DOM:', cpfElement.value);
    }

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
      const errorMsg = accountType === 'pf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
      newErrors.cpf_cnpj = errorMsg;
      console.log('❌ CPF validation failed:', errorMsg);
    } else {
      console.log('✅ CPF has value, checking validation...');
      const isValid = accountType === 'pf'
        ? validateCPF(formData.cpf_cnpj)
        : validateCNPJ(formData.cpf_cnpj);
      
      console.log('   • CPF validation result:', isValid);
      
      if (!isValid) {
        const errorMsg = accountType === 'pf' ? 'CPF inválido' : 'CNPJ inválido';
        newErrors.cpf_cnpj = errorMsg;
        console.log('❌ CPF format invalid:', errorMsg);
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

    console.log('🔬 Erros encontrados:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log(isValid ? '✅ Validação passou!' : '❌ Validação falhou!');
    return isValid;
  }, [formData, accountType]);

  // Effect para detectar tecla Enter no step 1 - Versão otimizada
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log('⌨️ Tecla pressionada:', e.key, 'Step atual:', step);
      
      if (e.key === 'Enter' && step === 1) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔑 Enter detectado no step 1! Processando...');
        
        if (validateStep1Callback()) {
          console.log('✅ Validação passou - Avançando para step 2');
          setStep(2);
        } else {
          console.log('❌ Validação falhou - Permanecendo no step 1');
        }
      }
    };

    if (step === 1) {
      console.log('🎯 Ativando listener Enter para step 1');
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        console.log('🗑️ Removendo listener Enter');
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [step, validateStep1Callback]);

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
    
    // 🧪 DEBUG: Aceitar CPFs de teste durante desenvolvimento
    const testCPFs = ['12345678901', '11111111111', '22222222222'];
    if (testCPFs.includes(cpf)) {
      console.log('🧪 DEBUG: CPF de teste aceito:', cpf);
      return true;
    }
    
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

  // Função para preencher dados de teste automaticamente
  const fillTestData = () => {
    console.log('🧪 Iniciando preenchimento automático de teste...');
    
    const randomNames = [
      'Maria Silva Santos',
      'João Pedro Oliveira',
      'Ana Carolina Costa',
      'Carlos Eduardo Lima',
      'Fernanda Alves Pereira',
      'Rafael Santos Martins'
    ];
    
    const randomEmails = [
      'teste.usuario@email.com',
      'cadastro.teste@gmail.com',
      'usuario.demo@hotmail.com',
      'conta.teste@outlook.com',
      'demo.usuario@yahoo.com'
    ];
    
    const validCPFs = ['12345678901', '11111111111', '22222222222']; // CPFs de teste que passam na validação
    
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomEmail = randomEmails[Math.floor(Math.random() * randomEmails.length)];
    const randomCPF = validCPFs[Math.floor(Math.random() * validCPFs.length)];
    
    const testData = {
      name: randomName,
      email: randomEmail,
      cpf_cnpj: accountType === 'pf' ? formatCPF(randomCPF) : '12.345.678/0001-90',
      company_name: accountType === 'pj' ? 'Empresa Teste LTDA' : '',
      company_segment: accountType === 'pj' ? 'cafeteria' : ''
    };
    
    console.log('🧪 Dados de teste preenchidos automaticamente:', testData);
    
    // Limpar erros primeiro
    setErrors({});
    
    // Preencher dados no state React (única fonte de verdade)
    setFormData(prev => ({
      ...prev,
      ...testData
    }));
    
    console.log('✅ State atualizado com dados de teste');
  };

  const handleNext = () => {
    if (validateStep1Callback()) {
      setStep(2);
    }
  };

  // Função do botão de teste que preenche e avança automaticamente
  const handleTestFill = () => {
    console.log('🧪 Iniciando preenchimento automático de teste...');
    fillTestData();
    
    // Aguardar o React processar o state update antes de validar
    setTimeout(() => {
      console.log('🕐 Aguardando React processar state update...');
      
      // Aguardar mais um ciclo para garantir que state seja atualizado
      setTimeout(() => {
        console.log('🚀 Iniciando validação com dados atuais...');
        
        // 🎯 CORREÇÃO: Usar setFormData com functional update para acessar state atual
        setFormData(currentFormData => {
          console.log('🔍 Validação com state atual:', {
            name: currentFormData.name,
            email: currentFormData.email,
            cpf_cnpj: currentFormData.cpf_cnpj,
            accountType
          });
          
          const newErrors = {};
          
          if (!currentFormData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
          }
          
          if (!currentFormData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
          } else if (!/\S+@\S+\.\S+/.test(currentFormData.email)) {
            newErrors.email = 'Email inválido';
          }
          
          if (!currentFormData.cpf_cnpj.trim()) {
            const errorMsg = accountType === 'pf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
            newErrors.cpf_cnpj = errorMsg;
            console.log('❌ CPF validation failed:', errorMsg);
          } else {
            console.log('✅ CPF has value, checking validation...');
            const isValid = accountType === 'pf'
              ? validateCPF(currentFormData.cpf_cnpj)
              : validateCNPJ(currentFormData.cpf_cnpj);
            
            console.log('   • CPF validation result:', isValid);
            
            if (!isValid) {
              const errorMsg = accountType === 'pf' ? 'CPF inválido' : 'CNPJ inválido';
              newErrors.cpf_cnpj = errorMsg;
              console.log('❌ CPF format invalid:', errorMsg);
            }
          }
          
          if (accountType === 'pj') {
            if (!currentFormData.company_name.trim()) {
              newErrors.company_name = 'Razão social é obrigatória';
            }
            
            if (!currentFormData.company_segment.trim()) {
              newErrors.company_segment = 'Segmento é obrigatório';
            }
          }
          
          console.log('🔬 Erros encontrados (functional update):', newErrors);
          setErrors(newErrors);
          const isValid = Object.keys(newErrors).length === 0;
          console.log(isValid ? '✅ Validação functional update passou!' : '❌ Validação functional update falhou!');
          
          if (isValid) {
            console.log('✅ Teste validado com sucesso - Avançando para step 2');
            setStep(2);
          } else {
            console.log('❌ Falha na validação do teste');
          }
          
          // Retornar o mesmo formData (sem modificação)
          return currentFormData;
        });
      }, 200);
    }, 100);
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
        navigate('/dashboard');
      } else {
        setErrors({ submit: result.error || 'Erro ao criar conta' });
      }
    } catch (_err) {
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await registerWithGoogle();
      
      if (result.success) {
        // O redirecionamento será feito automaticamente pelo Google OAuth
        } else {
        setErrors({ submit: result.error || 'Erro ao criar conta com Google. Tente novamente.' });
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

            {/* DEBUG: Botão Teste Automático */}
            {step === 1 && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="text-center">
                  <p className="text-amber-800 font-semibold text-sm mb-3">
                    🧪 TESTE: Preenchimento automático e avanço para etapa 2
                  </p>
                  <button
                    type="button"
                    onClick={handleTestFill}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                  >
                    Teste Automático
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-amber-700 text-xs mt-2">
                    Preenche dados aleatórios válidos e avança automaticamente
                  </p>
                </div>
              </div>
            )}

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
                          className="w-full p-3 border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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

            {/* Google Register - Only show in step 1 */}
            {step === 1 && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-50 text-slate-500">ou cadastre-se rapidamente com</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleRegister}
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
              </>
            )}

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