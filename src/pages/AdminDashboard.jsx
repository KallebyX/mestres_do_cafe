import React, { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, DollarSign, Eye, Edit, Trash2, Plus, 
  Search, Filter, BarChart3, PieChart, Calendar, Coffee, Star,
  ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, productsAPI, ordersAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, productsData, ordersData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        productsAPI.getProducts({ per_page: 50 }),
        ordersAPI.getOrders({ per_page: 50 })
      ]);

      setStats(statsData);
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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await adminAPI.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        alert('Produto excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir produto');
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
      alert('Erro ao atualizar status do pedido');
    }
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

  return (
    <div className="min-h-screen bg-[#2B3A42] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo ⚡
          </h1>
          <p className="text-gray-400">
            Bem-vindo, {user?.name}! Gerencie sua loja de cafés especiais.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Usuários</h3>
            <p className="text-2xl font-bold text-blue-400">{stats.total_users || users.length}</p>
            <p className="text-xs text-gray-400">Total de clientes</p>
          </div>

          {/* Total Products */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#C8956D] rounded-full flex items-center justify-center">
                <Coffee className="text-[#2B3A42]" size={24} />
              </div>
              <Package className="text-[#C8956D]" size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Produtos</h3>
            <p className="text-2xl font-bold text-[#C8956D]">{stats.total_products || products.length}</p>
            <p className="text-xs text-gray-400">Cafés cadastrados</p>
          </div>

          {/* Total Orders */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <BarChart3 className="text-purple-400" size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Pedidos</h3>
            <p className="text-2xl font-bold text-purple-400">{stats.total_orders || orders.length}</p>
            <p className="text-xs text-gray-400">Total de pedidos</p>
          </div>

          {/* Revenue */}
          <div className="bg-[#1A2328] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Faturamento</h3>
            <p className="text-2xl font-bold text-green-400">
              R$ {(stats.total_revenue || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">Total em vendas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1A2328] rounded-lg mb-8">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Pedidos
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-[#C8956D] text-[#C8956D]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Relatórios
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Orders */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Pedidos Recentes</h3>
                  {loading ? (
                    <LoadingSpinner />
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-400">Nenhum pedido encontrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="bg-[#2B3A42] rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">Pedido #{order.id}</p>
                              <p className="text-gray-400 text-sm">
                                {order.user?.name} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
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

                {/* Top Products */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Produtos Mais Vendidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, 6).map(product => (
                      <div key={product.id} className="bg-[#2B3A42] rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">☕</div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{product.name}</h4>
                            <p className="text-gray-400 text-xs">{product.origin}</p>
                            <p className="text-[#C8956D] font-bold">R$ {product.price?.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Usuários</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#2B3A42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D]"
                      />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-400 font-medium py-3">Nome</th>
                          <th className="text-left text-gray-400 font-medium py-3">Email</th>
                          <th className="text-left text-gray-400 font-medium py-3">Tipo</th>
                          <th className="text-left text-gray-400 font-medium py-3">Pontos</th>
                          <th className="text-left text-gray-400 font-medium py-3">Nível</th>
                          <th className="text-left text-gray-400 font-medium py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="border-b border-gray-700/50">
                            <td className="py-3 text-white">{user.name}</td>
                            <td className="py-3 text-gray-400">{user.email}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.user_type === 'cliente_pf' ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'
                              }`}>
                                {user.user_type === 'cliente_pf' ? 'PF' : 'PJ'}
                              </span>
                            </td>
                            <td className="py-3 text-[#C8956D] font-medium">{user.points || 0}</td>
                            <td className="py-3 text-gray-300">{user.level || 'Bronze'}</td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <button className="text-blue-400 hover:text-blue-300">
                                  <Eye size={16} />
                                </button>
                                <button className="text-yellow-400 hover:text-yellow-300">
                                  <Edit size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Produtos</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#2B3A42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D]"
                      />
                    </div>
                    <button className="bg-[#C8956D] text-[#2B3A42] px-4 py-2 rounded-lg font-semibold hover:bg-[#C8956D]/90 transition-colors flex items-center">
                      <Plus className="mr-2" size={16} />
                      Novo Produto
                    </button>
                  </div>
                </div>

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="bg-[#2B3A42] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl">☕</div>
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <Eye size={16} />
                            </button>
                            <button className="text-yellow-400 hover:text-yellow-300">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className="text-white font-semibold mb-2">{product.name}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[#C8956D] font-bold text-lg">R$ {product.price?.toFixed(2)}</span>
                          <span className="text-gray-400 text-sm">{product.origin}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Estoque: {product.stock_quantity}</span>
                          <div className="flex items-center">
                            <Star className="text-yellow-400 mr-1" size={14} />
                            <span className="text-gray-400">{product.intensity}/5</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Pedidos</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#2B3A42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8956D]"
                    />
                  </div>
                </div>

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="bg-[#2B3A42] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-white font-semibold">Pedido #{order.id}</h4>
                            <p className="text-gray-400 text-sm">
                              {order.user?.name} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#C8956D] font-bold text-lg">R$ {order.total_amount?.toFixed(2)}</p>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-sm border-0 ${getStatusColor(order.status)}`}
                            >
                              <option value="pending">Pendente</option>
                              <option value="confirmed">Confirmado</option>
                              <option value="processing">Processando</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregue</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-gray-700 pt-4">
                            <h5 className="text-white font-medium mb-2">Itens</h5>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Relatórios e Análises</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Chart Placeholder */}
                  <div className="bg-[#2B3A42] rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Vendas por Mês</h4>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-400">Gráfico de vendas</p>
                        <p className="text-gray-500 text-sm">Em desenvolvimento</p>
                      </div>
                    </div>
                  </div>

                  {/* Products Chart Placeholder */}
                  <div className="bg-[#2B3A42] rounded-lg p-6">
                    <h4 className="text-white font-semibold mb-4">Produtos Mais Vendidos</h4>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                      <div className="text-center">
                        <PieChart className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-400">Gráfico de produtos</p>
                        <p className="text-gray-500 text-sm">Em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#2B3A42] rounded-lg p-6 text-center">
                    <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
                    <p className="text-2xl font-bold text-green-400">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                    <p className="text-gray-400">Pedidos Entregues</p>
                  </div>
                  
                  <div className="bg-[#2B3A42] rounded-lg p-6 text-center">
                    <Clock className="mx-auto text-yellow-400 mb-2" size={32} />
                    <p className="text-2xl font-bold text-yellow-400">
                      {orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length}
                    </p>
                    <p className="text-gray-400">Pedidos Pendentes</p>
                  </div>
                  
                  <div className="bg-[#2B3A42] rounded-lg p-6 text-center">
                    <XCircle className="mx-auto text-red-400 mb-2" size={32} />
                    <p className="text-2xl font-bold text-red-400">
                      {orders.filter(o => o.status === 'cancelled').length}
                    </p>
                    <p className="text-gray-400">Pedidos Cancelados</p>
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

export default AdminDashboard;

