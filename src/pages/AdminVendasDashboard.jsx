import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, TrendingUp, DollarSign, Users, Target, Calendar, 
  BarChart3, Filter, Download, Plus, Search, Eye, Edit, Trash2, Award, PieChart, AlertCircle, CheckCircle, Phone, Mail, MapPin, FileText, Activity, Star, TrendingDown
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../contexts/NotificationContext';
import { PieChartComponent, BarChartComponent } from '../components/AdvancedCharts';
import { StockReport } from '../components/PDFReports';

const AdminVendasDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de dados
  const [vendas, setVendas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [metas, setMetas] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Estados de interface
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [vendedorFilter, setVendedorFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('30d');
  
  // Estados do modal
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  // Notificações
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
  }, [user, hasPermission, navigate]);

  // Carregar dados iniciais
  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      // Carregar dados reais do Supabase
      const [
        salesResult,
        sellersResult,
        customersResult,
        productsResult
      ] = await Promise.all([
        getSales(),
        getSellers(),
        getCustomers(),
        getProducts()
      ]);

      // Vendas - APENAS DADOS REAIS
      if (salesResult.success) {
        setVendas(salesResult.data || []);
        console.log(`✅ ${salesResult.data?.length || 0} vendas carregadas do Supabase`);
      } else {
        console.log('⚠️ Tabela sales não encontrada ou vazia');
        setVendas([]);
      }

      // Vendedores - APENAS DADOS REAIS
      if (sellersResult.success) {
        setVendedores(sellersResult.data || []);
        console.log(`✅ ${sellersResult.data?.length || 0} vendedores carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela sellers não encontrada ou vazia');
        setVendedores([]);
      }

      // Para módulos ainda não implementados, deixar vazio até terem tabelas reais
      setMetas([]);
      setComissoes([]);
      setProdutos([]);
      setClientes([]);

      setSuccess('Dados de vendas carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados de vendas:', error);
      
      // Em caso de erro, garantir arrays vazios
      setVendas([]);
      setVendedores([]);
      setMetas([]);
      setComissoes([]);
      setProdutos([]);
      setClientes([]);
      
      setError('Erro ao carregar dados de vendas');
      notifyError('❌ Erro Vendas', 'Erro ao carregar dados do módulo de vendas');
    } finally {
      setLoading(false);
    }
  };

  // APIs do Supabase
  const getSales = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*), users(*)')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, data: [], error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  };

  const getSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'vendedor')
        .eq('is_active', true);

      if (error) {
        return { success: false, data: [], error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  };

  const getCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true);

      if (error) {
        return { success: false, data: [], error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  };

  const getProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error) {
        return { success: false, data: [], error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  };

  // Funções CRUD para vendas
  const handleCreateSale = () => {
    setSelectedSale(null);
    setModalMode('create');
    setShowSaleModal(true);
  };

  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setModalMode('edit');
    setShowSaleModal(true);
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setModalMode('view');
    setShowSaleModal(true);
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ is_active: false })
          .eq('id', saleId);

        if (error) {
          notifyError('❌ Erro', error.message);
        } else {
          notifySuccess('✅ Venda Excluída', 'Venda excluída com sucesso');
          loadSalesData();
        }
      } catch (error) {
        notifyError('❌ Erro', 'Erro ao excluir venda');
      }
    }
  };

  // Utilitários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finalizada':
        return 'text-green-700 bg-green-100';
      case 'pendente':
        return 'text-yellow-700 bg-yellow-100';
      case 'cancelada':
        return 'text-red-700 bg-red-100';
      case 'em_processamento':
        return 'text-blue-700 bg-blue-100';
      case 'a_pagar':
        return 'text-orange-700 bg-orange-100';
      case 'pago':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Cálculos
  const totalVendas = vendas.reduce((total, venda) => total + venda.valor_total, 0);
  const vendasFinalizadas = vendas.filter(v => v.status === 'finalizada');
  const ticketMedio = vendasFinalizadas.length > 0 ? 
    vendasFinalizadas.reduce((total, v) => total + v.valor_total, 0) / vendasFinalizadas.length : 0;
  const totalComissoes = comissoes.reduce((total, com) => total + com.total_receber, 0);

  // Componentes de renderização
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 text-sm font-medium">Faturamento</span>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{formatCurrency(totalVendas)}</h3>
          <p className="text-green-600 text-sm">Total vendas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-700 text-sm font-medium">Vendas</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{vendas.length}</h3>
          <p className="text-blue-600 text-sm">Total pedidos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-purple-700 text-sm font-medium">Ticket Médio</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-1">{formatCurrency(ticketMedio)}</h3>
          <p className="text-purple-600 text-sm">Por venda</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-700 text-sm font-medium">Comissões</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-900 mb-1">{formatCurrency(totalComissoes)}</h3>
          <p className="text-orange-600 text-sm">A pagar</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🛒 Vendas por Status</h3>
          <PieChartComponent
            data={[
              { name: 'Finalizadas', value: vendas.filter(v => v.status === 'finalizada').length },
              { name: 'Pendentes', value: vendas.filter(v => v.status === 'pendente').length },
              { name: 'Canceladas', value: vendas.filter(v => v.status === 'cancelada').length }
            ]}
            height={250}
            showLabels={true}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Vendas por Vendedor</h3>
          <BarChartComponent
            data={vendedores.map(vend => ({
              name: vend.nome.split(' ')[0],
              value: vend.vendas_mes
            }))}
            height={250}
            bars={[
              { dataKey: 'value', name: 'Vendas', color: '#3b82f6' }
            ]}
          />
        </div>
      </div>

      {/* Metas dos Vendedores */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Metas dos Vendedores</h3>
        <div className="space-y-4">
          {metas.map((meta, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{meta.vendedor}</span>
                  <span className={`text-sm font-semibold ${meta.percentual >= 100 ? 'text-green-600' : meta.percentual >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {meta.percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      meta.percentual >= 100 ? 'bg-green-500' : 
                      meta.percentual >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(meta.percentual, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Realizado: {formatCurrency(meta.realizado)}</span>
                  <span>Meta: {formatCurrency(meta.meta)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVendas = () => (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Status</option>
            <option value="finalizada">Finalizadas</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <select
            value={vendedorFilter}
            onChange={(e) => setVendedorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Vendedores</option>
            {vendedores.map(vend => (
              <option key={vend.id} value={vend.nome}>{vend.nome}</option>
            ))}
          </select>

          <button
            onClick={handleCreateSale}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Venda</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Cliente</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Vendedor</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-900">Valor</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Data</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendas
                .filter(venda => {
                  const matchSearch = venda.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   venda.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchStatus = statusFilter === 'todos' || venda.status === statusFilter;
                  const matchVendedor = vendedorFilter === 'todos' || venda.vendedor === vendedorFilter;
                  return matchSearch && matchStatus && matchVendedor;
                })
                .map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{venda.numero}</p>
                        <p className="text-sm text-gray-600">{venda.forma_pagamento}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{venda.cliente_nome}</p>
                        <p className="text-sm text-gray-600">{venda.cliente_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{venda.vendedor}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(venda.valor_total)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{formatDate(venda.data_venda)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(venda.status)}`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewSale(venda)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSale(venda)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(venda.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVendedores = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestão de Vendedores</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendedores.map((vendedor) => (
          <div key={vendedor.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {vendedor.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendedor.status)}`}>
                {vendedor.status}
              </span>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1">{vendedor.nome}</h3>
            <p className="text-gray-600 text-sm mb-4">Comissão: {vendedor.percentual_comissao}%</p>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Meta Mensal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(vendedor.meta_mensal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendido:</span>
                <span className="font-semibold text-green-600">{formatCurrency(vendedor.vendas_mes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Comissão:</span>
                <span className="font-semibold text-purple-600">{formatCurrency(vendedor.comissao_acumulada)}</span>
              </div>
            </div>

            {/* Progresso da meta */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso da Meta</span>
                <span>{((vendedor.vendas_mes / vendedor.meta_mensal) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((vendedor.vendas_mes / vendedor.meta_mensal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Ver Vendas
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRelatorios = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Relatórios de Vendas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Relatório de Vendas',
            description: 'Vendas detalhadas por período',
            icon: TrendingUp,
            color: 'green'
          },
          {
            title: 'Comissões',
            description: 'Comissões dos vendedores',
            icon: Award,
            color: 'purple'
          },
          {
            title: 'Performance de Vendedores',
            description: 'Análise de performance da equipe',
            icon: Target,
            color: 'blue'
          }
        ].map((relatorio, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${relatorio.color}-500 rounded-xl flex items-center justify-center`}>
                <relatorio.icon className="w-6 h-6 text-white" />
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{relatorio.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{relatorio.description}</p>
            <div className="flex items-center space-x-2">
              <StockReport 
                data={{
                  sales: vendas,
                  sellers: vendedores,
                  totalSales: totalVendas,
                  averageTicket: ticketMedio,
                  commissions: comissoes
                }}
                type="sales"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Módulo de Vendas
          </h1>
          <p className="text-gray-600">
            Gestão completa de vendas, vendedores e comissões
          </p>
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

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
                { id: 'vendedores', label: 'Vendedores', icon: Users },
                { id: 'relatorios', label: 'Relatórios', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'vendas' && renderVendas()}
        {activeTab === 'vendedores' && renderVendedores()}
        {activeTab === 'relatorios' && renderRelatorios()}
      </div>
    </div>
  );
};

export default AdminVendasDashboard; 