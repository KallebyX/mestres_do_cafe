import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, 
  User, Mail, Shield, Coffee, ArrowRight
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Logo from '../components/Logo';

const AccountActivationPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const { user, activateAdminCreatedAccount } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se o usuário precisa ativar a conta
    if (!user) {
      navigate('/login');
      return;
    }

    // Se o usuário não foi criado pelo admin ou já foi ativado, redirecionar
    if (!user.criado_por_admin || !user.pendente_ativacao) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Pelo menos 8 caracteres');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Pelo menos uma letra minúscula');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Pelo menos uma letra maiúscula');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Pelo menos um número');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Pelo menos um caractere especial');
    }

    return { score, feedback };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (error) setError('');
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Fraca';
    if (score <= 3) return 'Média';
    if (score <= 4) return 'Boa';
    return 'Forte';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.password) {
      setError('Senha é obrigatória');
      return;
    }

    if (formData.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Senha muito fraca. Use uma senha mais segura.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await activateAdminCreatedAccount(formData.password);
      
      if (result.success) {
        // Redirecionar para dashboard após ativação
        navigate('/dashboard', { 
          state: { 
            message: 'Conta ativada com sucesso! Bem-vindo aos Mestres do Café!' 
          }
        });
      } else {
        setError(result.error || 'Erro ao ativar conta');
      }
    } catch (error) {
      console.error('Erro na ativação:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Será redirecionado
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.1),transparent_70%)]"></div>
      <div className="absolute top-20 right-20 w-20 h-20 bg-amber-400/10 rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-400/5 rounded-full"></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo size="large" showText={true} variant="dark" textColor="text-white" className="justify-center" />
            <p className="text-slate-300 mt-2">Cafés especiais certificados SCA</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Bem-vindo!</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Sua conta foi criada pelo nosso time administrativo. 
                Para começar a usar o sistema, você precisa definir uma senha segura.
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <div className="flex items-center gap-1 text-slate-300 text-sm">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Activation Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Ativar Conta</h3>
              <p className="text-slate-600">Defina uma senha segura para acessar sua conta</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-slate-700 font-medium mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Força da senha:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score <= 2 ? 'text-red-600' :
                        passwordStrength.score <= 3 ? 'text-yellow-600' :
                        passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-600 mb-1">Para melhorar a senha:</p>
                        <ul className="text-xs text-slate-500 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-slate-700 font-medium mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Digite a senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    As senhas não coincidem
                  </p>
                )}
                
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-2 text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              {/* Security Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-amber-800 font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Dicas de Segurança
                </h4>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• Use pelo menos 8 caracteres</li>
                  <li>• Combine letras maiúsculas e minúsculas</li>
                  <li>• Inclua números e símbolos</li>
                  <li>• Evite informações pessoais óbvias</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || passwordStrength.score < 3 || formData.password !== formData.confirmPassword}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ativando conta...
                  </>
                ) : (
                  <>
                    <Coffee className="w-5 h-5" />
                    Ativar Conta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Help */}
            <div className="text-center mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                Precisa de ajuda? Entre em contato com nosso suporte
              </p>
              <p className="text-amber-600 font-medium text-sm mt-1">
                suporte@mestrescafe.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActivationPage; 