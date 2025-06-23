import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, CreditCard, Star,
  Package, DollarSign, TrendingUp, Activity, MessageCircle, Bell,
  Settings, Shield, Eye, EyeOff, Lock, Plus, Edit, Save, X,
  Building, FileText, Clock, AlertTriangle, CheckCircle, Target,
  BarChart3, PieChart, Users, Coffee, Award, Tag, Heart, Gift
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { getCustomerDetails, updateCustomerNotes, resetCustomerPassword, addCustomerInteraction, addCustomerTask, updateTaskStatus } from '../lib/supabase-admin-api';

const CustomerDetailView = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useSupabaseAuth();
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newInteraction, setNewInteraction] = useState({ type: 'call', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/admin/crm');
      return;
    }
    if (customerId) {
      loadCustomerDetails();
    }
  }, [customerId, user, hasPermission, navigate]);

  const loadCustomerDetails = async () => {
    setLoading(true);
    try {
      const result = await getCustomerDetails(customerId);
      if (result.success) {
        setCustomer(result.customer);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao carregar detalhes do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    try {
      const result = await updateCustomerNotes(customerId, newNote);
      if (result.success) {
        setNewNote('');
        loadCustomerDetails();
        setSuccess('Nota adicionada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao salvar nota');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.description.trim()) return;
    
    setSaving(true);
    try {
      const result = await addCustomerInteraction(customerId, newInteraction);
      if (result.success) {
        setNewInteraction({ type: 'call', description: '' });
        loadCustomerDetails();
        setSuccess('Interação registrada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao registrar interação');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (passwordResetData.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      const result = await resetCustomerPassword(customerId, passwordResetData.newPassword);
      if (result.success) {
        setShowPasswordReset(false);
        setPasswordResetData({ newPassword: '', confirmPassword: '' });
        setSuccess('Senha alterada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    setSaving(true);
    try {
      const result = await addCustomerTask(customerId, newTask);
      if (result.success) {
        setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
        loadCustomerDetails();
        setSuccess('Tarefa criada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao criar tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    setSaving(true);
    try {
      const result = await updateTaskStatus(taskId, status);
      if (result.success) {
        loadCustomerDetails();
        setSuccess('Status da tarefa atualizado com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao atualizar status da tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    setSaving(true);
    try {
      // Como não temos uma função deleteTask, vamos marcar como cancelada
      const result = await updateTaskStatus(taskId, 'cancelled');
      if (result.success) {
        loadCustomerDetails();
        setSuccess('Tarefa removida com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao remover tarefa');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando detalhes do cliente...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cliente não encontrado</h2>
          <p className="text-slate-600 mb-6">O cliente que você está procurando não existe.</p>
          <button
            onClick={() => navigate('/admin/crm')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar ao CRM
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'interactions', label: 'Interações', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tasks', label: 'Tarefas', icon: CheckCircle },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/crm')}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Detalhes do Cliente</h1>
              <p className="text-slate-600">Visualização completa e gerenciamento avançado</p>
            </div>
          </div>

          {/* Mensagens */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Customer Header Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  {customer.user_type === 'cliente_pj' ? (
                    <Building className="text-white w-10 h-10" />
                  ) : (
                    <User className="text-white w-10 h-10" />
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-1">{customer.name}</h2>
                  <p className="opacity-90 mb-2">{customer.email}</p>
                  <div className="flex items-center gap-4 text-sm opacity-80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Cliente desde {new Date(customer.created_at).toLocaleDateString('pt-BR')}
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
              
              <div className="text-right text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{customer.orders_count || 0}</p>
                    <p className="text-sm opacity-80">Pedidos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">R$ {(customer.total_spent || 0).toFixed(0)}</p>
                    <p className="text-sm opacity-80">Total Gasto</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{customer.points || 0}</p>
                    <p className="text-sm opacity-80">Pontos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{customer.level || 'Bronze'}</p>
                    <p className="text-sm opacity-80">Nível</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  customer.is_active 
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {customer.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  customer.user_type === 'cliente_pj' 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {customer.user_type === 'cliente_pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  customer.criado_por_admin 
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-cyan-100 text-cyan-700'
                }`}>
                  {customer.criado_por_admin ? 'Criado pelo Admin' : 'Auto-cadastro'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Última atividade:</span>
                <span className="text-sm font-medium text-slate-900">
                  {customer.last_login ? new Date(customer.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8 overflow-x-auto">
              {tabs.map(tab => (
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
                {/* Personal Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Informações Pessoais</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600">Email</p>
                          <p className="font-medium text-slate-900">{customer.email}</p>
                        </div>
                      </div>
                      
                      {customer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Telefone</p>
                            <p className="font-medium text-slate-900">{customer.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {customer.cpf_cnpj && (
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">
                              {customer.user_type === 'cliente_pj' ? 'CNPJ' : 'CPF'}
                            </p>
                            <p className="font-medium text-slate-900">{customer.cpf_cnpj}</p>
                          </div>
                        </div>
                      )}
                      
                      {customer.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                          <div>
                            <p className="text-sm text-slate-600">Endereço</p>
                            <p className="font-medium text-slate-900">
                              {customer.address}
                              {customer.city && `, ${customer.city}`}
                              {customer.state && ` - ${customer.state}`}
                              {customer.zip_code && ` - ${customer.zip_code}`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {customer.company_name && (
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Empresa</p>
                            <p className="font-medium text-slate-900">{customer.company_name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Resumo de Atividade</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">Pedidos</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{customer.orders_count || 0}</p>
                        <p className="text-xs text-green-600">Total de pedidos</p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-blue-700">Faturamento</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">R$ {(customer.total_spent || 0).toFixed(0)}</p>
                        <p className="text-xs text-blue-600">Valor total gasto</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Star className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-purple-700">Pontos</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{customer.points || 0}</p>
                        <p className="text-xs text-purple-600">Pontos acumulados</p>
                      </div>
                      
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          <span className="text-sm text-amber-700">Nível</span>
                        </div>
                        <p className="text-lg font-bold text-amber-700">{customer.level || 'Bronze'}</p>
                        <p className="text-xs text-amber-600">Nível atual</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Notas e Observações</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Adicionar nova nota sobre o cliente..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleSaveNote}
                          disabled={!newNote.trim() || saving}
                          className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Salvar Nota
                        </button>
                      </div>
                    </div>
                    
                    {customer.notes && customer.notes.length > 0 && (
                      <div className="space-y-3">
                        {customer.notes.map((note, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-slate-700 mb-2">{note.content}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Por {note.admin_name}</span>
                              <span>{new Date(note.created_at).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Histórico de Pedidos</h3>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Package className="w-5 h-5" />
                    <span>{customer.orders?.length || 0} pedidos</span>
                  </div>
                </div>
                
                {customer.orders && customer.orders.length > 0 ? (
                  <div className="space-y-4">
                    {customer.orders.map(order => (
                      <div key={order.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900">Pedido #{order.id}</h4>
                            <p className="text-sm text-slate-600">
                              {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-600">R$ {order.total_amount.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status === 'delivered' ? 'Entregue' :
                               order.status === 'processing' ? 'Processando' :
                               order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                        
                        {order.items && (
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.product_name}</span>
                                <span>R$ {item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Nenhum pedido encontrado</h4>
                    <p className="text-slate-500">Este cliente ainda não fez nenhum pedido.</p>
                  </div>
                )}
              </div>
            )}

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Histórico de Interações</h3>
                </div>
                
                {/* Add New Interaction */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Registrar Nova Interação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      value={newInteraction.type}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="call">Ligação</option>
                      <option value="email">Email</option>
                      <option value="meeting">Reunião</option>
                      <option value="support">Suporte</option>
                      <option value="other">Outro</option>
                    </select>
                    
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={newInteraction.description}
                        onChange={(e) => setNewInteraction(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição da interação..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleAddInteraction}
                      disabled={!newInteraction.description.trim() || saving}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Registrar
                    </button>
                  </div>
                </div>
                
                {customer.interactions && customer.interactions.length > 0 ? (
                  <div className="space-y-4">
                    {customer.interactions.map((interaction, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              interaction.type === 'call' ? 'bg-blue-100 text-blue-700' :
                              interaction.type === 'email' ? 'bg-green-100 text-green-700' :
                              interaction.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {interaction.type === 'call' ? 'Ligação' :
                               interaction.type === 'email' ? 'Email' :
                               interaction.type === 'meeting' ? 'Reunião' :
                               interaction.type === 'support' ? 'Suporte' : 'Outro'}
                            </span>
                            <span className="text-sm text-slate-600">
                              {new Date(interaction.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">Por {interaction.admin_name}</span>
                        </div>
                        <p className="text-slate-700">{interaction.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma interação registrada</h4>
                    <p className="text-slate-500">Registre a primeira interação com este cliente.</p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Analytics do Cliente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Customer Value */}
                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-slate-900">Valor do Cliente</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Lifetime Value</p>
                        <p className="text-2xl font-bold text-green-700">R$ {(customer.total_spent || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Ticket Médio</p>
                        <p className="text-lg font-semibold text-green-700">
                          R$ {customer.orders_count > 0 ? ((customer.total_spent || 0) / customer.orders_count).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-slate-900">Engajamento</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Frequência de Compra</p>
                        <p className="text-lg font-semibold text-blue-700">
                          {customer.orders_count > 0 ? 'Regular' : 'Novo'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Última Compra</p>
                        <p className="text-sm text-blue-700">
                          {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('pt-BR') : 'Nunca'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gamification */}
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold text-slate-900">Gamificação</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Nível Atual</p>
                        <p className="text-lg font-semibold text-purple-700">{customer.level || 'Bronze'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Pontos</p>
                        <p className="text-lg font-semibold text-purple-700">{customer.points || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Tarefas do Cliente</h3>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{customer.tasks?.filter(t => t.status === 'pending').length || 0} pendentes</span>
                  </div>
                </div>
                
                {/* Add New Task */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Nova Tarefa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título da tarefa..."
                      className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    />
                    
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="low">Baixa Prioridade</option>
                      <option value="medium">Média Prioridade</option>
                      <option value="high">Alta Prioridade</option>
                      <option value="urgent">Urgente</option>
                    </select>
                    
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    />
                    
                    <button
                      onClick={handleAddTask}
                      disabled={!newTask.title.trim() || saving}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Tarefa
                    </button>
                  </div>
                  
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada da tarefa..."
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
                
                {/* Tasks List */}
                {customer.tasks && customer.tasks.length > 0 ? (
                  <div className="space-y-4">
                    {customer.tasks.map((task, index) => (
                      <div key={index} className={`bg-white rounded-xl p-4 border-2 transition-all ${
                        task.status === 'completed' ? 'border-green-200 bg-green-50' :
                        task.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                        task.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                        task.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                        'border-slate-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className={`font-semibold ${
                                task.status === 'completed' ? 'text-green-700 line-through' : 'text-slate-900'
                              }`}>
                                {task.title}
                              </h5>
                              
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority === 'urgent' ? 'Urgente' :
                                 task.priority === 'high' ? 'Alta' :
                                 task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                              
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                task.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.status === 'completed' ? 'Concluída' :
                                 task.status === 'in_progress' ? 'Em Andamento' :
                                 task.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className="text-slate-600 text-sm mb-2">{task.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Criada por {task.admin_name} em {new Date(task.created_at).toLocaleDateString('pt-BR')}</span>
                              {task.due_date && (
                                <span className={`${
                                  new Date(task.due_date) < new Date() && task.status !== 'completed' 
                                    ? 'text-red-600 font-medium' 
                                    : 'text-slate-500'
                                }`}>
                                  Vence em {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {task.status !== 'completed' && (
                              <>
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Marcar como em andamento"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                  title="Marcar como concluída"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Excluir tarefa"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {task.status === 'completed' && task.completed_at && (
                          <div className="text-xs text-green-600 bg-green-100 rounded-lg p-2">
                            ✅ Concluída em {new Date(task.completed_at).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma tarefa criada</h4>
                    <p className="text-slate-500">Crie a primeira tarefa para este cliente.</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Configurações do Cliente</h3>
                
                <div className="space-y-8">
                  {/* Password Reset */}
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Gerenciar Senha</h4>
                        <p className="text-sm text-slate-600">Altere a senha do cliente caso necessário</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordReset(!showPasswordReset)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Alterar Senha
                      </button>
                    </div>
                    
                    {showPasswordReset && (
                      <div className="bg-white rounded-xl p-4 border border-red-200 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Nova Senha</label>
                          <input
                            type="password"
                            value={passwordResetData.newPassword}
                            onChange={(e) => setPasswordResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                            placeholder="Digite a nova senha..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Senha</label>
                          <input
                            type="password"
                            value={passwordResetData.confirmPassword}
                            onChange={(e) => setPasswordResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                            placeholder="Confirme a nova senha..."
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleResetPassword}
                            disabled={!passwordResetData.newPassword || !passwordResetData.confirmPassword || saving}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            {saving ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                            Alterar Senha
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordReset(false);
                              setPasswordResetData({ newPassword: '', confirmPassword: '' });
                            }}
                            className="text-slate-600 hover:text-slate-800 px-4 py-2"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Status */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4">Status da Conta</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Conta Ativa</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          customer.is_active 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {customer.is_active ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Email Verificado</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          Sim
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Criado por Admin</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          customer.criado_por_admin 
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {customer.criado_por_admin ? 'Sim' : 'Não'}
                        </span>
                      </div>
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

export default CustomerDetailView; 