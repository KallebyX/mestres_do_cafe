import React, { useState, useEffect } from 'react';
// import { _Package, _Truck, _Warehouse, _BarChart3, _ArrowUpCircle, _ArrowDownCircle, _AlertTriangle, _CheckCircle, _Clock, _Edit, _Trash2, _Plus, _Search, _Eye, _MapPin, _Calendar, _Filter, _Download, _ShoppingCart, _Box, _Activity, _TrendingUp, _Target, _AlertCircle, _Zap, _Users, _DollarSign } from 'lucide-react'; // Temporarily commented - unused import
import { _useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { _useNavigate } from 'react-router-dom';
import { _stockAPI } from '../lib/supabase-erp-api';
import { _useNotifications } from '../contexts/NotificationContext';
import ProductStockModal from '../components/ProductStockModal';
import { _LineChartComponent, _BarChartComponent, _PieChartComponent } from '../components/AdvancedCharts';
import { _StockReport } from '../components/PDFReports';

const _AdminEstoqueDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('30d');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para diferentes módulos
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [depositos, setDepositos] = useState([]);

  // Estados para modais
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const { user, hasPermission } = useSupabaseAuth();
  const { notifySuccess, notifyError } = useNotifications();
  const _navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadStockData();
  }, [user, hasPermission, navigate]);

  const _loadStockData = async () => {
    setLoading(true);
    try {
      // Carregar dados reais do Supabase
      const [
        productsResult,
        suppliersResult,
        categoriesResult,
        warehousesResult,
        movementsResult
      ] = await Promise.all([
        stockAPI.getProducts(),
        stockAPI.getSuppliers(),
        stockAPI.getProductCategories(),
        stockAPI.getWarehouses(),
        stockAPI.getStockMovements()
      ]);

      // Produtos
      if (productsResult.success && productsResult.data.length > 0) {
        setProdutos(productsResult.data.map(product => ({
          id: product.id,
          nome: product.name,
          sku: product.sku,
          categoria: product.category?.name || 'Sem categoria',
          estoque_atual: product.current_stock,
          estoque_minimo: product.min_stock,
          estoque_maximo: product.max_stock,
          custo_unitario: product.cost_price,
          preco_venda: product.sale_price,
          localizacao: 'A1-01', // TODO: implementar localização
          status: product.current_stock <= product.min_stock ? 'baixo' : 'normal',
          fornecedor: product.supplier?.name || 'Sem fornecedor',
          ultima_movimentacao: product.updated_at
        })));
      } else {
        console.log('⚠️ Tabela products não encontrada ou vazia');
        setProdutos([]);
      }

      // Fornecedores - APENAS DADOS REAIS
      if (suppliersResult.success) {
        setFornecedores(suppliersResult.data || []);
        console.log(`✅ ${suppliersResult.data?.length || 0} fornecedores carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela suppliers não encontrada ou vazia');
        setFornecedores([]);
      }

      // Categorias - APENAS DADOS REAIS
      if (categoriesResult.success) {
        setCategorias(categoriesResult.data || []);
        console.log(`✅ ${categoriesResult.data?.length || 0} categorias carregadas do Supabase`);
      } else {
        console.log('⚠️ Tabela product_categories não encontrada ou vazia');
        setCategorias([]);
      }

      // Depósitos - APENAS DADOS REAIS
      if (warehousesResult.success) {
        setDepositos(warehousesResult.data || []);
        console.log(`✅ ${warehousesResult.data?.length || 0} depósitos carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela warehouses não encontrada ou vazia');
        setDepositos([]);
      }

      // Movimentações - APENAS DADOS REAIS
      if (movementsResult.success && movementsResult.data && movementsResult.data.length > 0) {
        setMovimentacoes(movementsResult.data.map(movement => ({
          id: movement.id,
          produto: movement.product?.name || 'Produto não encontrado',
          tipo: movement.movement_type,
          quantidade: movement.quantity,
          motivo: movement.reason || 'Não informado',
          documento: movement.document_number || '-',
          data: movement.created_at,
          usuario: movement.user?.name || 'Sistema',
          custo_total: movement.total_cost || 0
        })));
        console.log(`✅ ${movementsResult.data.length} movimentações carregadas do Supabase`);
      } else {
        console.log('⚠️ Tabela stock_movements não encontrada ou vazia');
        setMovimentacoes([]);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de estoque:', error);
      setError('Erro ao carregar dados de estoque');
      notifyError('❌ Erro', 'Erro ao carregar dados de estoque');
    } finally {
      setLoading(false);
    }
  };

  // Funções CRUD para produtos
  const _handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setShowProductModal(true);
  };

  const _handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowProductModal(true);
  };

  const _handleViewProduct = (product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowProductModal(true);
  };

  const _handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const _result = await stockAPI.deleteProduct(productId);
        if (result.success) {
          notifySuccess('✅ Produto Excluído', 'Produto excluído com sucesso');
          loadStockData();
        } else {
          notifyError('❌ Erro', result.error);
        }
      } catch (error) {
        notifyError('❌ Erro', 'Erro ao excluir produto');
      }
    }
  };

  const _handleProductModalSuccess = () => {
    loadStockData();
    setShowProductModal(false);
  };

  // Cálculos resumidos
  const _totalProdutos = produtos.length;
  const _produtosBaixoEstoque = produtos.filter(p => p.status === 'baixo').length;
  const _valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.estoque_atual * p.custo_unitario), 0);
  const _movimentacaoMes = movimentacoes.length;

  const _formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const _getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'baixo':
        return 'text-red-600 bg-red-50';
      case 'alto':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const _renderOverview = () => (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-700 text-sm font-medium">Total Produtos</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{totalProdutos}</h3>
          <p className="text-blue-600 text-sm">Itens cadastrados</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-700 text-sm font-medium">Estoque Baixo</span>
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-1">{produtosBaixoEstoque}</h3>
          <p className="text-red-600 text-sm">Requer atenção</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 text-sm font-medium">Valor Total</span>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{formatCurrency(valorTotalEstoque)}</h3>
          <p className="text-green-600 text-sm">Investido em estoque</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-purple-700 text-sm font-medium">Movimentações</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-1">{movimentacaoMes}</h3>
          <p className="text-purple-600 text-sm">Este mês</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Produtos por Categoria</h3>
          <PieChartComponent
            data={[
              { name: 'Cafés Especiais', value: produtos.filter(p => p.categoria === 'Cafés Especiais').length },
              { name: 'Equipamentos', value: produtos.filter(p => p.categoria === 'Equipamentos').length },
              { name: 'Acessórios', value: produtos.filter(p => p.categoria === 'Acessórios').length },
              { name: 'Outros', value: produtos.filter(p => !['Cafés Especiais', 'Equipamentos', 'Acessórios'].includes(p.categoria)).length }
            ]}
            height={250}
            showLabels={true}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Status do Estoque</h3>
          <BarChartComponent
            data={[
              { name: 'Normal', value: produtos.filter(p => p.status === 'normal').length },
              { name: 'Baixo', value: produtos.filter(p => p.status === 'baixo').length },
              { name: 'Alto', value: produtos.filter(p => p.status === 'alto').length }
            ]}
            height={250}
            bars={[
              { dataKey: 'value', name: 'Produtos', color: '#3b82f6' }
            ]}
          />
        </div>
      </div>

      {/* Alertas e Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Estoque Baixo - Ação Necessária</h3>
          <div className="space-y-3">
            {produtos.filter(p => p.status === 'baixo').slice(0, 5).map((produto) => (
              <div key={produto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                <div>
                  <p className="font-medium text-gray-900">{produto.nome}</p>
                  <p className="text-sm text-gray-600">Loc: {produto.localizacao} | Min: {produto.estoque_minimo}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{produto.estoque_atual} unid.</p>
                  <button className="text-xs bg-red-600 text-white px-2 py-1 rounded mt-1 hover:bg-red-700">
                    Repor
                  </button>
                </div>
              </div>
            ))}
            {produtos.filter(p => p.status === 'baixo').length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">Todos os produtos estão com estoque adequado!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Top Produtos por Valor</h3>
          <div className="space-y-3">
            {produtos
              .sort((a, b) => (b.estoque_atual * b.preco_venda) - (a.estoque_atual * a.preco_venda))
              .slice(0, 5)
              .map((produto, index) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{produto.nome}</p>
                      <p className="text-sm text-gray-600">{produto.estoque_atual} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {formatCurrency(produto.estoque_atual * produto.preco_venda)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const _renderProdutos = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCreateProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Produto</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">SKU</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Categoria</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Estoque</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-900">Preços</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {produtos
                .filter(produto => 
                  produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{produto.nome}</p>
                      <p className="text-sm text-gray-600">{produto.fornecedor}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{produto.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{produto.categoria}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>
                      <span className="font-bold text-gray-900">{produto.estoque_atual}</span>
                      <div className="text-xs text-gray-500">
                        Min: {produto.estoque_minimo} | Max: {produto.estoque_maximo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>
                      <div className="text-sm text-gray-600">Custo: {formatCurrency(produto.custo_unitario)}</div>
                      <div className="font-semibold text-green-600">Venda: {formatCurrency(produto.preco_venda)}</div>
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
                        onClick={() => handleViewProduct(produto)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(produto)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(produto.id)}
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

  const _renderRelatorios = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Relatórios de Estoque</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Relatório de Estoque',
            description: 'Posição atual completa do estoque',
            icon: Package,
            color: 'blue'
          },
          {
            title: 'Movimentações',
            description: 'Histórico de entradas e saídas',
            icon: Activity,
            color: 'green'
          },
          {
            title: 'Produtos Críticos',
            description: 'Produtos com estoque baixo',
            icon: AlertTriangle,
            color: 'red'
          }
        ].map((relatorio, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${relatorio.color}-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <relatorio.icon className="w-6 h-6 text-white" />
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{relatorio.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{relatorio.description}</p>
            <div className="flex items-center space-x-2">
              <StockReport 
                data={{
                  products: produtos,
                  movements: movimentacoes,
                  suppliers: fornecedores,
                  totalValue: valorTotalEstoque,
                  lowStockCount: produtosBaixoEstoque
                }}
                type={relatorio.title.toLowerCase().includes('movimentação') ? 'movements' : 'general'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Módulo Estoque & Logística</h1>
          <p className="text-gray-600 mt-1">Gestão completa do estoque e operações logísticas</p>
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
                { id: 'produtos', label: 'Produtos', icon: Package },
                { id: 'movimentacoes', label: 'Movimentações', icon: Activity },
                { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
                { id: 'relatorios', label: 'Relatórios', icon: Download }
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'produtos' && renderProdutos()}
            {activeTab === 'relatorios' && renderRelatorios()}
          </>
        )}

        {/* Modal de Produtos */}
        <ProductStockModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          mode={modalMode}
          product={selectedProduct}
          onSuccess={handleProductModalSuccess}
        />
      </div>
    </div>
  );
};

export default AdminEstoqueDashboard; 