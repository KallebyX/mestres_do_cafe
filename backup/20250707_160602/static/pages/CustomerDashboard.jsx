import React, { useState, useEffect } from 'react';
import { Package, Star, Clock, User, TrendingUp, Coffee, ShoppingBag, Award, Target, Zap, Crown } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { ordersAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAdmin, profile } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário é admin e redirecionar
    if (profile && (profile.role === 'admin' || profile.role === 'super_admin' || isAdmin)) {
      console.log('👑 Admin detectado no CustomerDashboard, redirecionando para área administrativa...');
      navigate('/admin/crm');
      return;
    }

    if (user?.id) {
      loadOrders();
    }
  }, [user, profile, isAdmin, navigate]);

  const loadOrders = async () => {
    if (!user?.id) {
      console.warn('Usuário não logado ou sem ID');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Buscando pedidos para o usuário:', user.id);
      const data = await ordersAPI.getUserOrders(user.id);
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      processing: 'text-purple-600 bg-purple-100',
      shipped: 'text-orange-600 bg-orange-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getLevelInfo = (points) => {
    if (points < 100) return { name: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (points < 500) return { name: 'Prata', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (points < 1000) return { name: 'Ouro', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (points < 2500) return { name: 'Platina', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { name: 'Diamante', color: 'text-purple-600', bg: 'bg-purple-100' };
  };

  const getNextLevelPoints = (currentPoints) => {
    if (currentPoints < 100) return 100;
    if (currentPoints < 500) return 500;
    if (currentPoints < 1000) return 1000;
    if (currentPoints < 2500) return 2500;
    return 5000;
  };

  const getProgressPercentage = (currentPoints) => {
    const nextLevel = getNextLevelPoints(currentPoints);
    let previousLevel = 0;
    
    if (nextLevel === 500) previousLevel = 100;
    else if (nextLevel === 1000) previousLevel = 500;
    else if (nextLevel === 2500) previousLevel = 1000;
    else if (nextLevel === 5000) previousLevel = 2500;
    
    return ((currentPoints - previousLevel) / (nextLevel - previousLevel)) * 100;
  };

  const totalSpent = orders
    .filter(order => ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status))
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const userPoints = user?.profile?.points || 0;
  const levelInfo = getLevelInfo(userPoints);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se é admin, mostrar mensagem de redirecionamento
  if (profile && (profile.role === 'admin' || profile.role === 'super_admin' || isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Área Administrativa
          </h2>
          <p className="text-slate-600 mb-6">
            Como administrador, você será redirecionado para o painel administrativo.
          </p>
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Olá, {user?.profile?.name || user?.name || 'Usuário'}! ☕
            </h1>
            <p className="text-xl text-slate-600">
              Bem-vindo ao seu painel de controle. Acompanhe seus pedidos e progresso.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Points Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="text-white w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.color} ${levelInfo.bg}`}>
                  {levelInfo.name}
                </span>
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Pontos</h3>
              <p className="text-3xl font-bold text-amber-600 mb-3">{userPoints}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(userPoints)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">
                {getNextLevelPoints(userPoints) - userPoints} pontos para {getNextLevelPoints(userPoints) === 5000 ? 'manter' : 'próximo nível'}
              </p>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white w-6 h-6" />
                </div>
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Total Investido</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">R$ {totalSpent.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Em todos os pedidos</p>
            </div>
          </div>

          {/* Orders Count */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="text-white w-6 h-6" />
                </div>
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Pedidos</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">{orders.length}</p>
              <p className="text-xs text-slate-500">{completedOrders} entregues</p>
            </div>
          </div>

          {/* Customer Type */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="text-white w-6 h-6" />
                </div>
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Conta</h3>
              <p className="text-lg font-bold text-purple-600 mb-1">
                {user?.profile?.user_type === 'cliente_pj' ? 'Empresarial' : 'Pessoal'}
              </p>
              <p className="text-xs text-slate-500">
                {user?.profile?.user_type === 'cliente_pj' ? '2x pontos' : '1x pontos'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Explorar Cafés</h3>
                  <p className="text-sm text-slate-600">Descubra novos sabores</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/perfil')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Meu Perfil</h3>
                  <p className="text-sm text-slate-600">Editar informações</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/pedidos')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Meus Pedidos</h3>
                  <p className="text-sm text-slate-600">Acompanhar entregas</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: Target },
                { id: 'orders', label: 'Meus Pedidos', icon: Package },
                { id: 'rewards', label: 'Recompensas', icon: Award }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Últimos Pedidos</h3>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600">Carregando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coffee className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-lg font-medium text-slate-900 mb-2">Nenhum pedido ainda</h4>
                      <p className="text-slate-600 mb-6">Que tal explorar nossos cafés especiais?</p>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                      >
                        Explorar Cafés
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-1">Pedido #{order.id}</h4>
                              <p className="text-slate-600 text-sm flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-amber-600 mb-1">R$ {order.total_amount?.toFixed(2)}</p>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {orders.length > 3 && (
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="w-full py-3 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                        >
                          Ver todos os pedidos →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Todos os Pedidos</h3>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Você ainda não fez nenhum pedido.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-1">Pedido #{order.id}</h4>
                            <p className="text-slate-600 text-sm flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-600 mb-2">R$ {order.total_amount?.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-slate-200 pt-4">
                            <h5 className="font-medium text-slate-900 mb-3">Itens do Pedido</h5>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-slate-700">
                                    {item.quantity}x {item.product?.name} ({item.weight_option})
                                  </span>
                                  <span className="font-medium text-slate-900">
                                    R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.tracking_code && (
                          <div className="border-t border-slate-200 pt-4 mt-4">
                            <p className="text-slate-700 text-sm">
                              <strong>Código de Rastreamento:</strong> 
                              <span className="font-mono bg-slate-100 px-2 py-1 rounded ml-2">{order.tracking_code}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Sistema de Recompensas</h3>
                  
                  {/* Level Progress */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">Nível Atual: {levelInfo.name}</h4>
                        <p className="text-slate-600">Você tem {userPoints} pontos</p>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${levelInfo.bg}`}>
                        <Award className={`w-8 h-8 ${levelInfo.color}`} />
                      </div>
                    </div>
                    
                    <div className="w-full bg-white rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(userPoints)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600">
                      {getNextLevelPoints(userPoints) === 5000 && userPoints >= 2500 
                        ? 'Você já atingiu o nível máximo!' 
                        : `Faltam ${getNextLevelPoints(userPoints) - userPoints} pontos para o próximo nível`
                      }
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* How to Earn Points */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Como Ganhar Pontos
                      </h4>
                      <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                          <span>{user?.profile?.user_type === 'cliente_pf' ? '1 ponto' : '2 pontos'} para cada R$ 1,00 gasto</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                          <span>Bônus em compras acima de R$ 100,00</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                          <span>Pontos extras em produtos especiais</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                          <span>Avaliações de produtos</span>
                        </li>
                      </ul>
                    </div>

                    {/* Levels and Benefits */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Níveis e Benefícios
                      </h4>
                      <ul className="space-y-3">
                        {[
                          { name: 'Bronze', range: '0-99 pontos', color: 'text-orange-600' },
                          { name: 'Prata', range: '100-499 pontos', color: 'text-gray-500' },
                          { name: 'Ouro', range: '500-999 pontos', color: 'text-yellow-600' },
                          { name: 'Platina', range: '1000-2499 pontos', color: 'text-blue-600' },
                          { name: 'Diamante', range: '2500+ pontos', color: 'text-purple-600' }
                        ].map(level => (
                          <li key={level.name} className="flex items-center justify-between">
                            <span className={`font-medium ${level.color}`}>{level.name}</span>
                            <span className="text-sm text-slate-600">{level.range}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

