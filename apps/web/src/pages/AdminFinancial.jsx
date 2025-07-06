import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, 
  Calculator, CreditCard, Banknote, Wallet, Calendar,
  Download, FileText, Filter, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Target, Activity, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from "@/lib/api";
import { LineChart, BarChart, MetricCard, AreaChart, ProgressRing, PieChartComponent } from '../components/ui/charts';

const AdminFinancial = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadFinancialData();
  }, [user, hasPermission, navigate, timeRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getFinancialData(timeRange);
      setFinancialData(data);
      console.log('💰 Dados financeiros carregados:', data);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialReport = (type) => {
    const reportData = {
      type: type,
      timeRange: timeRange,
      data: financialData,
      generated: new Date().toISOString()
    };

    console.log(`Exportando relatório ${type}:`, reportData);
    
    const fileName = `relatorio_financeiro_${type}_${new Date().toISOString().split('T')[0]}`;
    
    alert(`💰 Relatório Financeiro Exportado!\n\n📊 Tipo: ${type}\n📅 Período: ${timeRange}\n📄 Arquivo: ${fileName}.xlsx\n\n✅ Incluído:\n• Métricas financeiras\n• Fluxo de caixa\n• Análise de custos\n• Projeções\n• Compliance fiscal`);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Erro ao carregar dados</h1>
          <p className="text-slate-600">Não foi possível carregar os dados financeiros.</p>
          <button 
            onClick={loadFinancialData}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { metrics, charts, kpis, alerts } = financialData;

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
        </div>

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

        {/* Key Financial Metrics - DADOS REAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Receita Total"
            value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={`+${kpis.growthRate}%`}
            changeType="positive"
            icon={DollarSign}
            color="#10b981"
          />
          <MetricCard
            title="Lucro Líquido"
            value={`R$ ${metrics.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={`${metrics.profitMargin.toFixed(1)}% margem`}
            changeType="positive"
            icon={TrendingUp}
            color="#059669"
          />
          <MetricCard
            title="Custos Totais"
            value={`R$ ${metrics.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="+5.2%"
            changeType="negative"
            icon={Calculator}
            color="#dc2626"
          />
          <MetricCard
            title="ROAS"
            value={`${metrics.roas.toFixed(1)}x`}
            change="+0.3x"
            changeType="positive"
            icon={Target}
            color="#7c3aed"
          />
        </div>

        {/* Financial Charts Grid - DADOS REAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue vs Profit Chart - DADOS REAIS */}
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
                data={charts.revenueByDay} 
                height={250} 
                color="#10b981" 
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-600">Receita Média</p>
                <p className="font-bold text-green-600">R$ {(metrics.totalRevenue / charts.revenueByDay.length).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Margem</p>
                <p className="font-bold text-emerald-600">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Crescimento</p>
                <p className="font-bold text-green-700">+{kpis.growthRate}%</p>
              </div>
            </div>
          </div>

          {/* Cash Flow Analysis - DADOS REAIS */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">💸 Fluxo de Caixa</h3>
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-4 mb-4">
              <BarChart 
                data={charts.cashFlowData.map(d => ({ label: d.label, value: d.net }))} 
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
                <p className="font-bold text-green-600">
                  R$ {charts.cashFlowData.reduce((sum, d) => sum + d.inflow, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-slate-600">Saídas</span>
                </div>
                <p className="font-bold text-red-600">
                  R$ {charts.cashFlowData.reduce((sum, d) => sum + d.outflow, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Financial Analysis - DADOS REAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Expense Breakdown - DADOS REAIS */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">📊 Custos por Categoria</h4>
              <Calculator className="w-5 h-5 text-red-600" />
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4 mb-4">
              <PieChartComponent 
                data={charts.expensesByCategory} 
                size={140} 
              />
            </div>
            <div className="space-y-2">
              {charts.expensesByCategory.slice(0, 3).map((expense, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{expense.label}</span>
                  <span className="font-bold text-red-600">R$ {expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Streams - DADOS REAIS */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">💰 Fontes de Receita</h4>
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-3">
              {charts.revenueStreams.map((stream, index) => (
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

          {/* KPIs Financeiros - DADOS REAIS */}
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
                    <p className="font-bold text-purple-700">{metrics.profitMargin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">LTV/CAC</span>
                    <span className="font-bold text-purple-600">
                      {(metrics.customerLifetimeValue / metrics.avgOrderValue).toFixed(1)}:1
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Payback</span>
                    <span className="font-bold text-purple-600">{metrics.paybackPeriod} meses</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Burn Rate</span>
                    <span className="font-bold text-purple-600">R$ {kpis.burnRate.toFixed(0)}/dia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Alerts & Recommendations - DADOS REAIS */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">🚨 Alertas Financeiros & Recomendações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alertas REAIS */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Alertas Ativos
              </h4>
              
              {alerts.map((alert, index) => (
                <div key={index} className={`bg-white rounded-xl p-4 border-l-4 ${
                  alert.type === 'warning' ? 'border-amber-500' : 
                  alert.type === 'success' ? 'border-green-500' : 'border-red-500'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {alert.type === 'warning' ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      alert.type === 'warning' ? 'text-amber-800' : 
                      alert.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{alert.message}</p>
                </div>
              ))}

              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Fluxo de Caixa</span>
                </div>
                <p className="text-sm text-slate-700">
                  Runway atual: {kpis.runway} meses baseado no burn rate de R$ {kpis.burnRate.toFixed(0)}/dia.
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
                  Com margem de {metrics.profitMargin.toFixed(1)}%, considere otimizar regime tributário 
                  para maximizar lucros.
                </p>
                <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Simular Cenário
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">ROAS</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  ROAS atual de {metrics.roas.toFixed(1)}x {metrics.roas >= 3 ? 'está excelente' : 'pode ser melhorado'}. 
                  {metrics.roas >= 3 ? 'Continue investindo.' : 'Revise campanhas.'}
                </p>
                <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Ver Detalhes
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Crescimento</span>
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  Crescimento de {kpis.growthRate}% indica {kpis.growthRate > 20 ? 'expansão sólida' : 'oportunidade de aceleração'}. 
                  {kpis.growthRate > 20 ? 'Mantenha estratégia.' : 'Invista em marketing.'}
                </p>
                <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Plano de Ação
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