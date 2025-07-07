import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Warehouse, BarChart3, ArrowUpCircle, ArrowDownCircle, 
  AlertTriangle, CheckCircle, Clock, Edit, Trash2, Plus, Search, Eye,
  MapPin, Calendar, Filter, Download, ShoppingCart, Box, Activity,
  TrendingUp, Target, AlertCircle, Zap, Users, DollarSign, Phone
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { stockAPI } from "../lib/api.js"
import { useNotifications } from '../contexts/NotificationContext';
import ProductStockModal from '../components/ProductStockModal';
import SupplierModal from '../components/SupplierModal';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '../components/AdvancedCharts';
import { StockReport } from '../components/PDFReports';

const AdminEstoqueDashboard = () => {
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
  
  // Estados para modal de fornecedores
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierModalMode, setSupplierModalMode] = useState('create');

  const { user, hasPermission } = useSupabaseAuth();
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
    setError('');
    
    console.log('🔄 Carregando dados de estoque...');
    
    try {
      // Carregar dados com fallbacks individuais para cada API
      console.log('📦 Buscando produtos...');
      const productsResult = await stockAPI.getProducts().catch(error => {
        console.error('❌ Erro ao buscar produtos:', error);
        return { success: true, data: [] };
      });

      console.log('🏭 Buscando fornecedores...');
      const suppliersResult = await stockAPI.getSuppliers().catch(error => {
        console.error('❌ Erro ao buscar fornecedores:', error);
        return { success: true, data: [] };
      });

      console.log('📂 Buscando categorias...');
      const categoriesResult = await stockAPI.getProductCategories().catch(error => {
        console.error('❌ Erro ao buscar categorias:', error);
        return { success: true, data: [] };
      });

      console.log('🏬 Buscando depósitos...');
      const warehousesResult = await stockAPI.getWarehouses().catch(error => {
        console.error('❌ Erro ao buscar depósitos:', error);
        return { success: true, data: [] };
      });

      console.log('📊 Buscando movimentações...');
      const movementsResult = await stockAPI.getStockMovements().catch(error => {
        console.error('❌ Erro ao buscar movimentações:', error);
        return { success: true, data: [] };
      });

      // ===== PRODUTOS =====
      if (productsResult.success && productsResult.data && productsResult.data.length > 0) {
        console.log(`✅ ${productsResult.data.length} produtos carregados do Supabase`);
        setProdutos(productsResult.data.map(product => ({
          id: product.id,
          nome: product.name,
          sku: product.sku || `SKU-${product.id}`,
          categoria: product.category?.name || product.category || 'Geral',
          estoque_atual: product.current_stock || product.stock || 0,
          estoque_minimo: product.min_stock || 10,
          estoque_maximo: product.max_stock || 100,
          custo_unitario: product.cost_price || 0,
          preco_venda: product.sale_price || product.price || 0,
          localizacao: product.location || 'A definir',
          status: product.current_stock > (product.min_stock || 10) ? 'normal' : 'baixo',
          fornecedor: product.supplier?.name || 'A definir',
          ultima_movimentacao: product.updated_at || product.created_at || new Date().toISOString()
        })));
      } else {
        console.log('⚠️ Tabela products não encontrada ou vazia');
        setProdutos([]);
      }

      // ===== FORNECEDORES =====
      if (suppliersResult.success && suppliersResult.data && suppliersResult.data.length > 0) {
        console.log(`✅ ${suppliersResult.data.length} fornecedores carregados do Supabase`);
        setFornecedores(suppliersResult.data);
      } else {
        console.log('⚠️ Tabela suppliers não encontrada ou vazia');
        setFornecedores([]);
      }

      // ===== CATEGORIAS =====
      if (categoriesResult.success && categoriesResult.data && categoriesResult.data.length > 0) {
        console.log(`✅ ${categoriesResult.data.length} categorias carregadas do Supabase`);
        setCategorias(categoriesResult.data);
      } else {
        console.log('⚠️ Tabela product_categories não encontrada ou vazia');
        setCategorias([]);
      }

      // ===== DEPÓSITOS =====
      if (warehousesResult.success && warehousesResult.data && warehousesResult.data.length > 0) {
        console.log(`✅ ${warehousesResult.data.length} depósitos carregados do Supabase`);
        setDepositos(warehousesResult.data);
      } else {
        console.log('⚠️ Tabela warehouses não encontrada ou vazia');
        setDepositos([]);
      }

      // ===== MOVIMENTAÇÕES =====
      if (movementsResult.success && movementsResult.data && movementsResult.data.length > 0) {
        console.log(`✅ ${movementsResult.data.length} movimentações carregadas do Supabase`);
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
      } else {
        console.log('⚠️ Tabela stock_movements não encontrada ou vazia');
        setMovimentacoes([]);
      }

      console.log('✅ Dados de estoque carregados com sucesso!');
      setSuccess('Dados carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro geral ao carregar dados de estoque:', error);
      
      // Em caso de erro geral, garantir arrays vazios
      setProdutos([]);
      setFornecedores([]);
      setCategorias([]);
      setDepositos([]);
      setMovimentacoes([]);

      setError('Erro ao carregar dados de estoque');
      notifyError('❌ Erro Estoque', 'Erro ao carregar dados do módulo de estoque');
    } finally {
      setLoading(false);
    }
  };

  // Funções CRUD para produtos
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowProductModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const result = await stockAPI.deleteProduct(productId);
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

  const handleProductModalSuccess = () => {
    loadStockData();
    setShowProductModal(false);
  };

  // Funções CRUD para fornecedores
  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setSupplierModalMode('create');
    setShowSupplierModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierModalMode('edit');
    setShowSupplierModal(true);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierModalMode('view');
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        // Deletar fornecedor no Supabase (soft delete - marcar como inativo)
        const result = await stockAPI.updateSupplier(supplierId, { is_active: false });
        if (result.success) {
          notifySuccess('✅ Fornecedor Excluído', 'Fornecedor excluído com sucesso');
          loadStockData(); // Recarregar dados
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        notifyError('❌ Erro', `Erro ao excluir fornecedor: ${error.message}`);
      }
    }
  };

  const handleSupplierSave = async (formData) => {
    try {
      if (supplierModalMode === 'create') {
        // Criar novo fornecedor no Supabase
        const supplierData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          contact_person: formData.contact_person,
          cnpj: formData.cnpj,
          is_active: formData.is_active,
          notes: formData.notes
        };
        
        const result = await stockAPI.createSupplier(supplierData);
        if (result.success) {
          notifySuccess('✅ Fornecedor Criado', 'Fornecedor criado com sucesso no banco de dados');
          loadStockData(); // Recarregar dados
        } else {
          throw new Error(result.error);
        }
      } else if (supplierModalMode === 'edit') {
        // Editar fornecedor existente no Supabase
        const updates = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          contact_person: formData.contact_person,
          cnpj: formData.cnpj,
          is_active: formData.is_active,
          notes: formData.notes
        };
        
        const result = await stockAPI.updateSupplier(selectedSupplier.id, updates);
        if (result.success) {
          notifySuccess('✅ Fornecedor Atualizado', 'Fornecedor atualizado com sucesso no banco de dados');
          loadStockData(); // Recarregar dados
        } else {
          throw new Error(result.error);
        }
      }
      setShowSupplierModal(false);
    } catch (error) {
      console.error('Erro ao salvar fornecedor no Supabase:', error);
      notifyError('❌ Erro', `Erro ao salvar fornecedor: ${error.message}`);
      throw error;
    }
  };

  // Cálculos resumidos
  const totalProdutos = produtos.length;
  const produtosBaixoEstoque = produtos.filter(p => p.status === 'baixo').length;
  const valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.estoque_atual * p.custo_unitario), 0);
  const movimentacaoMes = movimentacoes.length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
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

  const renderOverview = () => (
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

  const renderProdutos = () => (
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

  const renderMovimentacoes = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Movimentações de Estoque</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar movimentações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Data/Hora</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Produto</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Tipo</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Quantidade</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Motivo</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Documento</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Usuário</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-900">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movimentacoes
                .filter(mov => 
                  mov.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  mov.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  mov.documento.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((movimentacao) => (
                <tr key={movimentacao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(movimentacao.data).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{movimentacao.produto}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      movimentacao.tipo === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movimentacao.tipo === 'entrada' ? '↗️ Entrada' : '↙️ Saída'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-900">{movimentacao.quantidade}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{movimentacao.motivo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {movimentacao.documento}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{movimentacao.usuario}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(movimentacao.custo_total)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {movimentacoes.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
            <p className="text-gray-600">As movimentações de estoque aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFornecedores = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={handleCreateSupplier}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Fornecedor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fornecedores
          .filter(fornecedor => 
            fornecedor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fornecedor.email && fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((fornecedor) => (
          <div key={fornecedor.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{fornecedor.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    fornecedor.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {fornecedor.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewSupplier(fornecedor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditSupplier(fornecedor)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" 
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteSupplier(fornecedor.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {fornecedor.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{fornecedor.email}</span>
                </div>
              )}
              
              {fornecedor.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{fornecedor.phone}</span>
                </div>
              )}
              
              {fornecedor.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{fornecedor.address}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Produtos fornecidos:</span>
                <span className="font-semibold text-gray-900">
                  {produtos.filter(p => p.fornecedor === fornecedor.name).length}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-medium transition-colors">
                Ver Produtos
              </button>
            </div>
          </div>
        ))}
      </div>

      {fornecedores.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor cadastrado</h3>
          <p className="text-gray-600">Cadastre fornecedores para gerenciar suas compras.</p>
        </div>
      )}
    </div>
  );

  const renderRelatorios = () => (
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
            {activeTab === 'movimentacoes' && renderMovimentacoes()}
            {activeTab === 'fornecedores' && renderFornecedores()}
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

        {/* Modal de Fornecedores */}
        <SupplierModal
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          mode={supplierModalMode}
          data={selectedSupplier}
          onSave={handleSupplierSave}
        />
      </div>
    </div>
  );
};

export default AdminEstoqueDashboard; 