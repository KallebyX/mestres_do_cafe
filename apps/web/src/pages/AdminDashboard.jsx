import {
  Activity,
  BarChart3,
  BookOpen,
  Check,
  DollarSign,
  Edit,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductModal from '../components/ProductModal';
import UserModal from '../components/UserModal';
import AdminDashboardBase from '../components/admin/AdminDashboardBase';
import ShippingAdmin from '../components/ShippingAdmin';
import {
  CommonStatCards,
  DataTable,
  QuickActions,
  RecentActivity,
  SearchAndFilter,
  StatCard
} from '../components/admin/DashboardWidgets';
import { BarChart, LineChart } from '../components/ui/charts';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import {
  apiRequest,
  deleteOrderAdmin,
  deleteProductAdmin,
  deleteUserAdmin,
  getAllBlogPostsAdmin,
  getAllOrdersAdmin,
  getAllProductsAdmin,
  getStats,
  getTopProductsByRevenue,
  getUsers,
  hrAPI,
  toggleProductStatusAdmin,
  toggleUserStatusAdmin,
  updateOrderStatusAdmin
} from '../lib/api';

const AdminDashboard = () => {
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
    autoRefresh: true,
    refreshInterval: 60000
  });

  // Data states
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  
  // Debug states
  console.log('🔍 Estado atual:', { users: users.length, products: products.length, orders: orders.length });
  const [topProducts, setTopProducts] = useState([]);
  const [hrData, setHrData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
    departments: []
  });
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerModalMode, setCustomerModalMode] = useState('create');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Dashboard tabs configuration
  const dashboardTabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'products', label: 'Produtos', icon: Package, badge: products.length },
    { id: 'users', label: 'Usuários', icon: Users, badge: users.length },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, badge: orders.length },
    { id: 'shipping', label: 'Envios', icon: Truck },
    { id: 'blog', label: 'Blog', icon: BookOpen, badge: blogPosts.length },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          loadStats(),
          loadUsers(),
          loadProducts(),
          loadOrders(),
          loadBlogPosts(),
          loadTopProducts(),
          loadHRData(),
          loadRealTimeMetrics(),
          loadRecentActivities()
        ]);
      } catch (error) {
        showMessage('Erro ao carregar dados do dashboard', 'error');
      }
    };

    loadDashboardData();
  }, [refreshKey]);

  // Data loading functions
  const loadStats = async () => {
    try {
      console.log('🔄 Carregando estatísticas...');
      const result = await getStats();
      console.log('📊 Resultado stats:', result);
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('❌ Erro ao carregar estatísticas:', result.error);
        showMessage(result.error || 'Erro ao carregar estatísticas', 'error');
      }
    } catch (error) {
      console.error('💥 Erro ao carregar estatísticas:', error);
      showMessage('Erro ao carregar estatísticas', 'error');
    }
  };

  const loadUsers = async () => {
    try {
      console.log('🔄 Carregando usuários...');
      const result = await getUsers();
      console.log('👥 Resultado users:', result);
      console.log('🔍 Estrutura completa result.data:', result.data);
      console.log('🔍 result.data.users:', result.data?.users);
      console.log('🔍 result.data.data:', result.data?.data);
      console.log('🔍 result.data.data?.users:', result.data?.data?.users);
      if (result.success) {
        // A API de users retorna data.data.users
        const usersData = Array.isArray(result.data?.data?.users) ? result.data.data.users : [];
        console.log('📋 Dados dos usuários extraídos:', usersData);
        console.log('📊 Quantidade de usuários:', usersData.length);
        setUsers(usersData);
      } else {
        console.error('❌ Erro ao carregar usuários:', result.error);
        showMessage(result.error || 'Erro ao carregar usuários', 'error');
        setUsers([]); // Garantir que users seja sempre um array
      }
    } catch (error) {
      console.error('💥 Erro ao carregar usuários:', error);
      showMessage('Erro ao carregar usuários', 'error');
      setUsers([]); // Garantir que users seja sempre um array
    }
  };

  const loadProducts = async () => {
    try {
      console.log('🔄 Carregando produtos...');
      const result = await getAllProductsAdmin();
      console.log('📦 Resultado products:', result);
      if (result.success) {
        // A API admin retorna data.data.products (duplo encapsulamento)
        const productsData = result.data?.data?.products || result.data?.products || [];
        setProducts(productsData);
      } else {
        console.error('❌ Erro ao carregar produtos:', result.error);
        showMessage(result.error || 'Erro ao carregar produtos', 'error');
        setProducts([]); // Garantir que products seja sempre um array
      }
    } catch (error) {
      console.error('💥 Erro ao carregar produtos:', error);
      showMessage('Erro ao carregar produtos', 'error');
      setProducts([]); // Garantir que products seja sempre um array
    }
  };

  const loadOrders = async () => {
    try {
      console.log('🔄 Carregando pedidos...');
      const result = await getAllOrdersAdmin();
      console.log('📦 Resultado orders:', result);
      console.log('🔍 result.data.orders:', result.data?.orders);
      console.log('🔍 result.data.data?.orders:', result.data?.data?.orders);
      if (result.success) {
        // Tentar ambas as estruturas
        const ordersData = result.data?.data?.orders || result.data?.orders || [];
        console.log('📋 Dados dos pedidos extraídos:', ordersData);
        console.log('📊 Quantidade de pedidos:', ordersData.length);
        setOrders(ordersData);
      } else {
        console.error('❌ Erro ao carregar pedidos:', result.error);
        showMessage(result.error || 'Erro ao carregar pedidos', 'error');
        setOrders([]);
      }
    } catch (error) {
      console.error('💥 Erro ao carregar pedidos:', error);
      showMessage('Erro ao carregar pedidos', 'error');
      setOrders([]);
    }
  };

  const loadBlogPosts = async () => {
    try {
      console.log('🔄 Carregando posts do blog...');
      const result = await getAllBlogPostsAdmin();
      console.log('📝 Resultado blog posts:', result);
      console.log('🔍 result.data.posts:', result.data?.posts);
      console.log('🔍 result.data.data?.posts:', result.data?.data?.posts);
      if (result.success) {
        // A API de blog posts retorna data.data.posts (duplo encapsulamento)
        const postsData = result.data?.data?.posts || result.data?.posts || [];
        console.log('📋 Dados dos posts extraídos:', postsData);
        console.log('📊 Quantidade de posts:', postsData.length);
        setBlogPosts(postsData);
      } else {
        console.error('❌ Erro ao carregar posts:', result.error);
        setBlogPosts([]); // Garantir que blogPosts seja sempre um array
      }
    } catch (error) {
      console.error('💥 Erro ao carregar posts:', error);
      setBlogPosts([]); // Garantir que blogPosts seja sempre um array
    }
  };

  const loadTopProducts = async () => {
    try {
      const result = await getTopProductsByRevenue(5);
      if (result.success) {
        // A API de top products retorna data.top_products
        const topProductsData = Array.isArray(result.data?.top_products) ? result.data.top_products : [];
        setTopProducts(topProductsData);
      } else {
        setTopProducts([]); // Garantir que topProducts seja sempre um array
      }
    } catch (error) {
      console.error('Erro ao carregar top produtos:', error);
      setTopProducts([]); // Garantir que topProducts seja sempre um array
    }
  };

  const loadHRData = async () => {
    try {
      console.log('🔄 Carregando dados RH...');
      const result = await hrAPI.getHRSummary();
      console.log('👷 Resultado HR:', result);
      if (result.success) {
        setHrData(result.data);
      } else {
        console.error('❌ Erro ao carregar dados RH:', result.error);
        showMessage(result.error || 'Erro ao carregar dados RH', 'error');
      }
    } catch (error) {
      console.error('💥 Erro ao carregar dados RH:', error);
      showMessage('Erro ao carregar dados RH', 'error');
    }
  };

  // Função otimizada para carregar métricas em tempo real usando APIs funcionais
  const loadRealTimeMetrics = async () => {
    try {
      console.log('📊 Carregando métricas em tempo real com APIs funcionais...');
      
      // Carregar dados das APIs funcionais com Promise.allSettled para robustez
      const [statsResponse, ordersResponse, productsResponse, usersResponse, segmentsResponse] = await Promise.allSettled([
        apiRequest('/admin/stats'),
        apiRequest('/admin/orders?per_page=100'), // Mais dados para cálculos precisos
        apiRequest('/admin/products?per_page=100'),
        apiRequest('/admin/users?per_page=100'),
        apiRequest('/analytics/customers/segments') // Esta API funciona
      ]);

      // Extrair dados das respostas bem-sucedidas
      const basicData = {
        stats: statsResponse.status === 'fulfilled' && statsResponse.value.success ? statsResponse.value.data : null,
        orders: ordersResponse.status === 'fulfilled' && ordersResponse.value.success ?
               (ordersResponse.value.data.data?.orders || ordersResponse.value.data.orders || []) : [],
        products: productsResponse.status === 'fulfilled' && productsResponse.value.success ?
                 (productsResponse.value.data.data?.products || productsResponse.value.data.products || []) : [],
        users: usersResponse.status === 'fulfilled' && usersResponse.value.success ?
               (usersResponse.value.data.data?.users || usersResponse.value.data.users || []) : [],
        segments: segmentsResponse.status === 'fulfilled' && segmentsResponse.value.success ?
                 segmentsResponse.value.data.segments : {}
      };

      // Processar dados para calcular métricas avançadas
      const ordersArray = Array.isArray(basicData.orders) ? basicData.orders : [];
      const productsArray = Array.isArray(basicData.products) ? basicData.products : [];
      const usersArray = Array.isArray(basicData.users) ? basicData.users : [];

      // Calcular receita total e métricas de vendas
      const totalRevenue = ordersArray.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const completedOrders = ordersArray.filter(o => o.status === 'completed' || o.status === 'delivered');
      const completedRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      
      // Ticket médio
      const avgOrderValue = completedOrders.length > 0 ? completedRevenue / completedOrders.length : 0;
      
      // Produtos ativos e performance
      const activeProducts = productsArray.filter(p => p.is_active);
      const lowStockProducts = productsArray.filter(p => p.stock_quantity <= 10 && p.is_active);
      
      // Usuários ativos
      const activeUsers = usersArray.filter(u => u.is_active);
      const newUsersThisMonth = usersArray.filter(u => {
        if (!u.created_at) return false;
        const createdDate = new Date(u.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      });

      // Vendas por mês (últimos 6 meses)
      const salesByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        const monthOrders = ordersArray.filter(order => {
          if (!order.created_at) return false;
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        });
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        salesByMonth.push({ month: monthName, value: monthRevenue });
      }

      // Produtos top por receita
      const productRevenue = {};
      ordersArray.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productId = item.product_id;
            const revenue = parseFloat(item.quantity || 1) * parseFloat(item.price || 0);
            productRevenue[productId] = (productRevenue[productId] || 0) + revenue;
          });
        }
      });

      const topProductsRevenue = productsArray
        .map(product => ({
          ...product,
          revenue: productRevenue[product.id] || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Taxa de conversão estimada (pedidos completados vs total de usuários)
      const conversionRate = usersArray.length > 0 ? (completedOrders.length / usersArray.length) * 100 : 2.4;

      // Atualizar estado com métricas calculadas
      const calculatedMetrics = {
        // Vendas
        totalRevenue,
        totalOrders: ordersArray.length,
        completedOrders: completedOrders.length,
        avgOrderValue,
        conversionRate,
        revenueGrowth: 5.2, // Valor estimado
        
        // Produtos
        totalProducts: productsArray.length,
        activeProducts: activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        topProductsRevenue,
        
        // Usuários
        totalUsers: usersArray.length,
        activeUsers: activeUsers.length,
        newUsers: newUsersThisMonth.length,
        
        // Dados para gráficos
        salesByMonth,
        dailySales: [], // Pode ser calculado se necessário
        customerSegments: basicData.segments,
        salesForecast: [], // Fallback vazio
        
        // Status das APIs
        apiStatus: {
          stats: statsResponse.status === 'fulfilled',
          orders: ordersResponse.status === 'fulfilled',
          products: productsResponse.status === 'fulfilled',
          users: usersResponse.status === 'fulfilled',
          segments: segmentsResponse.status === 'fulfilled'
        }
      };

      setRealTimeMetrics(calculatedMetrics);
      
      // Atualizar KPIs de performance
      setPerformanceKPIs([
        { name: 'Taxa de Conversão', value: conversionRate.toFixed(1) + '%', change: '+0.3%' },
        { name: 'Ticket Médio', value: 'R$ ' + avgOrderValue.toFixed(2), change: '+2.1%' },
        { name: 'Produtos Ativos', value: activeProducts.length.toString(), change: '+5%' },
        { name: 'Usuários Ativos', value: activeUsers.length.toString(), change: '+1.8%' },
        { name: 'Estoque Baixo', value: lowStockProducts.length.toString(), change: lowStockProducts.length > 3 ? 'Alto' : 'Normal' }
      ]);

      console.log('✅ Métricas em tempo real carregadas com dados reais:', calculatedMetrics);
      
    } catch (error) {
      console.error('💥 Erro ao carregar métricas em tempo real:', error);
      
      // Fallback com dados mock realistas em caso de erro
      const fallbackMetrics = {
        totalRevenue: 15420.50,
        totalOrders: 89,
        completedOrders: 76,
        avgOrderValue: 173.25,
        conversionRate: 2.4,
        revenueGrowth: 5.2,
        totalProducts: 45,
        activeProducts: 42,
        lowStockProducts: 3,
        topProductsRevenue: [],
        totalUsers: 234,
        activeUsers: 189,
        newUsers: 12,
        salesByMonth: [
          { month: 'Jan', value: 12500 },
          { month: 'Fev', value: 13200 },
          { month: 'Mar', value: 14100 },
          { month: 'Abr', value: 13800 },
          { month: 'Mai', value: 15420 },
          { month: 'Jun', value: 16200 }
        ],
        dailySales: [],
        customerSegments: {},
        salesForecast: [],
        apiStatus: { stats: false, orders: false, products: false, users: false, segments: false }
      };
      
      setRealTimeMetrics(fallbackMetrics);
      setPerformanceKPIs([
        { name: 'Taxa de Conversão', value: '2.4%', change: '+0.3%' },
        { name: 'Ticket Médio', value: 'R$ 173.25', change: '+2.1%' },
        { name: 'Produtos Ativos', value: '42', change: '+5%' },
        { name: 'Usuários Ativos', value: '189', change: '+1.8%' },
        { name: 'Estoque Baixo', value: '3', change: 'Normal' }
      ]);
      
      showMessage('Métricas carregadas com dados de fallback', 'warning');
    }
  };

  // Carregar atividades recentes reais
  const loadRecentActivities = async () => {
    try {
      const activities = [];

      // Pedidos recentes (últimas 24h)
      const recentOrdersResult = await apiRequest('/admin/orders?per_page=5');
      if (recentOrdersResult.success && recentOrdersResult.data.data?.orders) {
        recentOrdersResult.data.data.orders.forEach(order => {
          if (order.created_at) {
            const timeDiff = new Date() - new Date(order.created_at);
            const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
            const timeText = hoursAgo < 1 ? 'menos de 1 hora atrás' :
                            hoursAgo === 1 ? '1 hora atrás' : `${hoursAgo} horas atrás`;
            
            activities.push({
              type: order.status === 'completed' ? 'success' : 'info',
              title: 'Novo pedido',
              description: `Pedido ${order.order_number || order.id} - R$ ${order.total_amount?.toFixed(2) || '0.00'}`,
              timestamp: timeText
            });
          }
        });
      }

      // Produtos recém-adicionados
      const recentProductsResult = await apiRequest('/admin/products?per_page=3');
      if (recentProductsResult.success && recentProductsResult.data.data?.products) {
        recentProductsResult.data.data.products.slice(0, 2).forEach(product => {
          if (product.created_at) {
            const timeDiff = new Date() - new Date(product.created_at);
            const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
            const timeText = hoursAgo < 1 ? 'menos de 1 hora atrás' :
                            hoursAgo === 1 ? '1 hora atrás' : `${hoursAgo} horas atrás`;
            
            activities.push({
              type: 'success',
              title: 'Produto adicionado',
              description: `${product.name} foi adicionado ao catálogo`,
              timestamp: timeText
            });
          }
        });
      }

      // Alerta de estoque baixo
      const lowStockResult = await apiRequest('/admin/products?per_page=100');
      if (lowStockResult.success && lowStockResult.data.data?.products) {
        const lowStockProducts = lowStockResult.data.data.products.filter(p =>
          p.stock_quantity !== null && p.stock_quantity <= 10 && p.is_active
        );
        
        if (lowStockProducts.length > 0) {
          const product = lowStockProducts[0];
          activities.push({
            type: 'warning',
            title: 'Estoque baixo',
            description: `${product.name} - ${product.stock_quantity} unidades restantes`,
            timestamp: 'agora'
          });
        }
      }

      // Ordenar por timestamp e pegar os 5 mais recentes
      const sortedActivities = activities.sort((a, b) => {
        if (a.timestamp === 'agora') return -1;
        if (b.timestamp === 'agora') return 1;
        return 0;
      }).slice(0, 5);

      setRecentActivities(sortedActivities.length > 0 ? sortedActivities : [
        {
          type: 'info',
          title: 'Dashboard carregado',
          description: 'Sistema iniciado com sucesso',
          timestamp: 'agora'
        }
      ]);

    } catch (error) {
      console.error('💥 Erro ao carregar atividades recentes:', error);
      // Fallback para atividades básicas
      setRecentActivities([
        {
          type: 'info',
          title: 'Sistema ativo',
          description: 'Dashboard administrativo funcionando',
          timestamp: 'agora'
        }
      ]);
    }
  };

  // Product handlers
  const handleProductDelete = async (product) => {
    const success = await handleDelete(
      product.id,
      () => deleteProductAdmin(product.id),
      'produto'
    );
    if (success) {
      loadProducts();
    }
  };

  const handleProductToggle = async (product) => {
    const success = await handleStatusToggle(
      product.id,
      product.is_active,
      () => toggleProductStatusAdmin(product.id, !product.is_active),
      'produto'
    );
    if (success) {
      loadProducts();
    }
  };

  // User handlers
  const handleUserDelete = async (user) => {
    const success = await handleDelete(
      user.id,
      () => deleteUserAdmin(user.id),
      'usuário'
    );
    if (success) {
      loadUsers();
    }
  };

  const handleUserToggle = async (user) => {
    const success = await handleStatusToggle(
      user.id,
      user.is_active,
      () => toggleUserStatusAdmin(user.id, !user.is_active),
      'usuário'
    );
    if (success) {
      loadUsers();
    }
  };

  // Order handlers
  const handleOrderDelete = async (order) => {
    const success = await handleDelete(
      order.id,
      () => deleteOrderAdmin(order.id),
      'pedido'
    );
    if (success) {
      loadOrders();
    }
  };

  const handleOrderStatusUpdate = async (order, newStatus) => {
    try {
      const result = await updateOrderStatusAdmin(order.id, newStatus);
      if (result.success) {
        showMessage(`Status do pedido atualizado para ${newStatus}`, 'success');
        loadOrders();
      } else {
        showMessage(result.error || 'Erro ao atualizar status', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      showMessage('Erro ao atualizar status do pedido', 'error');
    }
  };

  // Quick actions configuration
  const quickActions = [
    {
      label: 'Adicionar Produto',
      icon: Plus,
      onClick: () => {
        setEditingProduct(null);
        setShowProductModal(true);
      }
    },
    {
      label: 'Novo Post',
      icon: BookOpen,
      onClick: () => {
        setEditingPost(null);
        setShowBlogModal(true);
      }
    },
    {
      label: 'Novo Usuário',
      icon: Users,
      onClick: () => {
        setEditingUser(null);
        setShowUserModal(true);
      }
    },
    {
      label: 'Relatório de Vendas',
      icon: BarChart3,
      onClick: () => {
        // Navigate to sales report
        window.location.href = '/admin/reports/sales';
      }
    }
  ];

  // Real-time activities from analytics API
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Real analytics data
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    dailySales: [],
    salesByMonth: [],
    conversionRate: 0,
    averageOrderValue: 0,
    topProductsRevenue: [],
    customerSegments: {},
    salesForecast: []
  });

  // Performance indicators
  const [performanceKPIs, setPerformanceKPIs] = useState([]);

  // Filter products by search term
  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];
  

  // Product table configuration
  const productTableHeaders = [
    { key: 'name', label: 'Nome' },
    { key: 'price', label: 'Preço', render: (price) => `R$ ${price?.toFixed(2)}` },
    { key: 'stock_quantity', label: 'Estoque', render: (qty) => qty || 0 },
    { key: 'category', label: 'Categoria' },
    { key: 'origin', label: 'Origem' },
    { 
      key: 'is_active', 
      label: 'Status', 
      render: (isActive) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  const productTableActions = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: (product) => {
        setEditingProduct(product);
        setShowProductModal(true);
      },
      className: 'text-blue-600 bg-blue-100 hover:bg-blue-200'
    },
    {
      label: 'Alternar Status',
      icon: Activity,
      onClick: handleProductToggle,
      className: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200'
    },
    {
      label: 'Deletar',
      icon: Trash2,
      onClick: handleProductDelete,
      className: 'text-red-600 bg-red-100 hover:bg-red-200'
    }
  ];

  // Render overview tab content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CommonStatCards.Revenue 
          value={`R$ ${stats.totalRevenue?.toFixed(2) || '0.00'}`}
          trend={{ direction: 'up', value: '12%', label: 'vs mês anterior' }}
        />
        <CommonStatCards.Users 
          value={users.length || 0}
          trend={{ direction: 'up', value: '3%', label: 'novos usuários' }}
        />
        <CommonStatCards.Products 
          value={products.length || 0}
          trend={{ direction: 'up', value: '5%', label: 'novos produtos' }}
        />
        <CommonStatCards.Orders 
          value={orders.length || 0}
          trend={{ direction: 'up', value: '8%', label: 'novos pedidos' }}
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={quickActions} />
        <RecentActivity activities={recentActivities} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Mês</h3>
          <LineChart data={stats.salesByMonth || []} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos Mais Vendidos</h3>
          <BarChart data={topProducts || []} />
        </div>
      </div>
    </div>
  );

  // Render products tab content
  const renderProductsTab = () => (
    <div className="space-y-6">
      {/* Header com busca e botão de adicionar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Pesquisar produtos..."
        />
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Produto
        </button>
      </div>
      
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

  // Render users tab content
  const renderUsersTab = () => {
    console.log('🎯 Renderizando aba de usuários. Estado users:', users);
    console.log('🎯 Tipo do estado users:', typeof users);
    console.log('🎯 É array?', Array.isArray(users));
    console.log('🎯 Quantidade no estado:', users?.length);
    
    return (
      <div className="space-y-6">
        {/* Header com busca e botão de adicionar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Pesquisar usuários..."
          />
          <button
            onClick={() => {
              setEditingUser(null);
              setShowUserModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Usuário
          </button>
        </div>
        
        <DataTable
        title="Usuários"
        headers={[
          { key: 'name', label: 'Nome' },
          { key: 'email', label: 'Email' },
          { 
            key: 'is_admin', 
            label: 'Tipo', 
            render: (isAdmin) => (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Admin' : 'Usuário'}
              </span>
            )
          },
          { 
            key: 'is_active', 
            label: 'Status', 
            render: (isActive) => (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
            )
          },
          { key: 'created_at', label: 'Criado em', render: (date) => new Date(date).toLocaleDateString() }
        ]}
        data={users.filter(user =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        actions={[
          {
            label: 'Editar',
            icon: Edit,
            onClick: (user) => {
              setEditingUser(user);
              setShowUserModal(true);
            },
            className: 'text-blue-600 bg-blue-100 hover:bg-blue-200'
          },
          {
            label: 'Alternar Status',
            icon: Activity,
            onClick: handleUserToggle,
            className: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200'
          },
          {
            label: 'Deletar',
            icon: Trash2,
            onClick: handleUserDelete,
            className: 'text-red-600 bg-red-100 hover:bg-red-200'
          }
        ]}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado"
      />
    </div>
    );
  };

  // Render orders tab content
  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Pesquisar pedidos..."
        />
        <div className="text-sm text-gray-500">
          Total: {orders.length} pedidos
        </div>
      </div>
      
      <DataTable
        title="Pedidos"
        headers={[
          { key: 'order_number', label: 'Número' },
          { key: 'user_id', label: 'Cliente', render: (userId) => userId || 'N/A' },
          { key: 'total_amount', label: 'Total', render: (total) => `R$ ${total?.toFixed(2) || '0.00'}` },
          { 
            key: 'status', 
            label: 'Status', 
            render: (status) => {
              const statusColors = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'processing': 'bg-blue-100 text-blue-800',
                'shipped': 'bg-purple-100 text-purple-800',
                'delivered': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800',
                'completed': 'bg-green-100 text-green-800'
              };
              return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  statusColors[status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {status || 'Pendente'}
                </span>
              );
            }
          },
          { 
            key: 'payment_status', 
            label: 'Pagamento', 
            render: (paymentStatus) => {
              const paymentColors = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'processing': 'bg-blue-100 text-blue-800',
                'paid': 'bg-green-100 text-green-800',
                'failed': 'bg-red-100 text-red-800',
                'refunded': 'bg-gray-100 text-gray-800'
              };
              return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  paymentColors[paymentStatus] || 'bg-gray-100 text-gray-800'
                }`}>
                  {paymentStatus || 'Pendente'}
                </span>
              );
            }
          },
          { key: 'created_at', label: 'Data', render: (date) => new Date(date).toLocaleDateString() }
        ]}
        data={orders.filter(order =>
          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        actions={[
          {
            label: 'Processar',
            icon: Activity,
            onClick: (order) => handleOrderStatusUpdate(order, 'processing'),
            className: 'text-blue-600 bg-blue-100 hover:bg-blue-200'
          },
          {
            label: 'Enviar',
            icon: Activity,
            onClick: (order) => handleOrderStatusUpdate(order, 'shipped'),
            className: 'text-purple-600 bg-purple-100 hover:bg-purple-200'
          },
          {
            label: 'Entregar',
            icon: Check,
            onClick: (order) => handleOrderStatusUpdate(order, 'delivered'),
            className: 'text-green-600 bg-green-100 hover:bg-green-200'
          },
          {
            label: 'Cancelar',
            icon: Trash2,
            onClick: handleOrderDelete,
            className: 'text-red-600 bg-red-100 hover:bg-red-200'
          }
        ]}
        loading={loading}
        emptyMessage="Nenhum pedido encontrado"
      />
    </div>
  );

  // Render blog tab content
  const renderBlogTab = () => (
    <div className="space-y-6">
      {/* Header com botão para gerenciador completo */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Posts do Blog</h3>
          <p className="text-sm text-gray-500">Visualização rápida dos posts - Use o gerenciador completo para editar</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/blog'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          Gerenciar Blog
        </button>
      </div>
      
      <DataTable
        title="Posts do Blog"
        headers={[
          { key: 'title', label: 'Título' },
          { key: 'category', label: 'Categoria' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                status === 'published' ? 'bg-green-100 text-green-800' :
                status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status === 'published' ? 'Publicado' :
                 status === 'draft' ? 'Rascunho' :
                 'Arquivado'}
              </span>
            )
          },
          { key: 'views_count', label: 'Visualizações', render: (views) => views || 0 },
          { key: 'created_at', label: 'Data', render: (date) => new Date(date).toLocaleDateString() }
        ]}
        data={blogPosts}
        actions={[
          {
            label: 'Gerenciar',
            icon: BookOpen,
            onClick: () => window.location.href = '/admin/blog',
            className: 'text-amber-600 bg-amber-100 hover:bg-amber-200'
          }
        ]}
        loading={loading}
        emptyMessage="Nenhum post encontrado"
      />
    </div>
  );

  // Render analytics tab content
  const renderAnalyticsTab = () => {
    // Calcular métricas em tempo real
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const processingOrders = orders.filter(order => order.status === 'processing').length;
    const completedOrders = orders.filter(order => order.status === 'completed' || order.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const activeProducts = products.filter(product => product.is_active).length;
    const activeUsers = users.filter(user => user.is_active).length;
    const adminUsers = users.filter(user => user.is_admin).length;

    return (
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Receita Total"
            value={`R$ ${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            color="green"
            trend={{ direction: 'up', value: '12%', label: 'vs mês anterior' }}
          />
          <StatCard
            title="Pedidos Completados"
            value={completedOrders}
            icon={ShoppingCart}
            color="blue"
            trend={{ direction: 'up', value: '8%', label: 'este mês' }}
          />
          <StatCard
            title="Produtos Ativos"
            value={activeProducts}
            icon={Package}
            color="purple"
            trend={{ direction: 'up', value: '5%', label: 'novos produtos' }}
          />
          <StatCard
            title="Usuários Ativos"
            value={activeUsers}
            icon={Users}
            color="orange"
            trend={{ direction: 'up', value: '3%', label: 'crescimento' }}
          />
        </div>

        {/* Status dos Pedidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status dos Pedidos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendentes</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${orders.length ? (pendingOrders / orders.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{pendingOrders}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processando</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${orders.length ? (processingOrders / orders.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{processingOrders}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completados</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${orders.length ? (completedOrders / orders.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{completedOrders}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Usuários</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Administradores</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${users.length ? (adminUsers / users.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{adminUsers}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuários Regulares</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${users.length ? ((users.length - adminUsers) / users.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{users.length - adminUsers}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuários Ativos</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${users.length ? (activeUsers / users.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{activeUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-500">Total Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-500">Total Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-sm text-gray-500">Total Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{blogPosts.length}</div>
              <div className="text-sm text-gray-500">Posts Blog</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.length ? ((completedOrders / orders.length) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-500">Taxa Conclusão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                R$ {orders.length ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-500">Ticket Médio</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render shipping tab
  const renderShippingTab = () => {
    return <ShippingAdmin />;
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'users':
        return renderUsersTab();
      case 'orders':
        return renderOrdersTab();
      case 'shipping':
        return renderShippingTab();
      case 'blog':
        return renderBlogTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <AdminDashboardBase
      title="Dashboard Administrativo"
      tabs={dashboardTabs}
      onTabChange={handleTabChange}
      defaultTab="overview"
      permissions={['admin']}
    >
      {renderTabContent()}
      
      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            loadProducts();
            setShowProductModal(false);
            setEditingProduct(null);
            showMessage('Produto salvo com sucesso!', 'success');
          }}
        />
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          isOpen={showUserModal}
          user={editingUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            loadUsers();
            setShowUserModal(false);
            setEditingUser(null);
            showMessage('Usuário salvo com sucesso!', 'success');
          }}
        />
      )}
    </AdminDashboardBase>
  );
};

export default AdminDashboard;