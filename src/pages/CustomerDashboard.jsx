import React, { useState, useEffect } from 'react';
import { Package, Star, Clock, MapPin, User, Award, TrendingUp, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

  const getLevelColor = (level) => {
    const colors = {
      Bronze: 'text-orange-600',
      Prata: 'text-gray-500',
      Ouro: 'text-yellow-600',
      Platina: 'text-blue-600',
      Diamante: 'text-purple-600'
    };
    return colors[level] || 'text-gray-500';
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
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
              Olá, {user?.name}! ☕
            </h1>
            <p className="text-coffee-gray text-lg">
              Bem-vindo ao seu painel de controle. Acompanhe seus pedidos e pontuação.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Points Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center">
                  <Star className="text-coffee-white" size={24} />
                </div>
                <span className={`text-lg font-semibold ${getLevelColor(user?.level)}`}>
                  {user?.level}
                </span>
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Pontos</h3>
              <p className="text-2xl font-bold text-coffee-gold mb-2">{user?.points || 0}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-coffee-cream rounded-full h-2 mb-2">
                <div 
                  className="bg-coffee-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(user?.points || 0)}%` }}
                ></div>
              </div>
              <p className="text-xs text-coffee-gray">
                {getNextLevelPoints(user?.points || 0) - (user?.points || 0)} pontos para o próximo nível
              </p>
            </div>

            {/* Total Spent */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Total Gasto</h3>
              <p className="text-2xl font-bold text-green-600">R$ {totalSpent.toFixed(2)}</p>
              <p className="text-xs text-coffee-gray">Em todos os pedidos</p>
            </div>

            {/* Orders Count */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Pedidos</h3>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              <p className="text-xs text-coffee-gray">{completedOrders} entregues</p>
            </div>

            {/* Customer Type */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Tipo</h3>
              <p className="text-lg font-bold text-purple-600">
                {user?.user_type === 'cliente_pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </p>
              <p className="text-xs text-coffee-gray">
                {user?.user_type === 'cliente_pf' ? '1 ponto/R$' : '2 pontos/R$'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="card mb-8">
            <div className="border-b border-coffee-cream">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
                  }`}
                >
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
                  }`}
                >
                  Meus Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
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
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Últimos Pedidos</h3>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
                        <p className="text-coffee-gray">Carregando pedidos...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Coffee className="mx-auto text-coffee-gray mb-4" size={48} />
                        <p className="text-coffee-gray">Você ainda não fez nenhum pedido.</p>
                        <p className="text-coffee-gray text-sm">Que tal explorar nossos cafés especiais?</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map(order => (
                          <div key={order.id} className="bg-coffee-cream/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-coffee-intense font-medium">Pedido #{order.id}</p>
                                <p className="text-coffee-gray text-sm">
                                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-coffee-gold font-bold">R$ {order.total_amount?.toFixed(2)}</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
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
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Sistema de Recompensas</h3>
                    <div className="bg-coffee-cream/30 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-coffee-intense font-medium mb-3">Como Ganhar Pontos</h4>
                          <ul className="space-y-2 text-coffee-gray text-sm">
                            <li>• {user?.user_type === 'cliente_pf' ? '1 ponto' : '2 pontos'} para cada R$ 1,00 gasto</li>
                            <li>• Bônus em compras acima de R$ 100,00</li>
                            <li>• Pontos extras em produtos especiais</li>
                            <li>• Avaliações de produtos</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-coffee-intense font-medium mb-3">Níveis e Benefícios</h4>
                          <ul className="space-y-2 text-coffee-gray text-sm">
                            <li>• <span className="text-orange-600">Bronze</span>: 0-99 pontos</li>
                            <li>• <span className="text-gray-500">Prata</span>: 100-499 pontos</li>
                            <li>• <span className="text-yellow-600">Ouro</span>: 500-999 pontos</li>
                            <li>• <span className="text-blue-600">Platina</span>: 1000-2499 pontos</li>
                            <li>• <span className="text-purple-600">Diamante</span>: 2500+ pontos</li>
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
                  <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Todos os Pedidos</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
                      <p className="text-coffee-gray">Carregando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto text-coffee-gray mb-4" size={48} />
                      <p className="text-coffee-gray">Você ainda não fez nenhum pedido.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="bg-coffee-cream/30 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-coffee-intense font-semibold">Pedido #{order.id}</h4>
                              <p className="text-coffee-gray text-sm flex items-center">
                                <Clock className="mr-1" size={14} />
                                {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-coffee-gold font-bold text-lg">R$ {order.total_amount?.toFixed(2)}</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div className="border-t border-coffee-cream pt-4">
                              <h5 className="text-coffee-intense font-medium mb-2">Itens do Pedido</h5>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-coffee-gray">
                                      {item.quantity}x {item.product?.name} ({item.weight_option})
                                    </span>
                                    <span className="text-coffee-gray">
                                      R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {order.tracking_code && (
                            <div className="border-t border-coffee-cream pt-4 mt-4">
                              <p className="text-coffee-gray text-sm">
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
                  <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Meu Perfil</h3>
                  <div className="bg-coffee-cream/30 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-coffee-intense font-medium mb-4">Informações Pessoais</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-coffee-gray text-sm">Nome</label>
                            <p className="text-coffee-intense">{user?.name}</p>
                          </div>
                          <div>
                            <label className="text-coffee-gray text-sm">Email</label>
                            <p className="text-coffee-intense">{user?.email}</p>
                          </div>
                          <div>
                            <label className="text-coffee-gray text-sm">Telefone</label>
                            <p className="text-coffee-intense">{user?.phone || 'Não informado'}</p>
                          </div>
                          <div>
                            <label className="text-coffee-gray text-sm">Tipo de Cliente</label>
                            <p className="text-coffee-intense">
                              {user?.user_type === 'cliente_pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-coffee-intense font-medium mb-4">Endereço</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-coffee-gray text-sm">Endereço</label>
                            <p className="text-coffee-intense">{user?.address || 'Não informado'}</p>
                          </div>
                          <div>
                            <label className="text-coffee-gray text-sm">Cidade</label>
                            <p className="text-coffee-intense">{user?.city || 'Não informado'}</p>
                          </div>
                          <div>
                            <label className="text-coffee-gray text-sm">Estado</label>
                            <p className="text-coffee-intense">{user?.state || 'Não informado'}</p>
                          </div>
                          <div>
                            <label className="text-coffee-gray text-sm">CEP</label>
                            <p className="text-coffee-intense">{user?.zip_code || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-coffee-cream">
                      <button className="btn-primary px-6 py-2">
                        Editar Perfil
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;

