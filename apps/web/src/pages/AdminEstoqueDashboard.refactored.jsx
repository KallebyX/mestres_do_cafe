import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Warehouse, BarChart3, ArrowUpCircle, ArrowDownCircle, 
  AlertTriangle, CheckCircle, Plus, Search, Edit, Trash2, Eye
} from 'lucide-react';
import AdminDashboardBase from '../components/admin/AdminDashboardBase';
import { 
  StatCard, 
  QuickActions, 
  RecentActivity, 
  DataTable, 
  SearchAndFilter
} from '../components/admin/DashboardWidgets';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { stockAPI } from '../lib/api';
import ProductStockModal from '../components/ProductStockModal';
import SupplierModal from '../components/SupplierModal';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '../components/AdvancedCharts';
import { StockReport } from '../components/PDFReports';

const AdminEstoqueDashboard = () => {
  const {
    loading,
    activeTab,
    refreshKey,
    handleTabChange,
    showMessage,
    handleApiCall,
    handleDelete,
    handleStatusToggle
  } = useAdminDashboard({
    initialTab: 'overview',
    permissions: ['admin'],
    autoRefresh: true
  });

  // Data states
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    movements: 0
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('30d');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Dashboard tabs configuration
  const stockTabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'products', label: 'Produtos', icon: Package, badge: produtos.length },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck, badge: fornecedores.length },
    { id: 'movements', label: 'Movimentações', icon: ArrowUpCircle, badge: movimentacoes.length },
    { id: 'reports', label: 'Relatórios', icon: Eye }
  ];

  // Load stock data
  useEffect(() => {
    const loadStockData = async () => {
      try {
        await Promise.all([
          loadProducts(),
          loadSuppliers(),
          loadMovements(),
          loadCategories(),
          loadWarehouses(),
          loadStockStats()
        ]);
      } catch (error) {
        showMessage('Erro ao carregar dados de estoque', 'error');
      }
    };

    loadStockData();
  }, [refreshKey]);

  // Data loading functions
  const loadProducts = async () => {
    try {
      const result = await stockAPI.getProducts();
      if (result.success) {
        setProdutos(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const result = await stockAPI.getSuppliers();
      if (result.success) {
        setFornecedores(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const loadMovements = async () => {
    try {
      const result = await stockAPI.getStockMovements();
      if (result.success) {
        setMovimentacoes(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await stockAPI.getProductCategories();
      if (result.success) {
        setCategorias(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadWarehouses = async () => {
    try {
      const result = await stockAPI.getWarehouses();
      if (result.success) {
        setDepositos(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error);
    }
  };

  const loadStockStats = async () => {
    try {
      const result = await stockAPI.getStockReports();
      if (result.success) {
        setStockStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Product handlers
  const handleProductDelete = async (product) => {
    const success = await handleDelete(
      product.id,
      () => stockAPI.deleteProduct(product.id),
      'produto'
    );
    if (success) {
      loadProducts();
    }
  };

  const handleProductEdit = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleProductCreate = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  // Supplier handlers
  const handleSupplierEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleSupplierCreate = () => {
    setSelectedSupplier(null);
    setShowSupplierModal(true);
  };

  // Quick actions configuration
  const quickActions = [
    {
      label: 'Adicionar Produto',
      icon: Plus,
      onClick: handleProductCreate
    },
    {
      label: 'Novo Fornecedor',
      icon: Truck,
      onClick: handleSupplierCreate
    },
    {
      label: 'Relatório de Estoque',
      icon: Eye,
      onClick: () => {
        // Generate stock report
        const report = new StockReport(produtos);
        report.generate();
      }
    }
  ];

  // Recent stock activities
  const recentActivities = movimentacoes.slice(0, 5).map(mov => ({
    type: mov.type === 'entrada' ? 'success' : 'warning',
    title: `${mov.type === 'entrada' ? 'Entrada' : 'Saída'} de estoque`,
    description: `${mov.product_name} - Quantidade: ${mov.quantity}`,
    timestamp: new Date(mov.created_at).toLocaleString()
  }));

  // Filter products by search term
  const filteredProducts = produtos.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Product table configuration
  const productTableHeaders = [
    { key: 'name', label: 'Nome' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Categoria' },
    { key: 'stock_quantity', label: 'Estoque' },
    { key: 'min_stock', label: 'Estoque Mínimo' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (status, product) => {
        const isLowStock = product.stock_quantity <= product.min_stock;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isLowStock 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isLowStock ? 'Estoque Baixo' : 'Normal'}
          </span>
        );
      }
    }
  ];

  const productTableActions = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleProductEdit,
      className: 'text-blue-600 bg-blue-100 hover:bg-blue-200'
    },
    {
      label: 'Deletar',
      icon: Trash2,
      onClick: handleProductDelete,
      className: 'text-red-600 bg-red-100 hover:bg-red-200'
    }
  ];

  // Supplier table configuration
  const supplierTableHeaders = [
    { key: 'name', label: 'Nome' },
    { key: 'contact', label: 'Contato' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (status) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  const supplierTableActions = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleSupplierEdit,
      className: 'text-blue-600 bg-blue-100 hover:bg-blue-200'
    }
  ];

  // Movement table configuration
  const movementTableHeaders = [
    { key: 'product_name', label: 'Produto' },
    { key: 'type', label: 'Tipo' },
    { key: 'quantity', label: 'Quantidade' },
    { key: 'reason', label: 'Motivo' },
    { key: 'created_at', label: 'Data', render: (date) => new Date(date).toLocaleDateString() }
  ];

  // Render overview tab content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Produtos"
          value={produtos.length}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Estoque Baixo"
          value={produtos.filter(p => p.stock_quantity <= p.min_stock).length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Fornecedores"
          value={fornecedores.length}
          icon={Truck}
          color="green"
        />
        <StatCard
          title="Movimentações (30d)"
          value={movimentacoes.length}
          icon={ArrowUpCircle}
          color="purple"
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={quickActions} />
        <RecentActivity activities={recentActivities} title="Movimentações Recentes" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Movimentações por Categoria</h3>
          <PieChartComponent data={categorias} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estoque por Tempo</h3>
          <LineChartComponent data={movimentacoes} />
        </div>
      </div>
    </div>
  );

  // Render products tab content
  const renderProductsTab = () => (
    <div className="space-y-6">
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Pesquisar produtos..."
        filters={[
          {
            key: 'category',
            placeholder: 'Todas as categorias',
            value: '',
            options: categorias.map(cat => ({ value: cat.id, label: cat.name }))
          }
        ]}
      />
      
      <DataTable
        title="Produtos"
        headers={productTableHeaders}
        data={filteredProducts}
        actions={productTableActions}
        loading={loading}
        emptyMessage="Nenhum produto encontrado"
      />
    </div>
  );

  // Render suppliers tab content
  const renderSuppliersTab = () => (
    <div className="space-y-6">
      <DataTable
        title="Fornecedores"
        headers={supplierTableHeaders}
        data={fornecedores}
        actions={supplierTableActions}
        loading={loading}
        emptyMessage="Nenhum fornecedor encontrado"
      />
    </div>
  );

  // Render movements tab content
  const renderMovementsTab = () => (
    <div className="space-y-6">
      <SearchAndFilter
        searchTerm=""
        onSearchChange={() => {}}
        placeholder="Filtrar movimentações..."
        filters={[
          {
            key: 'dateRange',
            placeholder: 'Período',
            value: dateFilter,
            options: [
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: '90d', label: 'Últimos 90 dias' }
            ]
          }
        ]}
        onFilterChange={(key, value) => {
          if (key === 'dateRange') {
            setDateFilter(value);
          }
        }}
      />
      
      <DataTable
        title="Movimentações de Estoque"
        headers={movementTableHeaders}
        data={movimentacoes}
        loading={loading}
        emptyMessage="Nenhuma movimentação encontrada"
      />
    </div>
  );

  // Render reports tab content
  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Relatórios de Estoque</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const report = new StockReport(produtos);
              report.generate();
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Relatório de Produtos</h4>
            <p className="text-sm text-gray-600">Listagem completa de produtos</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-900">Estoque Baixo</h4>
            <p className="text-sm text-gray-600">Produtos com estoque baixo</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ArrowUpCircle className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Movimentações</h4>
            <p className="text-sm text-gray-600">Histórico de movimentações</p>
          </button>
        </div>
      </div>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'suppliers':
        return renderSuppliersTab();
      case 'movements':
        return renderMovementsTab();
      case 'reports':
        return renderReportsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <AdminDashboardBase
      title="Gestão de Estoque"
      tabs={stockTabs}
      onTabChange={handleTabChange}
      defaultTab="overview"
      permissions={['admin']}
    >
      {renderTabContent()}
      
      {/* Product Modal */}
      {showProductModal && (
        <ProductStockModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            loadProducts();
            setShowProductModal(false);
            setSelectedProduct(null);
            showMessage('Produto salvo com sucesso!', 'success');
          }}
        />
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => {
            setShowSupplierModal(false);
            setSelectedSupplier(null);
          }}
          onSuccess={() => {
            loadSuppliers();
            setShowSupplierModal(false);
            setSelectedSupplier(null);
            showMessage('Fornecedor salvo com sucesso!', 'success');
          }}
        />
      )}
    </AdminDashboardBase>
  );
};

export default AdminEstoqueDashboard;