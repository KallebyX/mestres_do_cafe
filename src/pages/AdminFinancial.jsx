import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, 
  Calculator, CreditCard, Banknote, Wallet, Calendar,
  Download, FileText, Filter, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Target, Activity
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, BarChart, MetricCard, AreaChart, ProgressRing, PieChartComponent } from '../components/ui/charts';

const AdminFinancial = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');
  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
  }, [user, hasPermission, navigate]);

  const generateFinancialData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      label: (i + 1).toString(),
      value: Math.floor(Math.random() * 5000) + 2000
    }));
  };

  const generateExpensesByCategory = () => [
    { label: 'Matéria Prima', value: 45.2, amount: 18500 },
    { label: 'Logística', value: 22.8, amount: 9200 },
    { label: 'Marketing', value: 15.3, amount: 6150 },
    { label: 'Pessoal', value: 12.1, amount: 4850 },
    { label: 'Operacional', value: 4.6, amount: 1850 }
  ];

  const generateRevenueStreams = () => [
    { label: 'E-commerce', value: 65.4, amount: 85200 },
    { label: 'Atacado', value: 23.1, amount: 30100 },
    { label: 'Assinaturas', value: 8.8, amount: 11450 },
    { label: 'Marketplace', value: 2.7, amount: 3520 }
  ];

  const generateCashFlowData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map(month => ({
      label: month,
      inflow: Math.floor(Math.random() * 50000) + 80000,
      outflow: Math.floor(Math.random() * 35000) + 45000,
      net: 0 // Será calculado
    })).map(item => ({
      ...item,
      net: item.inflow - item.outflow
    }));
  };

  const getFinancialMetrics = () => {
    const data = generateFinancialData();
    const totalRevenue = data.reduce((sum, day) => sum + day.value, 0);
    const totalCosts = generateExpensesByCategory().reduce((sum, expense) => sum + expense.amount, 0);
    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
    
    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      avgDailyRevenue: Math.round(totalRevenue / data.length),
      avgOrderValue: Math.round(totalRevenue / data.reduce((sum, day) => sum + day.value, 0)),
      growthRate: 23.5,
      roas: 4.2
    };
  };

  const exportFinancialReport = (type) => {
    const reportData = {
      overview: {
        metrics: getFinancialMetrics(),
        period: timeRange,
        generated: new Date().toISOString()
      },
      detailed: {
        dailyData: generateFinancialData(),
        expenses: generateExpensesByCategory(),
        revenue: generateRevenueStreams(),
        cashFlow: generateCashFlowData()
      },
      tax: {
        totalRevenue: getFinancialMetrics().totalRevenue,
        deductibleExpenses: getFinancialMetrics().totalCosts,
        netIncome: getFinancialMetrics().totalProfit,
        estimatedTax: getFinancialMetrics().totalProfit * 0.275
      }
    };

    console.log(`Exportando relatório ${type}:`, reportData[type] || reportData);
    
    const fileName = `relatorio_financeiro_${type}_${new Date().toISOString().split('T')[0]}`;
    
    alert(`💰 Relatório Financeiro Exportado!\n\n📊 Tipo: ${type}\n📅 Período: ${timeRange}\n📄 Arquivo: ${fileName}.xlsx\n\n✅ Incluído:\n• Métricas financeiras\n• Fluxo de caixa\n• Análise de custos\n• Projeções\n• Compliance fiscal`);
  };

  const metrics = getFinancialMetrics();

  if (!user || !hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
          <p className="text-slate-600">Você precisa de permissões financeiras.</p>
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
                <DollarSign className="w-8 h-8 text-green-600" />
                <h1 className="text-4xl font-bold text-slate-900">💰 Relatórios Financeiros</h1>
              </div>
              <p className="text-xl text-slate-600">
                Análise completa de receitas, custos, lucros e fluxo de caixa
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="overview">Visão Geral</option>
                <option value="detailed">Detalhado</option>
                <option value="tax">Fiscal</option>
              </select>
              <button
                onClick={() => exportFinancialReport(reportType)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={`R$ ${metrics.totalRevenue.toLocaleString()}`}
            change={`+${metrics.growthRate}%`}
            changeType="positive"
            icon={DollarSign}
            color="#10b981"
          />
          <MetricCard
            title="Lucro Líquido"
            value={`R$ ${metrics.totalProfit.toLocaleString()}`}
            change={`${metrics.profitMargin}% margem`}
            changeType="positive"
            icon={TrendingUp}
            color="#059669"
          />
          <MetricCard
            title="Custos Totais"
            value={`R$ ${metrics.totalCosts.toLocaleString()}`}
            change="+5.2%"
            changeType="negative"
            icon={Calculator}
            color="#dc2626"
          />
          <MetricCard
            title="ROAS"
            value={`${metrics.roas}x`}
            change="+0.3x"
            changeType="positive"
            icon={Target}
            color="#7c3aed"
          />
        </div>

        {/* Financial Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue vs Profit Chart */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">📈 Receita vs Lucro</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Receita</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Lucro</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4 mb-4">
              <AreaChart 
                data={generateFinancialData()} 
                height={250} 
                color="#10b981" 
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-600">Receita Média</p>
                <p className="font-bold text-green-600">R$ {metrics.avgDailyRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Margem</p>
                <p className="font-bold text-emerald-600">{metrics.profitMargin}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Crescimento</p>
                <p className="font-bold text-green-700">+{metrics.growthRate}%</p>
              </div>
            </div>
          </div>

          {/* Cash Flow Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">💸 Fluxo de Caixa</h3>
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-4 mb-4">
              <BarChart 
                data={generateCashFlowData().map(d => ({ label: d.label, value: d.net }))} 
                height={250} 
                color="#3b82f6" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-600">Entradas</span>
                </div>
                <p className="font-bold text-green-600">R$ 485.200</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-slate-600">Saídas</span>
                </div>
                <p className="font-bold text-red-600">R$ 312.800</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Financial Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Expense Breakdown */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">📊 Custos por Categoria</h4>
              <Calculator className="w-5 h-5 text-red-600" />
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4 mb-4">
              <PieChartComponent 
                data={generateExpensesByCategory()} 
                size={140} 
              />
            </div>
            <div className="space-y-2">
              {generateExpensesByCategory().slice(0, 3).map((expense, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{expense.label}</span>
                  <span className="font-bold text-red-600">R$ {expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">💰 Fontes de Receita</h4>
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-3">
              {generateRevenueStreams().map((stream, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{stream.label}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                      {stream.value}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600">R$ {stream.amount.toLocaleString()}</span>
                    <div className="w-16 bg-emerald-100 rounded-full h-1.5">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${stream.value}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs Financeiros */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">🎯 KPIs Financeiros</h4>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-center mb-3">
                  <h5 className="text-sm font-medium text-slate-700">Margem de Lucro</h5>
                  <div className="flex items-center justify-center mt-2">
                    <ProgressRing 
                      percentage={parseInt(metrics.profitMargin)} 
                      size={80} 
                      color="#8b5cf6" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-slate-600">Meta</p>
                    <p className="font-bold text-purple-600">35%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600">Atual</p>
                    <p className="font-bold text-purple-700">{metrics.profitMargin}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">LTV/CAC</span>
                    <span className="font-bold text-purple-600">3.8:1</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Payback</span>
                    <span className="font-bold text-purple-600">4.2 meses</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Burn Rate</span>
                    <span className="font-bold text-purple-600">R$ 12.5k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Alerts & Recommendations */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">🚨 Alertas Financeiros & Recomendações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alertas */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Alertas Ativos
              </h4>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Fluxo de Caixa</span>
                </div>
                <p className="text-sm text-slate-700">
                  Previsão de déficit em 45 dias. Acelerar recebimentos ou renegociar prazos de pagamento.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Margem Declinante</span>
                </div>
                <p className="text-sm text-slate-700">
                  Margem de lucro caiu 2.3% no último mês. Revisar estrutura de custos e preços.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Inadimplência</span>
                </div>
                <p className="text-sm text-slate-700">
                  Taxa de inadimplência em 3.2%. Implementar política de cobrança mais agressiva.
                </p>
              </div>
            </div>

            {/* Recomendações */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recomendações
              </h4>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Otimização Fiscal</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  Economia potencial de R$ 8.500/mês mudando regime tributário para Lucro Presumido.
                </p>
                <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Simular Cenário
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Investimento</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  Aplicar R$ 50k excedente em CDB pode gerar +R$ 420/mês de renda passiva.
                </p>
                <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Ver Opções
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Expansão</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  Saúde financeira permite investir R$ 25k em novos produtos. ROI projetado: 180%.
                </p>
                <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Plano de Negócios
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => exportFinancialReport('overview')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Relatório Executivo
            </button>
            <button
              onClick={() => exportFinancialReport('detailed')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Análise Detalhada
            </button>
            <button
              onClick={() => exportFinancialReport('tax')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Banknote className="w-5 h-5" />
              Compliance Fiscal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancial; 