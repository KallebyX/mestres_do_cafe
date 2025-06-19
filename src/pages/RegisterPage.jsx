import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, FileText, Building, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  validateCPF, 
  validateCNPJ, 
  validateEmail, 
  maskCPF, 
  maskCNPJ, 
  maskPhone, 
  maskCEP 
} from '../lib/validation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    user_type: 'cliente_pf',
    cpf_cnpj: '',
    address: '',
    city: 'Santa Maria',
    state: 'RS',
    zip_code: '',
    company_name: '',
    company_segment: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Aplicar máscaras
    if (name === 'cpf_cnpj') {
      if (formData.user_type === 'cliente_pf') {
        value = maskCPF(value);
      } else {
        value = maskCNPJ(value);
      }
    } else if (name === 'phone') {
      value = maskPhone(value);
    } else if (name === 'zip_code') {
      value = maskCEP(value);
    }

    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleUserTypeChange = (type) => {
    setFormData({
      ...formData,
      user_type: type,
      cpf_cnpj: '' // Limpar campo quando mudar tipo
    });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Email inválido');
      return false;
    }
    
    if (!formData.cpf_cnpj) {
      const docType = formData.user_type === 'cliente_pf' ? 'CPF' : 'CNPJ';
      setError(`${docType} é obrigatório`);
      return false;
    }
    
    if (formData.user_type === 'cliente_pf' && !validateCPF(formData.cpf_cnpj)) {
      setError('CPF inválido');
      return false;
    }
    
    if (formData.user_type === 'cliente_pj' && !validateCNPJ(formData.cpf_cnpj)) {
      setError('CNPJ inválido');
      return false;
    }
    
    if (formData.user_type === 'cliente_pj' && !formData.company_name.trim()) {
      setError('Nome da empresa é obrigatório');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateStep2()) {
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword: _, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        navigate('/marketplace', {
          state: { 
            message: 'Conta criada com sucesso! Você ganhou 100 pontos de boas-vindas!' 
          }
        });
      } else {
        setError(result.error || 'Erro ao criar conta');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-gold/10 via-coffee-white to-coffee-cream/30 font-montserrat">
      <Header />
      
      <main className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Seção Visual - Esquerda */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-coffee-gold/20 to-coffee-cream/30 rounded-3xl"></div>
                <div className="relative p-12">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                      <span className="text-coffee-white font-cormorant font-bold text-4xl">M</span>
                    </div>
                    <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
                      Junte-se aos Mestres
                    </h1>
                    <p className="text-coffee-gray text-lg mb-8">
                      Crie sua conta e descubra o mundo dos cafés especiais com nosso sistema de gamificação exclusivo
                    </p>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-coffee-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-coffee-white text-xl">🏆</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          Sistema de Gamificação
                        </h3>
                        <p className="text-coffee-gray">
                          100 pontos de boas-vindas + pontos a cada compra. Evolua pelos níveis e ganhe até 25% de desconto!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-coffee-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-coffee-white text-xl">🚚</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          Entrega Gratuita
                        </h3>
                        <p className="text-coffee-gray">
                          Frete grátis para Santa Maria em compras acima de R$ 99. Receba seus cafés fresquinhos em casa
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-coffee-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-coffee-white text-xl">☕</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          Cafés Premium SCAA
                        </h3>
                        <p className="text-coffee-gray">
                          Acesso exclusivo aos melhores cafés especiais certificados com pontuação acima de 80 pontos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-coffee-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-coffee-white text-xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-2">
                          Benefícios PJ Especiais
                        </h3>
                        <p className="text-coffee-gray">
                          Empresas ganham pontos dobrados, preços especiais e condições diferenciadas para cafeterias
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário - Direita */}
            <div className="order-1 lg:order-2">
              <div className="max-w-lg mx-auto">
                <div className="card border-2 border-coffee-cream/50 shadow-gold">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step >= 1 ? 'bg-coffee-gold text-white' : 'bg-coffee-cream text-coffee-gray'
                      }`}>
                        1
                      </div>
                      <div className={`w-16 h-1 mx-2 ${
                        step >= 2 ? 'bg-coffee-gold' : 'bg-coffee-cream'
                      }`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step >= 2 ? 'bg-coffee-gold text-white' : 'bg-coffee-cream text-coffee-gray'
                      }`}>
                        2
                      </div>
                    </div>
                    <p className="text-center text-coffee-gray text-sm">
                      Etapa {step} de 2: {step === 1 ? 'Informações Pessoais' : 'Senha e Endereço'}
                    </p>
                  </div>

                  <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-2 text-center">
                    Criar Conta
                  </h2>
                  <p className="text-coffee-gray text-center mb-8">
                    {step === 1 ? 'Vamos começar com suas informações básicas' : 'Agora vamos definir sua senha e endereço'}
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg">
                      <div className="flex">
                        <span className="text-red-400 mr-2">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 1 - Informações Pessoais */}
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Tipo de Cliente */}
                      <div>
                        <label className="block text-coffee-intense font-medium mb-3">
                          Tipo de Conta *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleUserTypeChange('cliente_pf')}
                            className={`p-4 border-2 rounded-xl transition-all text-left ${
                              formData.user_type === 'cliente_pf'
                                ? 'border-coffee-gold bg-coffee-gold/10'
                                : 'border-coffee-cream hover:border-coffee-gold/50'
                            }`}
                          >
                            <div className="font-semibold text-coffee-intense">👤 Pessoa Física</div>
                            <div className="text-sm text-coffee-gray">Para uso pessoal</div>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleUserTypeChange('cliente_pj')}
                            className={`p-4 border-2 rounded-xl transition-all text-left ${
                              formData.user_type === 'cliente_pj'
                                ? 'border-coffee-gold bg-coffee-gold/10'
                                : 'border-coffee-cream hover:border-coffee-gold/50'
                            }`}
                          >
                            <div className="font-semibold text-coffee-intense">🏢 Pessoa Jurídica</div>
                            <div className="text-sm text-coffee-gray">Empresa/Cafeteria</div>
                          </button>
                        </div>
                      </div>

                      {/* Nome */}
                      <div>
                        <label htmlFor="name" className="block text-coffee-intense font-medium mb-2">
                          {formData.user_type === 'cliente_pf' ? 'Nome Completo' : 'Nome do Responsável'} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                            placeholder={formData.user_type === 'cliente_pf' ? 'Seu nome completo' : 'Nome do responsável'}
                          />
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-coffee-intense font-medium mb-2">
                          E-mail *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                            placeholder="seu@email.com"
                          />
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                        </div>
                      </div>

                      {/* CPF/CNPJ */}
                      <div>
                        <label htmlFor="cpf_cnpj" className="block text-coffee-intense font-medium mb-2">
                          {formData.user_type === 'cliente_pf' ? 'CPF' : 'CNPJ'} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="cpf_cnpj"
                            name="cpf_cnpj"
                            value={formData.cpf_cnpj}
                            onChange={handleChange}
                            required
                            className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                            placeholder={formData.user_type === 'cliente_pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                          />
                          <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                        </div>
                      </div>

                      {/* Campos específicos para PJ */}
                      {formData.user_type === 'cliente_pj' && (
                        <>
                          <div>
                            <label htmlFor="company_name" className="block text-coffee-intense font-medium mb-2">
                              Nome da Empresa *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="company_name"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                                className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                                placeholder="Nome da sua empresa"
                              />
                              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="company_segment" className="block text-coffee-intense font-medium mb-2">
                              Segmento
                            </label>
                            <select
                              id="company_segment"
                              name="company_segment"
                              value={formData.company_segment}
                              onChange={handleChange}
                              className="w-full p-4 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                            >
                              <option value="">Selecione o segmento</option>
                              <option value="cafeteria">Cafeteria</option>
                              <option value="restaurante">Restaurante</option>
                              <option value="padaria">Padaria</option>
                              <option value="empresa">Empresa</option>
                              <option value="loja">Loja de conveniência</option>
                              <option value="outros">Outros</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Telefone */}
                      <div>
                        <label htmlFor="phone" className="block text-coffee-intense font-medium mb-2">
                          Telefone
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                            placeholder="(55) 99999-9999"
                          />
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn-primary w-full py-4 text-lg font-semibold"
                      >
                        Continuar →
                      </button>
                    </div>
                  )}

                  {/* ETAPA 2 - Senha e Endereço */}
                  {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Senhas */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="password" className="block text-coffee-intense font-medium mb-2">
                            Senha *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className="w-full p-4 pl-12 pr-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                              placeholder="Mínimo 6 caracteres"
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-coffee-gray hover:text-coffee-gold transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-coffee-intense font-medium mb-2">
                            Confirmar Senha *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              className="w-full p-4 pl-12 pr-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                              placeholder="Repita a senha"
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-coffee-gray hover:text-coffee-gold transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Endereço */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="zip_code" className="block text-coffee-intense font-medium mb-2">
                            CEP
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="zip_code"
                              name="zip_code"
                              value={formData.zip_code}
                              onChange={handleChange}
                              className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                              placeholder="00000-000"
                            />
                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-coffee-intense font-medium mb-2">
                            Endereço
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                            placeholder="Rua, número e complemento"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-coffee-intense font-medium mb-2">
                              Cidade
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full p-4 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                              placeholder="Santa Maria"
                            />
                          </div>

                          <div>
                            <label htmlFor="state" className="block text-coffee-intense font-medium mb-2">
                              Estado
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              className="w-full p-4 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                              placeholder="RS"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="btn-secondary flex-1 py-4 text-lg font-semibold"
                        >
                          ← Voltar
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-primary flex-1 py-4 text-lg font-semibold disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-white mr-2"></div>
                              Criando...
                            </div>
                          ) : (
                            '🚀 Criar Conta'
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Link para Login */}
                  <div className="mt-8 text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-coffee-cream"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-coffee-white text-coffee-gray">ou</span>
                      </div>
                    </div>

                    <p className="text-coffee-gray">
                      Já tem uma conta?{' '}
                      <Link 
                        to="/login" 
                        className="text-coffee-gold hover:text-coffee-intense font-semibold transition-colors"
                      >
                        Entre aqui
                      </Link>
                    </p>

                    <Link
                      to="/"
                      className="inline-flex items-center text-coffee-gray hover:text-coffee-gold transition-colors text-sm"
                    >
                      <span className="mr-1">←</span>
                      Voltar ao início
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;

