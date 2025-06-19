import React, { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, DollarSign, Eye, Edit, Trash2, Plus, 
  Search, Filter, BarChart3, PieChart, Calendar, Coffee, Star,
  ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, productsAPI, ordersAPI } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
              Painel Administrativo ⚡
            </h1>
            <p className="text-coffee-gray text-lg">
              Bem-vindo, {user?.name}! Gerencie sua loja de cafés especiais.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Usuários</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total_users || users.length}</p>
              <p className="text-xs text-coffee-gray">Total de clientes</p>
            </div>

            {/* Total Products */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-coffee rounded-full flex items-center justify-center">
                  <Coffee className="text-coffee-white" size={24} />
                </div>
                <Package className="text-coffee-gold" size={20} />
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Produtos</h3>
              <p className="text-2xl font-bold text-coffee-gold">{stats.total_products || products.length}</p>
              <p className="text-xs text-coffee-gray">Cafés cadastrados</p>
            </div>

            {/* Total Orders */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Pedidos</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.total_orders || orders.length}</p>
              <p className="text-xs text-coffee-gray">Total de pedidos</p>
            </div>

            {/* Revenue */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <DollarSign className="text-white" size={24} />
                </div>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="text-coffee-intense font-semibold mb-2">Faturamento</h3>
              <p className="text-2xl font-bold text-green-600">
                R$ {(stats.total_revenue || 0).toFixed(2)}
              </p>
              <p className="text-xs text-coffee-gray">Total em vendas</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="card mb-8">
            <div className="border-b border-coffee-cream">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
                  }`}
                >
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
                  }`}
                >
                  Usuários
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
                  }`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
                  }`}
                >
                  Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'border-coffee-gold text-coffee-gold'
                      : 'border-transparent text-coffee-gray hover:text-coffee-intense'
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
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Pedidos Recentes</h3>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
                        <p className="text-coffee-gray">Carregando...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="mx-auto text-coffee-gray mb-4" size={48} />
                        <p className="text-coffee-gray">Nenhum pedido encontrado.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="bg-coffee-cream/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-coffee-intense font-medium">Pedido #{order.id}</p>
                                <p className="text-coffee-gray text-sm">
                                  {order.user?.name} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
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

                  {/* Top Products */}
                  <div>
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Produtos Mais Vendidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.slice(0, 6).map(product => (
                        <div key={product.id} className="bg-coffee-cream/30 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-4xl">☕</div>
                            <div className="flex-1">
                              <h4 className="text-coffee-intense font-medium text-sm">{product.name}</h4>
                              <p className="text-coffee-gray text-xs">{product.origin}</p>
                              <p className="text-coffee-gold font-bold">R$ {product.price?.toFixed(2)}</p>
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
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense">Usuários</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-gray" size={20} />
                        <input
                          type="text"
                          placeholder="Buscar usuários..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense placeholder-coffee-gray focus:outline-none focus:border-coffee-gold focus:bg-coffee-white"
                        />
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
                      <p className="text-coffee-gray">Carregando...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-coffee-cream">
                            <th className="text-left text-coffee-gray font-medium py-3">Nome</th>
                            <th className="text-left text-coffee-gray font-medium py-3">Email</th>
                            <th className="text-left text-coffee-gray font-medium py-3">Tipo</th>
                            <th className="text-left text-coffee-gray font-medium py-3">Pontos</th>
                            <th className="text-left text-coffee-gray font-medium py-3">Nível</th>
                            <th className="text-left text-coffee-gray font-medium py-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-coffee-cream/50">
                              <td className="py-3 text-coffee-intense">{user.name}</td>
                              <td className="py-3 text-coffee-gray">{user.email}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.user_type === 'cliente_pf' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                  {user.user_type === 'cliente_pf' ? 'PF' : 'PJ'}
                                </span>
                              </td>
                              <td className="py-3 text-coffee-gold font-medium">{user.points || 0}</td>
                              <td className="py-3 text-coffee-gray">{user.level || 'Bronze'}</td>
                              <td className="py-3">
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <Eye size={16} />
                                  </button>
                                  <button className="text-yellow-600 hover:text-yellow-800">
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
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense">Produtos</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-gray" size={20} />
                        <input
                          type="text"
                          placeholder="Buscar produtos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense placeholder-coffee-gray focus:outline-none focus:border-coffee-gold focus:bg-coffee-white"
                        />
                      </div>
                      <button className="btn-primary flex items-center px-4 py-2">
                        <Plus className="mr-2" size={16} />
                        Novo Produto
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
                      <p className="text-coffee-gray">Carregando...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="bg-coffee-cream/30 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl">☕</div>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye size={16} />
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-800">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="text-coffee-intense font-semibold mb-2">{product.name}</h4>
                          <p className="text-coffee-gray text-sm mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-coffee-gold font-bold text-lg">R$ {product.price?.toFixed(2)}</span>
                            <span className="text-coffee-gray text-sm">{product.origin}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-coffee-gray">Estoque: {product.stock_quantity}</span>
                            <div className="flex items-center">
                              <Star className="text-yellow-600 mr-1" size={14} />
                              <span className="text-coffee-gray">{product.intensity}/5</span>
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
                    <h3 className="font-cormorant font-bold text-xl text-coffee-intense">Pedidos</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-gray" size={20} />
                      <input
                        type="text"
                        placeholder="Buscar pedidos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-coffee-cream border-2 border-coffee-cream rounded-lg text-coffee-intense placeholder-coffee-gray focus:outline-none focus:border-coffee-gold focus:bg-coffee-white"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
                      <p className="text-coffee-gray">Carregando...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="bg-coffee-cream/30 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-coffee-intense font-semibold">Pedido #{order.id}</h4>
                              <p className="text-coffee-gray text-sm">
                                {order.user?.name} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-coffee-gold font-bold text-lg">R$ {order.total_amount?.toFixed(2)}</p>
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
                            <div className="border-t border-coffee-cream pt-4">
                              <h5 className="text-coffee-intense font-medium mb-2">Itens</h5>
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">Relatórios e Analytics</h3>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-12 h-12 text-coffee-gold" />
                    </div>
                    <h4 className="font-cormorant font-bold text-2xl text-coffee-intense mb-2">
                      Relatórios em Desenvolvimento
                    </h4>
                    <p className="text-coffee-gray">
                      Esta seção estará disponível em breve com gráficos detalhados e métricas avançadas.
                    </p>
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

export default AdminDashboard;

