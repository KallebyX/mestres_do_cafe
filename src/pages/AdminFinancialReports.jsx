import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, 
  Calendar, Download, Filter, RefreshCw, Target, Activity,
  Package, Users, ShoppingCart, CreditCard, Wallet, Calculator,
  ArrowUpRight, ArrowDownRight, Eye, FileText, AlertCircle
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminFinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('revenue');
  const [financialData, setFinancialData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadFinancialData();
  }, [user, hasPermission, navigate, dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Dados mock financeiros avançados
      const mockData = {
        revenue: {
          total: 45670.80,
          monthly: 12890.25,
          daily: 423.50,
          growth: 15.8,
          monthlyGrowth: 8.5,
          dailyGrowth: -2.1
        },
        costs: {
          total: 28950.30,
          monthly: 8100.45,
          cogs: 18200.15, // Cost of Goods Sold
          operational: 7850.20,
          marketing: 2899.95,
          growth: 12.3
        },
        profit: {
          total: 16720.50,
          monthly: 4789.80,
          margin: 36.6,
          grossMargin: 60.1,
          netMargin: 36.6,
          growth: 22.1
        },
        orders: {
          total: 324,
          monthly: 89,
          avgValue: 140.95,
          completionRate: 96.8,
          growth: 18.7
        },
        products: {
          bestSelling: [
            { name: 'Café Especial Premium', revenue: 8950.00, quantity: 156, margin: 42.5 },
            { name: 'Blend Tradicional', revenue: 6780.25, quantity: 203, margin: 38.2 },
            { name: 'Café Gourmet Moído', revenue: 5630.80, quantity: 98, margin: 45.1 },
            { name: 'Espresso Artesanal', revenue: 4920.15, quantity: 87, margin: 48.3 },
            { name: 'Cold Brew Premium', revenue: 3890.60, quantity: 75, margin: 52.8 }
          ],
          categories: [
            { name: 'Cafés Especiais', revenue: 18940.65, percentage: 41.5, growth: 18.9 },
            { name: 'Blends Tradicionais', revenue: 12680.30, percentage: 27.8, growth: 12.4 },
            { name: 'Cafés Gourmet', revenue: 8950.45, percentage: 19.6, growth: 25.7 },
            { name: 'Acessórios', revenue: 5099.40, percentage: 11.1, growth: 8.2 }
          ]
        },
        customers: {
          acquisition: {
            cost: 45.80,
            ltv: 890.50,
            ratio: 19.4
          },
          retention: 78.5,
          churnRate: 12.8
        },
        cashFlow: {
          inflow: 45670.80,
          outflow: 28950.30,
          balance: 16720.50,
          projection30d: 22450.75
        },
        kpis: {
          roas: 4.2, // Return on Ad Spend
          roi: 78.5, // Return on Investment
          cac: 45.80, // Customer Acquisition Cost
          ltv: 890.50, // Lifetime Value
          arpu: 156.80, // Average Revenue Per User
          churnRate: 12.8,
          grossMargin: 60.1,
          netMargin: 36.6
        }
      };

      setFinancialData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setRefreshing(false);
  };

  const handleExport = () => {
    alert('Exportando relatório financeiro... (funcionalidade em desenvolvimento)');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' },
    { value: 'custom', label: 'Personalizado' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-slate-900">Relatórios Financeiros</h1>
              </div>
              <p className="text-xl text-slate-600">
                Análise completa de receitas, custos e lucratividade
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExport}
                className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 ${getGrowthColor(financialData.revenue?.growth)}`}>
                {getGrowthIcon(financialData.revenue?.growth)}
                <span className="text-sm font-medium">
                  {financialData.revenue?.growth > 0 ? '+' : ''}{financialData.revenue?.growth}%
                </span>
              </div>
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Receita Total</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(financialData.revenue?.total || 0)}
            </p>
            <p className="text-xs text-slate-500">
              Mensal: {formatCurrency(financialData.revenue?.monthly || 0)}
            </p>
          </div>

          {/* Profit */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 ${getGrowthColor(financialData.profit?.growth)}`}>
                {getGrowthIcon(financialData.profit?.growth)}
                <span className="text-sm font-medium">
                  {financialData.profit?.growth > 0 ? '+' : ''}{financialData.profit?.growth}%
                </span>
              </div>
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Lucro Líquido</h3>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(financialData.profit?.total || 0)}
            </p>
            <p className="text-xs text-slate-500">
              Margem: {financialData.profit?.margin}%
            </p>
          </div>

          {/* Costs */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Calculator className="text-white w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 ${getGrowthColor(financialData.costs?.growth)}`}>
                {getGrowthIcon(financialData.costs?.growth)}
                <span className="text-sm font-medium">
                  {financialData.costs?.growth > 0 ? '+' : ''}{financialData.costs?.growth}%
                </span>
              </div>
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Custos Totais</h3>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(financialData.costs?.total || 0)}
            </p>
            <p className="text-xs text-slate-500">
              COGS: {formatCurrency(financialData.costs?.cogs || 0)}
            </p>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="text-white w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 ${getGrowthColor(financialData.orders?.growth)}`}>
                {getGrowthIcon(financialData.orders?.growth)}
                <span className="text-sm font-medium">
                  {financialData.orders?.growth > 0 ? '+' : ''}{financialData.orders?.growth}%
                </span>
              </div>
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Pedidos</h3>
            <p className="text-3xl font-bold text-blue-600">{financialData.orders?.total || 0}</p>
            <p className="text-xs text-slate-500">
              Ticket: {formatCurrency(financialData.orders?.avgValue || 0)}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'revenue', label: 'Receitas', icon: DollarSign },
                { id: 'costs', label: 'Custos', icon: Calculator },
                { id: 'products', label: 'Produtos', icon: Package },
                { id: 'kpis', label: 'KPIs', icon: Target }
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Financeiro</h3>
                  
                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Cash Flow */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Fluxo de Caixa</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Entradas</span>
                          <span className="text-green-600 font-semibold">
                            {formatCurrency(financialData.cashFlow?.inflow || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Saídas</span>
                          <span className="text-red-600 font-semibold">
                            {formatCurrency(financialData.cashFlow?.outflow || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                          <span className="text-slate-900 font-semibold">Saldo</span>
                          <span className="text-emerald-600 font-bold text-lg">
                            {formatCurrency(financialData.cashFlow?.balance || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Projeção 30d</span>
                          <span className="text-blue-600 font-semibold">
                            {formatCurrency(financialData.cashFlow?.projection30d || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Margin Analysis */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Análise de Margem</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Margem Bruta</span>
                          <span className="text-emerald-600 font-semibold">
                            {financialData.kpis?.grossMargin}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Margem Líquida</span>
                          <span className="text-emerald-600 font-semibold">
                            {financialData.kpis?.netMargin}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">ROAS</span>
                          <span className="text-blue-600 font-semibold">
                            {financialData.kpis?.roas}x
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">ROI</span>
                          <span className="text-purple-600 font-semibold">
                            {financialData.kpis?.roi}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Products */}
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Top 5 Produtos por Receita</h4>
                    <div className="space-y-3">
                      {financialData.products?.bestSelling?.map((product, index) => (
                        <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-slate-900">{product.name}</h5>
                              <p className="text-slate-600 text-sm">{product.quantity} unidades vendidas</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-600 font-bold text-lg">
                                {formatCurrency(product.revenue)}
                              </p>
                              <p className="text-slate-600 text-sm">
                                Margem: {product.margin}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Análise de Receitas</h3>
                
                {/* Revenue by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Receita por Categoria</h4>
                    <div className="space-y-4">
                      {financialData.products?.categories?.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-700">{category.name}</span>
                            <div className="text-right">
                              <span className="text-slate-900 font-semibold">
                                {formatCurrency(category.revenue)}
                              </span>
                              <span className="text-slate-500 text-sm ml-2">
                                ({category.percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Crescimento</span>
                            <span className={`font-semibold ${getGrowthColor(category.growth)}`}>
                              {category.growth > 0 ? '+' : ''}{category.growth}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Gráfico de Receita</h4>
                    <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Gráfico de receita mensal</p>
                        <p className="text-sm text-slate-500">Em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Costs Tab */}
            {activeTab === 'costs' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Análise de Custos</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cost Breakdown */}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Distribuição de Custos</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Custo dos Produtos (COGS)</span>
                        <span className="text-red-600 font-semibold">
                          {formatCurrency(financialData.costs?.cogs || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Custos Operacionais</span>
                        <span className="text-orange-600 font-semibold">
                          {formatCurrency(financialData.costs?.operational || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Marketing</span>
                        <span className="text-purple-600 font-semibold">
                          {formatCurrency(financialData.costs?.marketing || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                        <span className="text-slate-900 font-semibold">Total</span>
                        <span className="text-slate-900 font-bold text-lg">
                          {formatCurrency(financialData.costs?.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Evolução dos Custos</h4>
                    <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Gráfico de custos</p>
                        <p className="text-sm text-slate-500">Em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Performance de Produtos</h3>
                
                <div className="space-y-6">
                  {financialData.products?.bestSelling?.map((product, index) => (
                    <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">{product.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-slate-600 text-sm">Receita</p>
                              <p className="text-green-600 font-bold text-xl">
                                {formatCurrency(product.revenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600 text-sm">Unidades</p>
                              <p className="text-blue-600 font-bold text-xl">{product.quantity}</p>
                            </div>
                            <div>
                              <p className="text-slate-600 text-sm">Margem</p>
                              <p className="text-purple-600 font-bold text-xl">{product.margin}%</p>
                            </div>
                            <div>
                              <p className="text-slate-600 text-sm">Preço Médio</p>
                              <p className="text-amber-600 font-bold text-xl">
                                {formatCurrency(product.revenue / product.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                            #{index + 1} mais vendido
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs Tab */}
            {activeTab === 'kpis' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Indicadores Chave de Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { 
                      title: 'CAC', 
                      value: formatCurrency(financialData.kpis?.cac || 0),
                      description: 'Custo de Aquisição de Cliente',
                      color: 'bg-red-100 text-red-800',
                      icon: Users
                    },
                    { 
                      title: 'LTV', 
                      value: formatCurrency(financialData.kpis?.ltv || 0),
                      description: 'Lifetime Value',
                      color: 'bg-green-100 text-green-800',
                      icon: Target
                    },
                    { 
                      title: 'LTV/CAC', 
                      value: `${(financialData.kpis?.ltv / financialData.kpis?.cac).toFixed(1)}x`,
                      description: 'Razão LTV/CAC',
                      color: 'bg-blue-100 text-blue-800',
                      icon: Calculator
                    },
                    { 
                      title: 'ARPU', 
                      value: formatCurrency(financialData.kpis?.arpu || 0),
                      description: 'Receita Média por Usuário',
                      color: 'bg-purple-100 text-purple-800',
                      icon: DollarSign
                    },
                    { 
                      title: 'Churn Rate', 
                      value: `${financialData.kpis?.churnRate}%`,
                      description: 'Taxa de Churn',
                      color: 'bg-orange-100 text-orange-800',
                      icon: TrendingDown
                    },
                    { 
                      title: 'ROI', 
                      value: `${financialData.kpis?.roi}%`,
                      description: 'Retorno sobre Investimento',
                      color: 'bg-emerald-100 text-emerald-800',
                      icon: TrendingUp
                    }
                  ].map((kpi, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>
                          <kpi.icon className="w-6 h-6" />
                        </div>
                        <AlertCircle className="w-5 h-5 text-slate-400" />
                      </div>
                      <h4 className="text-slate-700 font-medium mb-2">{kpi.title}</h4>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</p>
                      <p className="text-xs text-slate-500">{kpi.description}</p>
                    </div>
                  ))}
                </div>

                {/* KPI Insights */}
                <div className="mt-8 bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Insights dos KPIs</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-slate-700">
                        <strong>LTV/CAC de {(financialData.kpis?.ltv / financialData.kpis?.cac).toFixed(1)}x</strong> indica boa saúde financeira 
                        (ideal: 3x ou mais)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-slate-700">
                        <strong>Margem líquida de {financialData.kpis?.netMargin}%</strong> está acima da média do setor
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <p className="text-slate-700">
                        <strong>Churn rate de {financialData.kpis?.churnRate}%</strong> pode ser melhorado com estratégias de retenção
                      </p>
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

export default AdminFinancialReports; 