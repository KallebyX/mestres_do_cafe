import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart, Activity, 
  Calendar, Filter, Download, Eye, Users, ShoppingCart,
  DollarSign, Target, Coffee, Star, Zap, Award
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, BarChart, MetricCard, AreaChart, ProgressRing, PieChartComponent } from '../components/ui/charts';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
  }, [user, hasPermission, navigate]);

  // Dados simulados mas realistas para analytics
  const generateAdvancedRevenueData = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        label: date.getDate().toString(),
        value: Math.floor(Math.random() * 8000) + 2000 + (i * 100),
        fullDate: date.toLocaleDateString('pt-BR')
      };
    });
    return days;
  };

  const generateConversionFunnelData = () => [
    { label: 'Visitantes', value: 12450, percentage: 100 },
    { label: 'Visualizaram Produtos', value: 8900, percentage: 71.5 },
    { label: 'Adicionaram ao Carrinho', value: 3200, percentage: 25.7 },
    { label: 'Iniciaram Checkout', value: 1800, percentage: 14.5 },
    { label: 'Concluíram Compra', value: 1350, percentage: 10.8 }
  ];

  const generateTopProductsData = () => [
    { label: 'Café Arabica Premium', value: 340, revenue: 15300 },
    { label: 'Blend Especial da Casa', value: 285, revenue: 12825 },
    { label: 'Café Orgânico Certificado', value: 220, revenue: 13200 },
    { label: 'Espresso Intenso', value: 195, revenue: 9750 },
    { label: 'Café Descafeinado', value: 150, revenue: 6750 }
  ];

  const generateTrafficSourcesData = () => [
    { label: 'Busca Orgânica', value: 45.2 },
    { label: 'Redes Sociais', value: 28.7 },
    { label: 'Direto', value: 18.5 },
    { label: 'Email Marketing', value: 4.8 },
    { label: 'Anúncios Pagos', value: 2.8 }
  ];

  const generateUserBehaviorData = () => ({
    avgSessionDuration: '4m 32s',
    bounceRate: '34.2%',
    pageViews: 156780,
    uniqueVisitors: 8940,
    returningVisitors: '42.8%',
    mobileTraffic: '67.3%'
  });

  const exportAnalytics = (type) => {
    // Simular exportação de dados
    const data = {
      revenue: generateAdvancedRevenueData(),
      products: generateTopProductsData(),
      conversion: generateConversionFunnelData(),
      traffic: generateTrafficSourcesData()
    };
    
    console.log(`Exportando dados de ${type}:`, data[type] || data);
    alert(`📊 Relatório de ${type} exportado com sucesso!\n\n✅ Dados incluídos:\n• Métricas detalhadas\n• Gráficos e tendências\n• Insights automáticos\n\nArquivo: analytics_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!user || !hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
          <p className="text-slate-600">Você precisa de permissões de administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-slate-900">📊 Analytics Avançados</h1>
              </div>
              <p className="text-xl text-slate-600">
                Insights completos sobre performance, vendas e comportamento dos usuários
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
              <button
                onClick={() => exportAnalytics('complete')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Completo
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value="R$ 127.350"
            change="+23.5%"
            changeType="positive"
            icon={DollarSign}
            color="#10b981"
          />
          <MetricCard
            title="Conversão Geral"
            value="10.8%"
            change="+2.1%"
            changeType="positive"
            icon={Target}
            color="#3b82f6"
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 94.30"
            change="+15.7%"
            changeType="positive"
            icon={TrendingUp}
            color="#8b5cf6"
          />
          <MetricCard
            title="ROAS"
            value="4.2x"
            change="+0.8x"
            changeType="positive"
            icon={Zap}
            color="#f59e0b"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">💰 Tendência de Receita</h3>
              <button
                onClick={() => exportAnalytics('revenue')}
                className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4 mb-4">
              <LineChart 
                data={generateAdvancedRevenueData()} 
                height={250} 
                color="#10b981" 
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-600">Média Diária</p>
                <p className="font-bold text-green-600">R$ 4.245</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Pico</p>
                <p className="font-bold text-green-700">R$ 8.920</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Crescimento</p>
                <p className="font-bold text-emerald-600">+23.5%</p>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">🎯 Funil de Conversão</h3>
              <button
                onClick={() => exportAnalytics('conversion')}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-4">
              <div className="space-y-4">
                {generateConversionFunnelData().map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{step.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-600">{step.value.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 ml-2">({step.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                        style={{ width: `${step.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">🏆 Top Produtos</h4>
              <Coffee className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              {generateTopProductsData().map((product, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{product.label}</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{product.value} vendas</span>
                    <span className="font-bold text-amber-600">R$ {product.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(product.value / 340) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">📱 Fontes de Tráfego</h4>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="bg-white rounded-xl border border-purple-200 p-4 mb-4">
              <PieChartComponent 
                data={generateTrafficSourcesData()} 
                size={140} 
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Total de Sessões</p>
              <p className="text-xl font-bold text-purple-600">24.657</p>
            </div>
          </div>

          {/* User Behavior */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">👥 Comportamento</h4>
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="space-y-4">
              {Object.entries(generateUserBehaviorData()).map(([key, value], index) => {
                const labels = {
                  avgSessionDuration: 'Duração Média',
                  bounceRate: 'Taxa de Rejeição',
                  pageViews: 'Visualizações',
                  uniqueVisitors: 'Visitantes Únicos',
                  returningVisitors: 'Visitantes Recorrentes',
                  mobileTraffic: 'Tráfego Mobile'
                };
                return (
                  <div key={index} className="bg-white rounded-lg p-3 border border-cyan-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{labels[key]}</span>
                      <span className="font-bold text-cyan-600">{value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Advanced Insights */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">🤖 Insights Automáticos Avançados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-slate-900">📈 Oportunidade Detectada</h4>
                </div>
                <p className="text-slate-700 mb-3">
                  O <strong>Café Arabica Premium</strong> teve um aumento de 45% nas vendas. 
                  Considere aumentar o estoque e criar uma campanha focada.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  Impacto estimado: +R$ 8.500/mês
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <h4 className="font-semibold text-slate-900">⚠️ Atenção Requerida</h4>
                </div>
                <p className="text-slate-700 mb-3">
                  Taxa de abandono no checkout aumentou 12%. Revisar processo de pagamento 
                  e implementar recuperação de carrinho.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Target className="w-4 h-4" />
                  Perda estimada: -R$ 3.200/mês
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-slate-900">🎯 Recomendação</h4>
                </div>
                <p className="text-slate-700 mb-3">
                  Visitantes mobile têm maior taxa de conversão (12.4% vs 9.1%). 
                  Priorizar experiência mobile pode aumentar vendas significativamente.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Award className="w-4 h-4" />
                  Potencial: +R$ 12.800/mês
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-semibold text-slate-900">📊 Trend Analysis</h4>
                </div>
                <p className="text-slate-700 mb-3">
                  Cafés orgânicos estão em alta (+28% em pesquisas). Expandir linha 
                  orgânica pode capturar nova demanda de mercado.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Star className="w-4 h-4" />
                  Crescimento projetado: +35%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={() => exportAnalytics('insights')}
              className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar Relatório Completo de Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 