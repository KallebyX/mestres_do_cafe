import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardTemp = () => {
  const { user, profile, loading: authLoading, hasPermission } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🧪 AdminDashboardTemp - Estado:', {
      user: !!user,
      profile: !!profile,
      authLoading,
      isAdmin: profile ? hasPermission('admin') : false
    });

    // Se ainda está carregando autenticação, aguardar
    if (authLoading) {
      console.log('⏳ Aguardando autenticação...');
      return;
    }

    // Se não tem usuário, redirecionar para login
    if (!user) {
      console.log('❌ Sem usuário, redirecionando para login');
      navigate('/login');
      return;
    }

    // Se não tem perfil ou não é admin, redirecionar
    if (!profile || !hasPermission('admin')) {
      console.log('❌ Sem permissão admin, redirecionando');
      navigate('/dashboard');
      return;
    }

    // Se chegou aqui, é admin válido
    console.log('✅ Admin válido, carregando dados...');
    loadData();
  }, [user, profile, authLoading, hasPermission, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Simulando carregamento de dados...');
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Dados carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificando Autenticação</h1>
          <p className="text-slate-600">Aguarde...</p>
        </div>
      </div>
    );
  }

  // Loading de dados
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando Dashboard</h1>
          <p className="text-slate-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Crown className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Dashboard Admin - TESTE</h1>
          <p className="text-xl text-slate-600 mb-8">
            Bem-vindo, {profile?.name || 'Admin'}!
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-600 mb-4">✅ SUCESSO!</h2>
            <p className="text-slate-700 mb-4">
              O dashboard carregou corretamente. O problema anterior foi resolvido.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold text-blue-800">Usuário</h3>
                <p className="text-blue-600">{user?.email}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold text-green-800">Perfil</h3>
                <p className="text-green-600">{profile?.role}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded">
                <h3 className="font-semibold text-amber-800">Status</h3>
                <p className="text-amber-600">Funcionando!</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mt-6 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Voltar ao Dashboard Original
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTemp; 