import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from "@/lib/api"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar se há mensagem de erro vinda da navegação
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação do email
    if (!email.trim()) {
      setError('Por favor, insira seu email.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    try {
      setLoading(true);
      // Usar diretamente a API do Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`
      });

      if (error) {
        console.error('❌ Erro ao enviar email:', error);
        setError('Erro ao enviar email. Verifique se o email está correto e tente novamente.');
        return;
      }

      setSuccess('Email de redefinição enviado com sucesso! Verifique sua caixa de entrada.');
      setIsSubmitted(true);
      
    } catch (err) {
      console.error('❌ Erro na operação:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isSubmitted ? 'Email Enviado!' : 'Esqueceu sua senha?'}
          </h2>
          <p className="text-gray-600">
            {isSubmitted 
              ? 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.'
              : 'Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.'
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {!isSubmitted ? (
            <>
              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm transition-all duration-200"
                      placeholder="Digite seu email"
                    />
                  </div>
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-green-700 text-sm">{success}</span>
                  </div>
                )}

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Link de Redefinição'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Confirmação de envio */}
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Email enviado para
                  </h3>
                  <p className="text-amber-600 font-medium">{email}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Próximos passos:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Verifique sua caixa de entrada</li>
                    <li>• Procure também na pasta de spam</li>
                    <li>• Clique no link recebido</li>
                    <li>• Defina sua nova senha</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Link para voltar */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-amber-600 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o login
            </Link>
          </div>
        </div>

        {/* Links adicionais */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Não tem uma conta? </span>
          <Link
            to="/registro"
            className="font-medium text-amber-600 hover:text-amber-500 transition-colors duration-200"
          >
            Cadastre-se agora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 