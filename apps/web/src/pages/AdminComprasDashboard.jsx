import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Package, 
  Users, 
  DollarSign, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  Phone,
  Mail,
  MapPin,
  FileText,
  Activity,
  Star,
  Building,
  Clipboard
} from 'lucide-react';

import { supabase } from "@/lib/api"
import { useNotifications } from '../contexts/NotificationContext';
import { PieChartComponent, BarChartComponent } from '../components/AdvancedCharts';
import { StockReport } from '../components/PDFReports';

const AdminComprasDashboard = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de dados
  const [pedidosCompra, setPedidosCompra] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);
  const [cotacoes, setCotacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados de interface
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [fornecedorFilter, setFornecedorFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('30d');
  
  // Estados do modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  // Notificações
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Carregar dados iniciais
  useEffect(() => {
    loadPurchaseData();
  }, []);

  const loadPurchaseData = async () => {
    setLoading(true);
    try {
      // Carregar dados reais do Supabase
      const [
        purchasesResult,
        suppliersResult,
        productsResult,
        receiptsResult
      ] = await Promise.all([
        getPurchaseOrders(),
        getSuppliers(),
        getProducts(),
        getReceipts()
      ]);

      // Pedidos de Compra - APENAS DADOS REAIS
      if (purchasesResult.success) {
        setPedidosCompra(purchasesResult.data || []);
        console.log(`✅ ${purchasesResult.data?.length || 0} pedidos de compra carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela purchase_orders não encontrada ou vazia');
        setPedidosCompra([]);
      }

      // Fornecedores - APENAS DADOS REAIS
      if (suppliersResult.success) {
        setFornecedores(suppliersResult.data || []);
        console.log(`✅ ${suppliersResult.data?.length || 0} fornecedores carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela suppliers não encontrada ou vazia');
        setFornecedores([]);
      }

      // Para módulos ainda não implementados, deixar vazio até terem tabelas reais
      setRecebimentos([]);
      setCotacoes([]);
      setCategorias([]);

      setSuccess('Dados de compras carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados de compras:', error);
      
      // Em caso de erro, garantir arrays vazios
      setPedidosCompra([]);
      setFornecedores([]);
      setRecebimentos([]);
      setCotacoes([]);
      setCategorias([]);
      
      setError('Erro ao carregar dados de compras');
      notifyError('❌ Erro Compras', 'Erro ao carregar dados do módulo de compras');
    } finally {
      setLoading(false);
    }
  };

  // APIs do Supabase
  const getPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, suppliers(*)')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, data: [], error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  };

  const getSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

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

  const getReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_receipts')
        .select('*, purchase_orders(*)')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, data: [], error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  };

  // Funções CRUD para pedidos de compra
  const handleCreatePurchase = () => {
    setSelectedPurchase(null);
    setModalMode('create');
    setShowPurchaseModal(true);
  };

  const handleEditPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setModalMode('edit');
    setShowPurchaseModal(true);
  };

  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setModalMode('view');
    setShowPurchaseModal(true);
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido de compra?')) {
      try {
        const { error } = await supabase
          .from('purchase_orders')
          .update({ is_active: false })
          .eq('id', purchaseId);

        if (error) {
          notifyError('❌ Erro', error.message);
        } else {
          notifySuccess('✅ Pedido Excluído', 'Pedido de compra excluído com sucesso');
          loadPurchaseData();
        }
      } catch (error) {
        notifyError('❌ Erro', 'Erro ao excluir pedido de compra');
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
      case 'aprovado':
        return 'text-green-700 bg-green-100';
      case 'pendente':
        return 'text-yellow-700 bg-yellow-100';
      case 'cancelado':
        return 'text-red-700 bg-red-100';
      case 'recebido':
        return 'text-blue-700 bg-blue-100';
      case 'conferido':
        return 'text-green-700 bg-green-100';
      case 'parcial':
        return 'text-orange-700 bg-orange-100';
      case 'em_andamento':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Cálculos
  const totalPedidos = pedidosCompra.reduce((total, pedido) => total + pedido.valor_total, 0);
  const pedidosPendentes = pedidosCompra.filter(p => p.status === 'pendente').length;
  const pedidosAprovados = pedidosCompra.filter(p => p.status === 'aprovado').length;
  const totalFornecedores = fornecedores.length;

  // Componentes de renderização
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-700 text-sm font-medium">Total Compras</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{formatCurrency(totalPedidos)}</h3>
          <p className="text-blue-600 text-sm">Este mês</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 text-sm font-medium">Pedidos</span>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{pedidosCompra.length}</h3>
          <p className="text-green-600 text-sm">Total pedidos</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-700 text-sm font-medium">Pendentes</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-900 mb-1">{pedidosPendentes}</h3>
          <p className="text-orange-600 text-sm">Aguardando aprovação</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-purple-700 text-sm font-medium">Fornecedores</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-1">{totalFornecedores}</h3>
          <p className="text-purple-600 text-sm">Ativos</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Pedidos por Status</h3>
          <PieChartComponent
            data={[
              { name: 'Aprovados', value: pedidosCompra.filter(p => p.status === 'aprovado').length },
              { name: 'Pendentes', value: pedidosCompra.filter(p => p.status === 'pendente').length },
              { name: 'Recebidos', value: pedidosCompra.filter(p => p.status === 'recebido').length },
              { name: 'Cancelados', value: pedidosCompra.filter(p => p.status === 'cancelado').length }
            ]}
            height={250}
            showLabels={true}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Compras por Categoria</h3>
          <BarChartComponent
            data={categorias.map(cat => ({
              name: cat.nome,
              value: cat.valor_mes
            }))}
            height={250}
            bars={[
              { dataKey: 'value', name: 'Valor', color: '#3b82f6' }
            ]}
          />
        </div>
      </div>

      {/* Top Fornecedores */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Fornecedores do Mês</h3>
        <div className="space-y-4">
          {fornecedores
            .sort((a, b) => b.valor_comprado_mes - a.valor_comprado_mes)
            .slice(0, 5)
            .map((fornecedor, index) => (
              <div key={fornecedor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{fornecedor.nome}</p>
                    <p className="text-sm text-gray-600">{fornecedor.categoria} | {fornecedor.pedidos_mes} pedidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatCurrency(fornecedor.valor_comprado_mes)}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{fornecedor.avaliacao}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderPedidos = () => (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar pedidos..."
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
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="recebido">Recebidos</option>
            <option value="cancelado">Cancelados</option>
          </select>

          <select
            value={fornecedorFilter}
            onChange={(e) => setFornecedorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Fornecedores</option>
            {fornecedores.map(forn => (
              <option key={forn.id} value={forn.nome}>{forn.nome}</option>
            ))}
          </select>

          <button
            onClick={handleCreatePurchase}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Pedido
          </button>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Pedido</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Fornecedor</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-900">Valor</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Data Pedido</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Previsão</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidosCompra
                .filter(pedido => {
                  const matchSearch = pedido.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   pedido.fornecedor_nome.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchStatus = statusFilter === 'todos' || pedido.status === statusFilter;
                  const matchFornecedor = fornecedorFilter === 'todos' || pedido.fornecedor_nome === fornecedorFilter;
                  return matchSearch && matchStatus && matchFornecedor;
                })
                .map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{pedido.numero}</p>
                        <p className="text-sm text-gray-600">{pedido.condicoes_pagamento}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{pedido.fornecedor_nome}</p>
                        <p className="text-sm text-gray-600">{pedido.usuario_criacao}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(pedido.valor_total)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{formatDate(pedido.data_pedido)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{formatDate(pedido.data_previsao)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewPurchase(pedido)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPurchase(pedido)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(pedido.id)}
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

  const renderFornecedores = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Fornecedor
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fornecedores.map((fornecedor) => (
          <div key={fornecedor.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {fornecedor.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">{fornecedor.avaliacao}</span>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1">{fornecedor.nome}</h3>
            <p className="text-gray-600 text-sm mb-4">{fornecedor.categoria}</p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{fornecedor.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{fornecedor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{fornecedor.cidade}/{fornecedor.estado}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Entrega: {fornecedor.prazo_entrega_medio} dias</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(fornecedor.valor_comprado_mes)}</p>
                  <p className="text-xs text-gray-600">Comprado este mês</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{fornecedor.pedidos_mes}</p>
                  <p className="text-xs text-gray-600">Pedidos este mês</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Contatar
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
      <h2 className="text-2xl font-bold text-gray-900">Relatórios de Compras</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Relatório de Compras',
            description: 'Compras detalhadas por período',
            icon: ShoppingBag,
            color: 'blue'
          },
          {
            title: 'Performance de Fornecedores',
            description: 'Avaliação e ranking de fornecedores',
            icon: Users,
            color: 'green'
          },
          {
            title: 'Análise de Custos',
            description: 'Análise de custos e economias',
            icon: TrendingUp,
            color: 'purple'
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
                  purchases: pedidosCompra,
                  suppliers: fornecedores,
                  receipts: recebimentos,
                  totalPurchases: totalPedidos
                }}
                type="purchases"
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
          <p className="text-gray-600">Carregando dados de compras...</p>
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
            Módulo de Compras
          </h1>
          <p className="text-gray-600">
            Gestão completa de pedidos de compra, fornecedores e recebimentos
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
                { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
                { id: 'fornecedores', label: 'Fornecedores', icon: Users },
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
        {activeTab === 'pedidos' && renderPedidos()}
        {activeTab === 'fornecedores' && renderFornecedores()}
        {activeTab === 'relatorios' && renderRelatorios()}
      </div>
    </div>
  );
};

export default AdminComprasDashboard; 