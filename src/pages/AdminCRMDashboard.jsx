import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, UserPlus, Mail, Phone, 
  Calendar, MapPin, Star, TrendingUp, DollarSign, Package,
  Edit, Trash2, Eye, MessageSquare, Send, UserCheck, 
  BarChart3, PieChart, Activity, Target, Award, Clock
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminCRMDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadCustomersData();
  }, [user, hasPermission, navigate]);

  const loadCustomersData = async () => {
    setLoading(true);
    try {
      // Dados mock de clientes
      const mockCustomers = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(51) 99999-1234',
          user_type: 'cliente_pf',
          points: 1250,
          level: 'Ouro',
          total_spent: 890.50,
          orders_count: 8,
          last_order: '2024-01-20',
          created_at: '2023-08-15',
          city: 'Santa Maria',
          state: 'RS',
          status: 'active',
          avg_order_value: 111.31,
          favorite_category: 'Cafés Especiais',
          last_interaction: '2024-01-22',
          lifetime_value: 890.50,
          acquisition_channel: 'website',
          segment: 'high_value'
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria.santos@empresa.com',
          phone: '(51) 98888-5678',
          user_type: 'cliente_pj',
          points: 2840,
          level: 'Platina',
          total_spent: 2150.00,
          orders_count: 15,
          last_order: '2024-01-18',
          created_at: '2023-06-10',
          city: 'Porto Alegre',
          state: 'RS',
          status: 'active',
          avg_order_value: 143.33,
          favorite_category: 'Blends Premium',
          last_interaction: '2024-01-19',
          lifetime_value: 2150.00,
          acquisition_channel: 'referral',
          segment: 'vip'
        },
        {
          id: 3,
          name: 'Pedro Costa',
          email: 'pedro.costa@email.com',
          phone: '(51) 97777-9012',
          user_type: 'cliente_pf',
          points: 450,
          level: 'Prata',
          total_spent: 325.75,
          orders_count: 4,
          last_order: '2024-01-05',
          created_at: '2023-11-20',
          city: 'Santa Maria',
          state: 'RS',
          status: 'inactive',
          avg_order_value: 81.44,
          favorite_category: 'Cafés Tradicionais',
          last_interaction: '2024-01-05',
          lifetime_value: 325.75,
          acquisition_channel: 'social_media',
          segment: 'regular'
        },
        {
          id: 4,
          name: 'Ana Oliveira',
          email: 'ana.oliveira@cafeteria.com',
          phone: '(51) 96666-3456',
          user_type: 'cliente_pj',
          points: 3200,
          level: 'Diamante',
          total_spent: 4500.00,
          orders_count: 25,
          last_order: '2024-01-21',
          created_at: '2023-03-05',
          city: 'Santa Maria',
          state: 'RS',
          status: 'active',
          avg_order_value: 180.00,
          favorite_category: 'Cafés Gourmet',
          last_interaction: '2024-01-21',
          lifetime_value: 4500.00,
          acquisition_channel: 'direct',
          segment: 'vip'
        },
        {
          id: 5,
          name: 'Carlos Ferreira',
          email: 'carlos@email.com',
          phone: '(51) 95555-7890',
          user_type: 'cliente_pf',
          points: 120,
          level: 'Bronze',
          total_spent: 89.90,
          orders_count: 2,
          last_order: '2023-12-28',
          created_at: '2023-12-15',
          city: 'Cruz Alta',
          state: 'RS',
          status: 'new',
          avg_order_value: 44.95,
          favorite_category: 'Cafés Especiais',
          last_interaction: '2023-12-28',
          lifetime_value: 89.90,
          acquisition_channel: 'google_ads',
          segment: 'new'
        }
      ];

      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Erro ao carregar dados de clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Bronze': 'text-orange-600 bg-orange-100',
      'Prata': 'text-gray-600 bg-gray-100',
      'Ouro': 'text-yellow-600 bg-yellow-100',
      'Platina': 'text-blue-600 bg-blue-100',
      'Diamante': 'text-purple-600 bg-purple-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-600 bg-green-100',
      'inactive': 'text-orange-600 bg-orange-100',
      'new': 'text-blue-600 bg-blue-100',
      'churned': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const texts = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'new': 'Novo',
      'churned': 'Perdido'
    };
    return texts[status] || status;
  };

  const getSegmentColor = (segment) => {
    const colors = {
      'vip': 'text-purple-600 bg-purple-100',
      'high_value': 'text-emerald-600 bg-emerald-100',
      'regular': 'text-blue-600 bg-blue-100',
      'new': 'text-cyan-600 bg-cyan-100',
      'at_risk': 'text-orange-600 bg-orange-100'
    };
    return colors[segment] || 'text-gray-600 bg-gray-100';
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleExportData = () => {
    // Implementar exportação para Excel/CSV
    alert('Exportando dados de clientes... (funcionalidade em desenvolvimento)');
  };

  const handleSendEmail = (customer) => {
    alert(`Enviando email para ${customer.name}... (funcionalidade em desenvolvimento)`);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    const matchesType = filterType === 'all' || customer.user_type === filterType;
    const matchesLevel = filterLevel === 'all' || customer.level === filterLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'created_at' || sortBy === 'last_order' || sortBy === 'last_interaction') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Cálculos para KPIs
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const avgLifetimeValue = totalRevenue / totalCustomers;
  const avgOrderValue = customers.reduce((sum, c) => sum + c.avg_order_value, 0) / totalCustomers;
  
  // Segmentação
  const segments = {
    vip: customers.filter(c => c.segment === 'vip').length,
    high_value: customers.filter(c => c.segment === 'high_value').length,
    regular: customers.filter(c => c.segment === 'regular').length,
    new: customers.filter(c => c.segment === 'new').length,
    at_risk: customers.filter(c => c.segment === 'at_risk').length
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-slate-900">CRM - Gestão de Clientes</h1>
              </div>
              <p className="text-xl text-slate-600">
                Sistema completo de relacionamento com clientes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportData}
                className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => setShowCustomerModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Novo Cliente
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="text-white w-6 h-6" />
              </div>
              <TrendingUp className="text-blue-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Total Clientes</h3>
            <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
            <p className="text-xs text-slate-500">{activeCustomers} ativos • {newCustomers} novos</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <Activity className="text-green-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">LTV Médio</h3>
            <p className="text-3xl font-bold text-green-600">R$ {avgLifetimeValue.toFixed(0)}</p>
            <p className="text-xs text-slate-500">Lifetime Value por cliente</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Target className="text-white w-6 h-6" />
              </div>
              <BarChart3 className="text-purple-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Ticket Médio</h3>
            <p className="text-3xl font-bold text-purple-600">R$ {avgOrderValue.toFixed(0)}</p>
            <p className="text-xs text-slate-500">Valor médio por pedido</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Award className="text-white w-6 h-6" />
              </div>
              <Star className="text-amber-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Clientes VIP</h3>
            <p className="text-3xl font-bold text-amber-600">{segments.vip}</p>
            <p className="text-xs text-slate-500">{((segments.vip / totalCustomers) * 100).toFixed(1)}% do total</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'customers', label: 'Lista de Clientes', icon: Users },
                { id: 'segments', label: 'Segmentação', icon: PieChart },
                { id: 'analytics', label: 'Analytics', icon: Activity }
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Executivo</h3>
                  
                  {/* Segmentation Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Segmentação de Clientes</h4>
                      <div className="space-y-3">
                        {Object.entries(segments).map(([segment, count]) => (
                          <div key={segment} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getSegmentColor(segment).split(' ')[1]}`}></div>
                              <span className="text-slate-700 capitalize">
                                {segment === 'vip' ? 'VIP' : 
                                 segment === 'high_value' ? 'Alto Valor' :
                                 segment === 'at_risk' ? 'Em Risco' :
                                 segment === 'new' ? 'Novos' : 'Regulares'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-900 font-semibold">{count}</span>
                              <span className="text-slate-500 text-sm ml-2">
                                ({((count / totalCustomers) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Top Clientes por Valor</h4>
                      <div className="space-y-3">
                        {customers
                          .sort((a, b) => b.total_spent - a.total_spent)
                          .slice(0, 5)
                          .map(customer => (
                            <div key={customer.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-slate-900 font-medium">{customer.name}</p>
                                <p className="text-slate-500 text-sm">{customer.orders_count} pedidos</p>
                              </div>
                              <div className="text-right">
                                <p className="text-green-600 font-bold">R$ {customer.total_spent.toFixed(2)}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(customer.level)}`}>
                                  {customer.level}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Atividade Recente</h4>
                    <div className="space-y-4">
                      {customers
                        .sort((a, b) => new Date(b.last_interaction) - new Date(a.last_interaction))
                        .slice(0, 5)
                        .map(customer => (
                          <div key={customer.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    {customer.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-slate-900">{customer.name}</h5>
                                  <p className="text-slate-600 text-sm">
                                    Última interação: {new Date(customer.last_interaction).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-900 font-medium">R$ {customer.total_spent.toFixed(2)}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                  {getStatusText(customer.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div>
                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="cliente_pf">Pessoa Física</option>
                      <option value="cliente_pj">Pessoa Jurídica</option>
                    </select>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="all">Todos os níveis</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Prata">Prata</option>
                      <option value="Ouro">Ouro</option>
                      <option value="Platina">Platina</option>
                      <option value="Diamante">Diamante</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="created_at">Data de cadastro</option>
                      <option value="total_spent">Valor gasto</option>
                      <option value="orders_count">Número de pedidos</option>
                      <option value="last_interaction">Última interação</option>
                    </select>
                  </div>
                </div>

                {/* Customers List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando clientes...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedCustomers.map(customer => (
                      <div key={customer.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => handleCustomerClick(customer)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(customer.level)}`}>
                                  {customer.level}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                  {getStatusText(customer.status)}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(customer.segment)}`}>
                                  {customer.segment === 'vip' ? 'VIP' : 
                                   customer.segment === 'high_value' ? 'Alto Valor' :
                                   customer.segment === 'at_risk' ? 'Risco' :
                                   customer.segment === 'new' ? 'Novo' : 'Regular'}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{customer.city}, {customer.state}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-2xl font-bold text-green-600">R$ {customer.total_spent.toFixed(2)}</p>
                                <p className="text-sm text-slate-500">{customer.orders_count} pedidos</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-amber-600">{customer.points} pts</p>
                                <p className="text-sm text-slate-500">Último: {new Date(customer.last_order).toLocaleDateString('pt-BR')}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendEmail(customer);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'segments' || activeTab === 'analytics') && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'segments' ? <PieChart className="w-8 h-8 text-slate-400" /> : <Activity className="w-8 h-8 text-slate-400" />}
                </div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">Seção {activeTab} em desenvolvimento</h4>
                <p className="text-slate-600">Este módulo será implementado na próxima etapa com gráficos avançados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Detail Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {selectedCustomer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                      <p className="text-slate-600">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Pessoais</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Telefone:</span>
                          <span className="text-slate-900">{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tipo:</span>
                          <span className="text-slate-900">
                            {selectedCustomer.user_type === 'cliente_pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Localização:</span>
                          <span className="text-slate-900">{selectedCustomer.city}, {selectedCustomer.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cadastro:</span>
                          <span className="text-slate-900">{new Date(selectedCustomer.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Preferências</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Categoria favorita:</span>
                          <span className="text-slate-900">{selectedCustomer.favorite_category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Canal de aquisição:</span>
                          <span className="text-slate-900">{selectedCustomer.acquisition_channel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Métricas</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-slate-600 text-sm">Total Gasto</p>
                          <p className="text-2xl font-bold text-green-600">R$ {selectedCustomer.total_spent.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-slate-600 text-sm">Pedidos</p>
                          <p className="text-2xl font-bold text-blue-600">{selectedCustomer.orders_count}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-slate-600 text-sm">Pontos</p>
                          <p className="text-2xl font-bold text-amber-600">{selectedCustomer.points}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-slate-600 text-sm">Ticket Médio</p>
                          <p className="text-2xl font-bold text-purple-600">R$ {selectedCustomer.avg_order_value.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Nível:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedCustomer.level)}`}>
                            {selectedCustomer.level}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Status:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCustomer.status)}`}>
                            {getStatusText(selectedCustomer.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Última interação:</span>
                          <span className="text-slate-900">{new Date(selectedCustomer.last_interaction).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 mt-8">
                  <button
                    onClick={() => handleSendEmail(selectedCustomer)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Email
                  </button>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCRMDashboard; 