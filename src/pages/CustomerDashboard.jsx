import React, { useState, useEffect } from 'react';
import { Package, Star, Clock, MapPin, User, Award, TrendingUp, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-400/10',
      confirmed: 'text-blue-400 bg-blue-400/10',
      processing: 'text-purple-400 bg-purple-400/10',
      shipped: 'text-orange-400 bg-orange-400/10',
      delivered: 'text-green-400 bg-green-400/10',
      cancelled: 'text-red-400 bg-red-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
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

  const getLevelColor = (level) => {
    const colors = {
      Bronze: 'text-orange-400',
      Prata: 'text-gray-300',
      Ouro: 'text-yellow-400',
      Platina: 'text-blue-300',
      Diamante: 'text-purple-400'
    };
    return colors[level] || 'text-gray-400';
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

  return (
    <div className="min-h-screen bg-[#2B3A42] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, {user?.name}! ☕
          </h1>
          <p className="text-gray-400">
            Bem-vindo ao seu painel de controle. Acompanhe seus pedidos e pontuação.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Points Card */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#C8956D] rounded-full flex items-center justify-center">
                <Star className="text-[#2B3A42]" size={24} />
              </div>
              <span className={`text-lg font-semibold ${getLevelColor(user?.level)}`}>
                {user?.level}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-2">Pontos</h3>
            <p className="text-2xl font-bold text-[#C8956D] mb-2">{user?.points || 0}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-[#C8956D] h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(user?.points || 0)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">
              {getNextLevelPoints(user?.points || 0) - (user?.points || 0)} pontos para o próximo nível
            </p>
          </div>

          {/* Total Spent */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Total Gasto</h3>
            <p className="text-2xl font-bold text-green-400">R$ {totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Em todos os pedidos</p>
          </div>

          {/* Orders Count */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Pedidos</h3>
            <p className="text-2xl font-bold text-blue-400">{orders.length}</p>
            <p className="text-xs text-gray-400">{completedOrders} entregues</p>
          </div>

          {/* Customer Type */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Tipo</h3>
            <p className="text-lg font-bold text-purple-400">
              {user?.user_type === 'cliente_pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </p>
            <p className="text-xs text-gray-400">
              {user?.user_type === 'cliente_pf' ? '1 ponto/R$' : '2 pontos/R$'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1A2328] rounded-lg mb-8">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Meus Pedidos
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Meu Perfil
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Últimos Pedidos</h3>
                  {loading ? (
                    <LoadingSpinner />
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Coffee className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-400">Você ainda não fez nenhum pedido.</p>
                      <p className="text-gray-400 text-sm">Que tal explorar nossos cafés especiais?</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="bg-[#2B3A42] rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Pedido #{order.id}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#C8956D] font-bold">R$ {order.total_amount?.toFixed(2)}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rewards Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Sistema de Recompensas</h3>
                  <div className="bg-[#2B3A42] rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-3">Como Ganhar Pontos</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                          <li>• {user?.user_type === 'cliente_pf' ? '1 ponto' : '2 pontos'} para cada R$ 1,00 gasto</li>
                          <li>• Bônus em compras acima de R$ 100,00</li>
                          <li>• Pontos extras em produtos especiais</li>
                          <li>• Avaliações de produtos</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-3">Níveis e Benefícios</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                          <li>• <span className="text-orange-400">Bronze</span>: 0-99 pontos</li>
                          <li>• <span className="text-gray-300">Prata</span>: 100-499 pontos</li>
                          <li>• <span className="text-yellow-400">Ouro</span>: 500-999 pontos</li>
                          <li>• <span className="text-blue-300">Platina</span>: 1000-2499 pontos</li>
                          <li>• <span className="text-purple-400">Diamante</span>: 2500+ pontos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Todos os Pedidos</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400">Você ainda não fez nenhum pedido.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-[#2B3A42] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-white font-semibold">Pedido #{order.id}</h4>
                            <p className="text-gray-400 text-sm flex items-center">
                              <Clock className="mr-1" size={14} />
                              {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#C8956D] font-bold text-lg">R$ {order.total_amount?.toFixed(2)}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-gray-700 pt-4">
                            <h5 className="text-white font-medium mb-2">Itens do Pedido</h5>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-300">
                                    {item.quantity}x {item.product?.name} ({item.weight_option})
                                  </span>
                                  <span className="text-gray-400">
                                    R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.tracking_code && (
                          <div className="border-t border-gray-700 pt-4 mt-4">
                            <p className="text-gray-400 text-sm">
                              <strong>Código de Rastreamento:</strong> {order.tracking_code}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Meu Perfil</h3>
                <div className="bg-[#2B3A42] rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-4">Informações Pessoais</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">Nome</label>
                          <p className="text-white">{user?.name}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Email</label>
                          <p className="text-white">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Telefone</label>
                          <p className="text-white">{user?.phone || 'Não informado'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Tipo de Cliente</label>
                          <p className="text-white">
                            {user?.user_type === 'cliente_pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-4">Endereço</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">Endereço</label>
                          <p className="text-white">{user?.address || 'Não informado'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Cidade</label>
                          <p className="text-white">{user?.city || 'Não informado'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Estado</label>
                          <p className="text-white">{user?.state || 'Não informado'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">CEP</label>
                          <p className="text-white">{user?.zip_code || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <button className="bg-[#C8956D] text-[#2B3A42] px-6 py-2 rounded-lg font-semibold hover:bg-[#C8956D]/90 transition-colors">
                      Editar Perfil
                    </button>
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

