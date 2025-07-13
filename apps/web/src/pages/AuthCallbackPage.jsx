import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/api"
import { Coffee, Shield, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Obter sessão do callback
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        setError('Erro ao processar autenticação: ' + sessionError.message);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Buscar ou criar perfil do usuário
      const userProfile = await getOrCreateUserProfile(session.user);
      
      if (!userProfile) {
        setError('Erro ao criar perfil do usuário');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Redirecionar baseado no role do usuário
      redirectUser(userProfile);

    } catch (error) {
      console.error('❌ Erro no callback de autenticação:', error);
      setError('Erro inesperado durante a autenticação');
      setTimeout(() => navigate('/login'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateUserProfile = async (authUser) => {
    try {
      // Primeiro, tentar buscar o perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile && !fetchError) {
        return existingProfile;
      }

      // Extrair informações do Google se disponíveis
      const isGoogleUser = authUser.app_metadata?.provider === 'google';
      const googleData = authUser.user_metadata || {};
      
      // Verificar se é admin por email
      const adminEmails = [
        'daniel@mestres-do-cafe.com',
        'admin@mestres-do-cafe.com',
        'danielmelo.dev@gmail.com'
      ];
      
      const isAdmin = adminEmails.includes(authUser.email?.toLowerCase());
      
      const profileData = {
        id: authUser.id,
        email: authUser.email,
        name: googleData.name || googleData.full_name || authUser.email?.split('@')[0] || 'Usuário',
        avatar_url: googleData.avatar_url || googleData.picture || null,
        user_type: 'cliente_pf',
        points: 0,
        level: 'Aprendiz do Café',
        role: isAdmin ? 'admin' : 'customer',
        permissions: isAdmin ? ['read', 'write', 'admin'] : ['read'],
        provider: isGoogleUser ? 'google' : 'email',
        google_id: isGoogleUser ? googleData.sub : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError);
        return null;
      }

      return newProfile;

    } catch (error) {
      console.error('❌ Erro ao obter/criar perfil:', error);
      return null;
    }
  };

  const redirectUser = (userProfile) => {
    // Verificar se é admin
    if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // Usuário comum
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Finalizando Login</h2>
          <p className="text-slate-600">Configurando sua conta...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Erro na Autenticação</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <p className="text-sm text-slate-500">Redirecionando automaticamente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Realizado!</h2>
        <p className="text-slate-600">Redirecionando para seu dashboard...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 