import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erro quando usuário começar a digitar
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
    } catch (_err) { // eslint-disable-line no-unused-vars
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-cream/20 via-coffee-white to-coffee-gold/10 font-montserrat">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Seção Visual - Esquerda */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Background com padrão de café */}
                <div className="absolute inset-0 bg-gradient-coffee rounded-3xl opacity-10"></div>
                <div className="relative p-12 text-center">
                  <div className="w-32 h-32 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-8 shadow-gold">
                    <span className="text-coffee-white font-cormorant font-bold text-5xl">M</span>
                  </div>
                  
                  <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
                    Bem-vindo aos Mestres do Café
                  </h1>
                  
                  <p className="text-coffee-gray text-lg mb-8">
                    Descubra os melhores cafés especiais certificados SCAA, 
                    torrados artesanalmente para o seu prazer.
                  </p>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-coffee-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-coffee-gold text-xl">☕</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-coffee-intense">Cafés Premium</h3>
                        <p className="text-coffee-gray text-sm">Seleção exclusiva de grãos especiais</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-coffee-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-coffee-gold text-xl">🚚</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-coffee-intense">Entrega Rápida</h3>
                        <p className="text-coffee-gray text-sm">Frete grátis para Santa Maria</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-coffee-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-coffee-gold text-xl">⭐</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-coffee-intense">Qualidade Garantida</h3>
                        <p className="text-coffee-gray text-sm">Certificação SCAA e torrefação artesanal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário - Direita */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="card border-2 border-coffee-cream/50 shadow-gold">
                <div className="text-center mb-8 lg:hidden">
                  <div className="w-20 h-20 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-4 shadow-gold">
                    <span className="text-coffee-white font-cormorant font-bold text-3xl">M</span>
                  </div>
                </div>

                <h2 className="font-cormorant font-bold text-3xl text-coffee-intense mb-2 text-center">
                  Entrar na Conta
                </h2>
                <p className="text-coffee-gray text-center mb-8">
                  Acesse sua conta e explore nossos cafés especiais
                </p>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg">
                    <div className="flex">
                      <span className="text-red-400 mr-2">⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-coffee-intense font-medium mb-2">
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
                        className="w-full p-4 pl-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                        placeholder="seu@email.com"
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold">
                        📧
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-coffee-intense font-medium mb-2">
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
                        className="w-full p-4 pl-12 pr-12 border-2 border-coffee-cream rounded-xl focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all bg-coffee-white/50"
                        placeholder="Sua senha"
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-gold">
                        🔒
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-coffee-gray hover:text-coffee-gold transition-colors"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-coffee-cream text-coffee-gold focus:ring-coffee-gold"
                      />
                      <span className="ml-2 text-coffee-gray text-sm">Lembrar de mim</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-coffee-gold hover:text-coffee-intense transition-colors text-sm font-medium"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-white mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Entrar
                      </div>
                    )}
                  </button>
                </form>
                
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
                    Ainda não tem conta?{' '}
                    <Link
                      to="/register"
                      className="text-coffee-gold hover:text-coffee-intense transition-colors font-semibold"
                    >
                      Cadastre-se aqui
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
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;

