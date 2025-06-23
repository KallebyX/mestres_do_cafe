import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Download, UserPlus, Mail, Phone, 
  TrendingUp, DollarSign, Edit, Eye, UserCheck, 
  BarChart3, PieChart, Activity, Target, Award,
  AlertCircle, CheckCircle, User, Building, Clock,
  MoreVertical, Filter, ChevronLeft, ChevronRight, 
  Shield, Globe, ArrowLeft
} from 'lucide-react';
import { Toggle } from '../components/ui/toggle';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerCreateModal from '../components/CustomerCreateModal';
import { 
  getAdminCustomers, 
  toggleCustomerStatus,
  getAllCustomers,
  toggleAnyCustomerStatus
} from '../lib/supabase-admin-api';

const AdminCRMDashboard = () => {
  const [activeTab, setActiveTab] = useState('admin-only'); // 'admin-only' ou 'all-customers'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'admin', 'self'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadCustomersData();
  }, [user, hasPermission, navigate, pagination.page, searchTerm, filterSource, activeTab]);

  const loadCustomersData = async () => {
    console.log('🔄 Iniciando carregamento de clientes...');
    console.log('📊 Parâmetros:', { activeTab, pagination, searchTerm, filterSource });
    
    setLoading(true);
    setError('');
    
    try {
      let result;
      
      if (activeTab === 'admin-only') {
        console.log('👤 Buscando clientes criados pelo admin...');
        // Buscar apenas clientes criados pelo admin
        result = await getAdminCustomers({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        console.log('👤 Resultado admin clients:', result);
      } else {
        console.log('📋 Buscando todos os clientes...');
        // Buscar todos os clientes
        result = await getAllCustomers({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          origin: filterSource === 'admin' ? 'admin' : filterSource === 'self' ? 'auto' : undefined
        });
        console.log('📋 Resultado all clients:', result);
      }
      
      if (result && result.success) {
        console.log(`✅ ${result.customers.length} clientes carregados com sucesso`);
        setCustomers(result.customers);
        if (result.pagination) {
          setPagination(prev => ({ ...prev, ...result.pagination }));
        }
      } else {
        console.error('❌ Erro na resposta:', result);
        setError(result ? result.error : 'Erro desconhecido ao carregar clientes');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados de clientes:', error);
      setError('Erro ao carregar clientes: ' + error.message);
    } finally {
      setLoading(false);
      console.log('🏁 Carregamento finalizado');
    }
  };

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setShowCustomerModal(true);
  };

  const handleModalSuccess = () => {
    loadCustomersData();
    setSuccess('Operação realizada com sucesso!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleStatus = async (customerId, currentIsActive, isAdminCreated) => {
    try {
      let result;
      
      // Simular toggle do status baseado no campo is_active ou role
      const newStatus = currentIsActive ? 'inactive' : 'active';
      
      if (isAdminCreated) {
        // Usar a API específica para clientes criados pelo admin
        result = await toggleCustomerStatus(customerId, newStatus);
      } else {
        // Usar a API genérica para qualquer cliente
        result = await toggleAnyCustomerStatus(customerId, newStatus);
      }
      
      if (result.success) {
        loadCustomersData();
        setSuccess('Status do cliente alterado com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Erro ao alterar status do cliente');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Resetar filtros ao mudar de aba
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchTerm('');
    setFilterSource('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Cálculos para KPIs
  const totalCustomers = customers.length;
  const pendingCustomers = customers.filter(c => c.pendente_ativacao).length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const adminCreatedCustomers = customers.filter(c => c.criado_por_admin).length;
  const selfRegisteredCustomers = customers.filter(c => !c.criado_por_admin).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-slate-900">CRM - Gestão de Clientes</h1>
              </div>
              <p className="text-xl text-slate-600">
                {activeTab === 'admin-only' 
                  ? 'Gerencie clientes criados manualmente pelo admin'
                  : 'Gerencie todos os clientes do sistema'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {/* Implementar exportação */}}
                className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handleCreateCustomer}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Criar Cliente Manual
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange('admin-only')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'admin-only'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Clientes Criados pelo Admin
              </button>
              <button
                onClick={() => handleTabChange('all-customers')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'all-customers'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                Todos os Clientes
              </button>
            </nav>
          </div>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

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
            <p className="text-xs text-slate-500">
              {activeTab === 'admin-only' ? 'Criados pelo admin' : 'Todos os clientes'}
            </p>
          </div>

          {activeTab === 'all-customers' && (
            <>
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Shield className="text-white w-6 h-6" />
                  </div>
                  <Activity className="text-purple-600 w-5 h-5" />
                </div>
                <h3 className="text-slate-700 font-medium mb-2">Criados pelo Admin</h3>
                <p className="text-3xl font-bold text-purple-600">{adminCreatedCustomers}</p>
                <p className="text-xs text-slate-500">Cadastro manual</p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <Globe className="text-white w-6 h-6" />
                  </div>
                  <UserCheck className="text-cyan-600 w-5 h-5" />
                </div>
                <h3 className="text-slate-700 font-medium mb-2">Auto-cadastrados</h3>
                <p className="text-3xl font-bold text-cyan-600">{selfRegisteredCustomers}</p>
                <p className="text-xs text-slate-500">Cadastro próprio</p>
              </div>
            </>
          )}

          {activeTab === 'admin-only' && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <Activity className="text-orange-600 w-5 h-5" />
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Pendentes</h3>
              <p className="text-3xl font-bold text-orange-600">{pendingCustomers}</p>
              <p className="text-xs text-slate-500">Aguardando ativação</p>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <UserCheck className="text-white w-6 h-6" />
              </div>
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Ativos</h3>
            <p className="text-3xl font-bold text-green-600">{activeCustomers}</p>
            <p className="text-xs text-slate-500">Contas ativadas</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <Target className="text-amber-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">LTV Médio</h3>
            <p className="text-3xl font-bold text-amber-600">R$ {avgLifetimeValue.toFixed(0)}</p>
            <p className="text-xs text-slate-500">Valor por cliente</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Lista de Clientes</h3>
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
                
                {/* Filtro por origem (apenas na aba todos os clientes) */}
                {activeTab === 'all-customers' && (
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">Todas as origens</option>
                    <option value="admin">Criados pelo admin</option>
                    <option value="self">Auto-cadastrados</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando clientes...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mb-6">
                  {activeTab === 'admin-only' 
                    ? 'Crie o primeiro cliente manualmente para começar'
                    : 'Não há clientes que correspondam aos filtros aplicados'
                  }
                </p>
                {activeTab === 'admin-only' && (
                  <button
                    onClick={handleCreateCustomer}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                  >
                    Criar Primeiro Cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map(customer => (
                  <div key={customer.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                          {customer.user_type === 'cliente_pj' ? (
                            <Building className="text-white w-6 h-6" />
                          ) : (
                            <User className="text-white w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-1">{customer.name}</h5>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              customer.pendente_ativacao 
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : customer.is_active 
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {customer.pendente_ativacao ? 'Pendente' : customer.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              customer.user_type === 'cliente_pj' 
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {customer.user_type === 'cliente_pj' ? 'PJ' : 'PF'}
                            </span>
                            {/* Badge para identificar origem */}
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              customer.criado_por_admin 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-cyan-100 text-cyan-700'
                            }`}>
                              {customer.criado_por_admin ? 'Admin' : 'Auto'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Criado em {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {customer.admin_name && (
                            <p className="text-xs text-slate-500">por {customer.admin_name}</p>
                          )}
                          {customer.orders_count > 0 && (
                            <p className="text-xs text-slate-500">
                              {customer.orders_count} pedidos • R$ {customer.total_spent.toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/customer/${customer.id}`)}
                            className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                            title="Ver detalhes completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Só pode editar clientes criados pelo admin */}
                          {customer.criado_por_admin && (
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="p-2 text-slate-600 hover:text-amber-600 transition-colors"
                              title="Editar cliente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleToggleStatus(customer.id, customer.is_active, customer.criado_por_admin)}
                            className={`p-2 transition-colors ${
                              customer.is_active 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={customer.is_active ? 'Desativar' : 'Ativar'}
                          >
                            <Toggle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {customer.observacao && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-800">
                          <strong>Observação:</strong> {customer.observacao}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Página {pagination.page} de {pagination.pages} ({pagination.total} clientes)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      <CustomerCreateModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        mode={modalMode}
        customer={selectedCustomer}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AdminCRMDashboard; 