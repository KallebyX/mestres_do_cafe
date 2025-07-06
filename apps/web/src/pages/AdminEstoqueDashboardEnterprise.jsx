import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Download, Eye, Edit, Trash2,
  MapPin, Scan, Hash, AlertTriangle, CheckCircle, Clock, 
  BarChart3, TrendingUp, TrendingDown, Truck, Building2,
  Calendar, FileText, Settings, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { PieChartComponent, BarChartComponent } from '../components/AdvancedCharts';
import { StockReport } from '../components/PDFReports';
import ProductLocationModal from '../components/ProductLocationModal';
import BarcodeScanner from '../components/BarcodeScanner';
import BatchControlModal from '../components/BatchControlModal';
import { stockAPI } from "../lib/api"

const AdminEstoqueDashboardEnterprise = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [warehouseFilter, setWarehouseFilter] = useState('todos');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para dados
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [inventarios, setInventarios] = useState([]);

  // Estados dos modais
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scannerMode, setScannerMode] = useState('scan');

  const { user, hasPermission } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadStockData();
  }, [user, hasPermission, navigate]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      // Carregar dados reais do Supabase usando as APIs do stockAPI
      const [
        productsResult,
        warehousesResult,
        movementsResult,
        categoriesResult
      ] = await Promise.all([
        stockAPI.getProducts(),
        stockAPI.getWarehouses(),
        stockAPI.getStockMovements(),
        stockAPI.getProductCategories()
      ]);

      // Produtos - APENAS DADOS REAIS
      if (productsResult.success) {
        setProdutos(productsResult.data?.map(product => ({
          id: product.id,
          nome: product.name,
          sku: product.sku || `SKU-${product.id}`,
          codigo_barras: product.barcode || `789${product.id.toString().padStart(10, '0')}`,
          categoria: product.category?.name || 'Geral',
          estoque_atual: product.current_stock || product.stock || 0,
          estoque_minimo: product.min_stock || 50,
          estoque_maximo: product.max_stock || 1000,
          custo_unitario: product.cost_price || 0,
          preco_venda: product.sale_price || product.price || 0,
          status: (product.current_stock || 0) > (product.min_stock || 50) ? 'normal' : 'baixo',
          fornecedor: product.supplier?.name || 'A definir',
          localizacoes: product.locations || [],
          lotes: product.batches || [],
          ultima_movimentacao: product.updated_at || product.created_at
        })) || []);
        console.log(`✅ ${productsResult.data?.length || 0} produtos enterprise carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela products não encontrada ou vazia');
        setProdutos([]);
      }

      // Depósitos - APENAS DADOS REAIS
      if (warehousesResult.success) {
        setDepositos(warehousesResult.data?.map(warehouse => ({
          id: warehouse.id,
          nome: warehouse.name,
          codigo: warehouse.code || `DEP${warehouse.id}`,
          endereco: warehouse.address || 'Endereço não informado',
          capacidade: warehouse.capacity || 10000,
          ocupacao: warehouse.current_occupation || 0,
          responsavel: warehouse.manager || 'A definir',
          status: warehouse.is_active ? 'ativo' : 'inativo'
        })) || []);
        console.log(`✅ ${warehousesResult.data?.length || 0} depósitos enterprise carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela warehouses não encontrada ou vazia');
        setDepositos([]);
      }

      // Para módulos ainda não implementados, deixar vazios até terem tabelas reais
      setAlertas([]);

      setSuccess('Dados enterprise carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados enterprise:', error);
      
      // Em caso de erro, garantir arrays vazios
      setProdutos([]);
      setDepositos([]);
      setAlertas([]);
      
      setError('Erro ao carregar dados enterprise');
      notifyError('❌ Erro Enterprise', 'Erro ao carregar dados do estoque enterprise');
    } finally {
      setLoading(false);
    }
  };

  // Funções dos modais
  const handleOpenLocationModal = (product) => {
    setSelectedProduct(product);
    setShowLocationModal(true);
  };

  const handleOpenBarcodeScanner = (mode = 'scan') => {
    setScannerMode(mode);
    setShowBarcodeScanner(true);
  };

  const handleOpenBatchModal = (product) => {
    setSelectedProduct(product);
    setShowBatchModal(true);
  };

  const handleBarcodeScanned = (product) => {
    notifySuccess('✅ Produto Escaneado', `${product.name} encontrado`);
    // Aqui poderia abrir modal de movimentação ou outro processo
  };

  // Cálculos do dashboard
  const totalProdutos = produtos.length;
  const produtosBaixoEstoque = produtos.filter(p => p.status === 'baixo').length;
  const valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.estoque_atual * p.custo_unitario), 0);
  const alertasAtivos = alertas.length;

  // Formatação
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-700 bg-green-100';
      case 'baixo':
        return 'text-red-700 bg-red-100';
      case 'alto':
        return 'text-blue-700 bg-blue-100';
      case 'critico':
        return 'text-orange-700 bg-orange-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'text-red-700 bg-red-100';
      case 'media':
        return 'text-yellow-700 bg-yellow-100';
      case 'baixa':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Renderização das abas
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-700 text-sm font-medium">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{totalProdutos}</h3>
          <p className="text-blue-600 text-sm">Produtos cadastrados</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-700 text-sm font-medium">Crítico</span>
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-1">{produtosBaixoEstoque}</h3>
          <p className="text-red-600 text-sm">Estoque baixo</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 text-sm font-medium">Valor</span>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{formatCurrency(valorTotalEstoque)}</h3>
          <p className="text-green-600 text-sm">Valor em estoque</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-700 text-sm font-medium">Alertas</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-900 mb-1">{alertasAtivos}</h3>
          <p className="text-orange-600 text-sm">Alertas ativos</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleOpenBarcodeScanner('scan')}
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-3"
          >
            <Scan className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-blue-900">Scanner</p>
              <p className="text-sm text-blue-600">Ler código de barras</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenBarcodeScanner('generate')}
            className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors flex items-center gap-3"
          >
            <Hash className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-green-900">Gerar Código</p>
              <p className="text-sm text-green-600">Novo código de barras</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-3"
          >
            <FileText className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-semibold text-purple-900">Inventário</p>
              <p className="text-sm text-purple-600">Contagem cíclica</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('movimentacoes')}
            className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors flex items-center gap-3"
          >
            <Truck className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold text-orange-900">Movimentação</p>
              <p className="text-sm text-orange-600">Nova entrada/saída</p>
            </div>
          </button>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Produtos por Status</h3>
          <PieChartComponent
            data={[
              { name: 'Normal', value: produtos.filter(p => p.status === 'normal').length },
              { name: 'Estoque Baixo', value: produtos.filter(p => p.status === 'baixo').length },
              { name: 'Estoque Alto', value: produtos.filter(p => p.status === 'alto').length }
            ]}
            height={250}
            showLabels={true}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Valor por Categoria</h3>
          <BarChartComponent
            data={[
              { name: 'Cafés Especiais', value: 450000 },
              { name: 'Cafés Premium', value: 380000 },
              { name: 'Acessórios', value: 120000 }
            ]}
            height={250}
            bars={[
              { dataKey: 'value', name: 'Valor', color: '#3b82f6' }
            ]}
          />
        </div>
      </div>

      {/* Alertas Recentes */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Alertas de Estoque</h3>
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <div key={alerta.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">{alerta.produto}</p>
                  <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(alerta.prioridade)}`}>
                  {alerta.prioridade}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(alerta.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProdutos = () => (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar produtos, SKU ou código de barras..."
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
            <option value="normal">Normal</option>
            <option value="baixo">Estoque Baixo</option>
            <option value="alto">Estoque Alto</option>
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Depósitos</option>
            {depositos.map(dep => (
              <option key={dep.id} value={dep.nome}>{dep.nome}</option>
            ))}
          </select>

          <button
            onClick={() => handleOpenBarcodeScanner('scan')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Scan className="w-4 h-4" />
            Scanner
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Produto</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Códigos</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Estoque</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Localizações</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Lotes</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {produtos
                .filter(produto => {
                  const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   produto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   produto.codigo_barras.includes(searchTerm);
                  const matchStatus = statusFilter === 'todos' || produto.status === statusFilter;
                  return matchSearch && matchStatus;
                })
                .map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{produto.nome}</p>
                        <p className="text-sm text-gray-600">{produto.categoria}</p>
                        <p className="text-sm text-gray-600">{produto.fornecedor}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">SKU:</span>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{produto.sku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Barras:</span>
                          <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">{produto.codigo_barras}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className="font-bold text-gray-900 text-lg">{produto.estoque_atual}</span>
                        <div className="text-xs text-gray-500">
                          Min: {produto.estoque_minimo} | Max: {produto.estoque_maximo}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${produto.status === 'baixo' ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min((produto.estoque_atual / produto.estoque_maximo) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {produto.localizacoes.map((loc, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="font-mono font-semibold text-blue-600">{loc.posicao}</span>
                            <span className="text-gray-600">({loc.quantidade})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {produto.lotes.map((lote, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex items-center gap-2">
                              <Hash className="w-3 h-3 text-gray-400" />
                              <span className="font-mono font-semibold text-purple-600">{lote.numero}</span>
                            </div>
                            <div className="text-xs text-gray-500 ml-5">
                              Val: {new Date(lote.validade).toLocaleDateString('pt-BR')} ({lote.quantidade})
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(produto.status)}`}>
                        {produto.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenLocationModal(produto)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Gerenciar Localizações"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenBatchModal(produto)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Gerenciar Lotes"
                        >
                          <Hash className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar Produto"
                        >
                          <Edit className="w-4 h-4" />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema de estoque enterprise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📦 Estoque Enterprise
              </h1>
              <p className="text-gray-600">
                Gestão completa com localização física, lotes e código de barras
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadStockData}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
              <StockReport 
                data={{
                  products: produtos,
                  warehouses: depositos,
                  totalValue: valorTotalEstoque,
                  lowStockCount: produtosBaixoEstoque
                }}
                type="stock"
              />
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
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
                { id: 'produtos', label: 'Produtos', icon: Package },
                { id: 'movimentacoes', label: 'Movimentações', icon: Truck },
                { id: 'inventario', label: 'Inventário', icon: FileText },
                { id: 'depositos', label: 'Depósitos', icon: Building2 }
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
        {activeTab === 'produtos' && renderProdutos()}
        {activeTab === 'movimentacoes' && (
          <div className="text-center py-8">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Módulo de movimentações em desenvolvimento...</p>
          </div>
        )}
        {activeTab === 'inventario' && (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Módulo de inventário em desenvolvimento...</p>
          </div>
        )}
        {activeTab === 'depositos' && (
          <div className="text-center py-8">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Módulo de depósitos em desenvolvimento...</p>
          </div>
        )}

        {/* Modais */}
        <ProductLocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          product={selectedProduct}
          onSuccess={(locations) => {
            notifySuccess('✅ Localizações Atualizadas', 'Localizações salvas com sucesso');
            setShowLocationModal(false);
          }}
        />

        <BarcodeScanner
          isOpen={showBarcodeScanner}
          onClose={() => setShowBarcodeScanner(false)}
          mode={scannerMode}
          onBarcodeScanned={handleBarcodeScanned}
        />

        <BatchControlModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          product={selectedProduct}
          onSuccess={(batches) => {
            notifySuccess('✅ Lotes Atualizados', 'Lotes salvos com sucesso');
            setShowBatchModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default AdminEstoqueDashboardEnterprise; 