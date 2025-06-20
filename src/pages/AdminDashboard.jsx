import React, { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, DollarSign, Eye, Edit, Trash2, Plus, 
  Search, BarChart3, Coffee, Star, ShoppingCart, Crown, FileText,
  Settings, Download, Filter, Calendar, Target, Database,
  PieChart, Activity, UserCheck, TrendingDown
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { adminAPI, productsAPI, ordersAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário tem permissão de admin
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [user, hasPermission, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, productsData, ordersData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getProducts(),
        ordersAPI.getAll()
      ]);

      setStats(statsData.stats || {});
      setUsers(usersData.users || []);
      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
      processing: 'text-purple-600 bg-purple-50 border-purple-200',
      shipped: 'text-orange-600 bg-orange-50 border-orange-200',
      delivered: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await adminAPI.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        alert('Produto excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir produto: ' + error.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      alert('Status do pedido atualizado!');
    } catch (error) {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const exportData = (type) => {
    // Implementar exportação para Excel/CSV
    alert(`Exportando dados de ${type}... (funcionalidade em desenvolvimento)`);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.id?.toString().includes(searchTerm) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos para KPIs avançados
  const totalRevenue = orders.filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  
  const monthlyRevenue = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    const currentMonth = new Date().getMonth();
    return orderDate.getMonth() === currentMonth && o.status === 'delivered';
  }).reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0;

  if (!user || !hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
          <p className="text-slate-600">Você precisa de permissões de administrador para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-slate-900">Painel Administrativo</h1>
              </div>
              <p className="text-xl text-slate-600">
                Bem-vindo, {user?.profile?.name || user?.name}! Controle total do Mestres do Café.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/blog')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Gerenciar Blog
              </button>
              <button
                onClick={() => exportData('all')}
                className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Dados
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="text-white w-6 h-6" />
                </div>
                <TrendingUp className="text-green-600 w-5 h-5" />
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Faturamento Total</h3>
              <p className="text-3xl font-bold text-green-600 mb-1">R$ {totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Este mês: R$ {monthlyRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="text-white w-6 h-6" />
                </div>
                <UserCheck className="text-blue-600 w-5 h-5" />
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Clientes Ativos</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">{users.length}</p>
              <p className="text-xs text-slate-500">Taxa conversão: {conversionRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Coffee className="text-white w-6 h-6" />
                </div>
                <Package className="text-amber-600 w-5 h-5" />
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Produtos Ativos</h3>
              <p className="text-3xl font-bold text-amber-600 mb-1">{products.length}</p>
              <p className="text-xs text-slate-500">Cafés especiais cadastrados</p>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="text-white w-6 h-6" />
                </div>
                <Activity className="text-purple-600 w-5 h-5" />
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Ticket Médio</h3>
              <p className="text-3xl font-bold text-purple-600 mb-1">R$ {averageOrderValue.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Total pedidos: {orders.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Novo Produto</h4>
                  <p className="text-sm text-slate-600">Adicionar café especial</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/blog')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Novo Post</h4>
                  <p className="text-sm text-slate-600">Criar conteúdo blog</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Relatórios</h4>
                  <p className="text-sm text-slate-600">Analytics avançados</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">CRM Clientes</h4>
                  <p className="text-sm text-slate-600">Gerenciar usuários</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'users', label: 'CRM Clientes', icon: Users },
                { id: 'products', label: 'Produtos', icon: Package },
                { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
                { id: 'analytics', label: 'Analytics', icon: PieChart },
                { id: 'financial', label: 'Financeiro', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Visão Geral Executiva</h3>
                  
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Revenue Chart Placeholder */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Faturamento Mensal</h4>
                      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600">Gráfico de faturamento</p>
                          <p className="text-sm text-slate-500">Em desenvolvimento</p>
                        </div>
                      </div>
                    </div>

                    {/* Orders Chart Placeholder */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Pedidos por Status</h4>
                      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
                        <div className="text-center">
                          <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600">Gráfico de pedidos</p>
                          <p className="text-sm text-slate-500">Em desenvolvimento</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Atividade Recente</h4>
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Carregando...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">Nenhum pedido encontrado.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-semibold text-slate-900 mb-1">Pedido #{order.id}</h5>
                                <p className="text-slate-600 text-sm">
                                  {order.user?.name} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-amber-600 mb-1">R$ {order.total_amount?.toFixed(2)}</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rest of the tabs content will be implemented in the continuation... */}
            {activeTab !== 'overview' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">Seção {activeTab} em desenvolvimento</h4>
                <p className="text-slate-600">Este módulo será implementado na próxima etapa.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

