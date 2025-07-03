import React, { useEffect, useState } from 'react';
import { _useNavigate } from 'react-router-dom';
import { _supabase } from '../lib/supabase';
// import { _Coffee, _Shield, _CheckCircle } from 'lucide-react'; // Temporarily commented - unused import
import Logo from '../components/Logo';

const _AuthCallbackPage = () => {
  const _navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleAuthCallback();
  }, [] // TODO: Add missing dependencies to fix exhaustive-deps warning);

  const _handleAuthCallback = async () => {
    try {
      console.log('🔄 Processando callback de autenticação...');
      
      // Obter sessão do callback
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        setError('Erro ao processar autenticação: ' + sessionError.message);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!session?.user) {
        console.log('❌ Nenhuma sessão encontrada, redirecionando para login...');
        navigate('/login');
        return;
      }

      console.log('✅ Sessão obtida:', session.user.email);

      // Buscar ou criar perfil do usuário
      const _userProfile = await getOrCreateUserProfile(session.user);
      
      if (!userProfile) {
        setError('Erro ao criar perfil do usuário');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      console.log('👤 Perfil do usuário:', userProfile);

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

  const _getOrCreateUserProfile = async (authUser) => {
    try {
      console.log('🔍 Buscando perfil do usuário:', authUser.id);
      
      // Primeiro, tentar buscar o perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile && !fetchError) {
        console.log('✅ Perfil existente encontrado:', existingProfile);
        return existingProfile;
      }

      console.log('📝 Criando novo perfil para:', authUser.email);

      // Extrair informações do Google se disponíveis
      const _isGoogleUser = authUser.app_metadata?.provider === 'google';
      const _googleData = authUser.user_metadata || {};
      
      // Verificar se é admin por email
      const _adminEmails = [
        'daniel@mestres-do-cafe.com',
        'admin@mestres-do-cafe.com',
        'danielmelo.dev@gmail.com'
      ];
      
      const _isAdmin = adminEmails.includes(authUser.email?.toLowerCase());
      
      const _profileData = {
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

      console.log('📄 Dados do perfil a ser criado:', profileData);

      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError);
        return null;
      }

      console.log('✅ Novo perfil criado com sucesso:', newProfile);
      return newProfile;

    } catch (error) {
      console.error('❌ Erro ao obter/criar perfil:', error);
      return null;
    }
  };

  const _redirectUser = (userProfile) => {
    console.log('🎯 Redirecionando usuário baseado no role:', userProfile.role);
    
    // Verificar se é admin
    if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
      console.log('👑 Usuário admin detectado, redirecionando para dashboard administrativo...');
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // Usuário comum
    console.log('👤 Usuário comum, redirecionando para dashboard...');
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