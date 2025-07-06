import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/lib/api"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sessionConfigured, setSessionConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extrair tokens da URL - VERSÃO SIMPLIFICADA E ROBUSTA
  useEffect(() => {
    const configureSession = async () => {
      console.log('🚀 INICIANDO CONFIGURAÇÃO DE SESSÃO');
      
      // URL completa para debug
      const fullURL = window.location.href;
      console.log('📍 URL COMPLETA:', fullURL);
      
      // MÉTODO SIMPLES: Extrair diretamente dos search params
      const currentURL = new URL(window.location.href);
      const params = currentURL.searchParams;
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token') || '';
      const type = params.get('type') || 'recovery';
      
      console.log('🔍 EXTRAÇÃO DIRETA DOS PARÂMETROS:', {
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : '❌ NÃO ENCONTRADO',
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : '❌ VAZIO',
        type: type || 'NÃO ESPECIFICADO',
        allParams: Object.fromEntries(params.entries())
      });

      // Verificar se temos o token necessário
      if (!accessToken || accessToken.trim() === '') {
        console.error('❌ ACCESS TOKEN NÃO ENCONTRADO');
        console.log('📋 Parâmetros disponíveis:', Object.fromEntries(params.entries()));
        
        setErrors({ submit: 'Link inválido ou expirado. Solicite um novo link de redefinição.' });
        setTimeout(() => {
          navigate('/esqueci-senha', { 
            state: { error: 'Link inválido ou expirado. Solicite um novo link de redefinição.' }
          });
        }, 3000);
        return;
      }

      try {
        console.log('🔧 CONFIGURANDO SESSÃO COM TOKEN ENCONTRADO...');
        
        // Usar o access_token como refresh_token se não tiver um refresh_token válido
        const sessionData = {
          access_token: accessToken,
          refresh_token: refreshToken || accessToken
        };
        
        console.log('📋 Dados da sessão:', {
          access_token: `${accessToken.substring(0, 20)}...`,
          refresh_token: sessionData.refresh_token ? `${sessionData.refresh_token.substring(0, 20)}...` : 'USANDO ACCESS TOKEN'
        });

        const { data, error } = await supabase.auth.setSession(sessionData);

        if (error) {
          console.error('❌ ERRO NA CONFIGURAÇÃO DA SESSÃO:', error);
          setErrors({ submit: 'Token inválido ou expirado. Solicite um novo link de redefinição.' });
          setTimeout(() => {
            navigate('/esqueci-senha', { 
              state: { error: 'Token inválido ou expirado. Solicite um novo link de redefinição.' }
            });
          }, 3000);
          return;
        }

        console.log('✅ SESSÃO CONFIGURADA COM SUCESSO!');
        console.log('👤 Usuário:', data.session?.user?.email || 'NÃO IDENTIFICADO');
        
        setSessionConfigured(true);
        
      } catch (err) {
        console.error('💥 ERRO FATAL:', err);
        setErrors({ submit: 'Erro de conexão. Tente novamente.' });
        setTimeout(() => {
          navigate('/esqueci-senha', { 
            state: { error: 'Erro de conexão. Tente novamente.' }
          });
        }, 3000);
      }
    };

    configureSession();
  }, [navigate]);

  // Calcular força da senha
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erros ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Calcular força da senha
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    // Validar confirmação
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');

    if (!validateForm()) return;
    
    if (!sessionConfigured) {
      setErrors({ submit: 'Sessão não configurada. Recarregue a página.' });
      return;
    }

    try {
      setLoading(true);
      console.log('🔒 Redefinindo senha...');
      
      // Usar diretamente a API do Supabase para atualizar a senha
      const { data, error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) {
        console.error('❌ Erro ao redefinir senha:', error);
        setErrors({ submit: error.message || 'Erro ao redefinir senha. Tente novamente.' });
        return;
      }

      console.log('✅ Senha redefinida com sucesso:', data);
      setSuccess('Senha redefinida com sucesso!');
      
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' }
        });
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erro na redefinição:', err);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4:
      case 5: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Muito fraca';
      case 2: return 'Fraca';
      case 3: return 'Média';
      case 4: return 'Forte';
      case 5: return 'Muito forte';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Redefinir Senha
          </h2>
          <p className="text-gray-600">
            Digite sua nova senha para acessar sua conta
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {!sessionConfigured ? (
            /* Loading - Configurando sessão */
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verificando link de redefinição...
                </h3>
                <p className="text-gray-600">
                  Configurando sua sessão para redefinir a senha.
                </p>
              </div>
            </div>
          ) : !success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nova Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full pl-12 pr-12 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200`}
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Indicador de força da senha */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 w-full rounded-full ${
                            level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Força: <span className="font-medium">{getPasswordStrengthText()}</span>
                    </p>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full pl-12 pr-12 py-3 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200`}
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Dicas de segurança */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Dicas para uma senha segura:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pelo menos 8 caracteres</li>
                  <li>• Letras maiúsculas e minúsculas</li>
                  <li>• Números e símbolos</li>
                  <li>• Evite informações pessoais</li>
                </ul>
              </div>

              {/* Mensagem de erro */}
              {errors.submit && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{errors.submit}</span>
                </div>
              )}

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading || passwordStrength < 3 || !sessionConfigured}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Redefinindo...
                  </div>
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </form>
          ) : (
            <>
              {/* Confirmação de sucesso */}
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Senha redefinida com sucesso!
                  </h3>
                  <p className="text-gray-600">
                    Você será redirecionado para a página de login em instantes.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 