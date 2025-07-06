import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, Banknote, 
  Calendar, Filter, Download, Plus, Search, Eye, Edit, Trash2,
  ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, AlertCircle,
  PieChart, BarChart3, Receipt, Building2, Wallet, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LineChartComponent, 
  AreaChartComponent, 
  BarChartComponent, 
  PieChartComponent,
  MetricCard,
  formatCurrency as formatChartCurrency 
} from '../components/AdvancedCharts';
import { FinancialReport } from '../components/PDFReports';
import { financialAPI } from "../lib/api.js"
import FinancialModal from '../components/FinancialModal';
import { useNotifications } from '../contexts/NotificationContext';

const AdminFinanceiroDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('30d');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para diferentes módulos
  const [contasReceber, setContasReceber] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [fluxoCaixa, setFluxoCaixa] = useState([]);
  const [bancos, setBancos] = useState([]);

  const { user, hasPermission } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  const navigate = useNavigate();

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [modalType, setModalType] = useState('receivable'); // 'receivable', 'payable', 'bank'
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadFinancialData();
  }, [user, hasPermission, navigate, activeTab]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Carregar dados reais do Supabase
      const [receivablesResult, payablesResult, accountsResult, summaryResult] = await Promise.all([
        financialAPI.getAccountsReceivable({ status: null }),
        financialAPI.getAccountsPayable({ status: null }),
        financialAPI.getBankAccounts(),
        financialAPI.getFinancialSummary()
      ]);

      // Contas a Receber - APENAS DADOS REAIS
      if (receivablesResult.success) {
        setContasReceber(receivablesResult.data?.map(item => ({
          id: item.id,
          cliente: item.customer?.name || 'Cliente não informado',
          valor: parseFloat(item.amount),
          vencimento: item.due_date,
          status: item.status,
          parcela: item.installment || '1/1',
          tipo: 'venda'
        })) || []);
        console.log(`✅ ${receivablesResult.data?.length || 0} contas a receber carregadas do Supabase`);
      } else {
        console.log('⚠️ Tabela accounts_receivable não encontrada ou vazia');
        setContasReceber([]);
      }

      // Contas a Pagar - APENAS DADOS REAIS
      if (payablesResult.success) {
        setContasPagar(payablesResult.data?.map(item => ({
          id: item.id,
          fornecedor: item.supplier?.name || 'Fornecedor não informado',
          valor: parseFloat(item.amount),
          vencimento: item.due_date,
          status: item.status,
          categoria: item.category?.name || 'Geral',
          tipo: 'compra'
        })) || []);
        console.log(`✅ ${payablesResult.data?.length || 0} contas a pagar carregadas do Supabase`);
      } else {
        console.log('⚠️ Tabela accounts_payable não encontrada ou vazia');
        setContasPagar([]);
      }

      // Contas Bancárias - APENAS DADOS REAIS
      if (accountsResult.success) {
        setBancos(accountsResult.data?.map(account => ({
          id: account.id,
          banco: account.bank_name,
          agencia: account.agency,
          conta: account.account_number,
          saldo: parseFloat(account.current_balance || 0),
          tipo: account.account_type
        })) || []);
        console.log(`✅ ${accountsResult.data?.length || 0} contas bancárias carregadas do Supabase`);
      } else {
        console.log('⚠️ Tabela bank_accounts não encontrada ou vazia');
        setBancos([]);
      }

      // Para módulos ainda não implementados, deixar vazio até terem tabelas reais
      setFluxoCaixa([]);
      
      setSuccess('Dados financeiros carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados financeiros:', error);
      
      // Em caso de erro, garantir arrays vazios
      setContasReceber([]);
      setContasPagar([]);
      setBancos([]);
      setFluxoCaixa([]);
      
      setError('Erro ao carregar dados financeiros');
      notifyError('❌ Erro Financeiro', 'Erro ao carregar dados do módulo financeiro');
    } finally {
      setLoading(false);
    }
  };

  // Funções CRUD
  const handleCreate = (type) => {
    setModalType(type);
    setModalMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setModalMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleView = (item, type) => {
    setModalType(type);
    setModalMode('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        console.log(`Excluindo ${type} com ID:`, id);
        
        let result;
        if (type === 'receivable') {
          // Deletar conta a receber (soft delete - marcar como inativa)
          result = await financialAPI.updateAccountReceivable(id, { is_active: false });
          if (result.success) {
            notifySuccess('✅ Conta a Receber Excluída', 'Conta excluída com sucesso');
          }
        } else if (type === 'payable') {
          // Deletar conta a pagar (soft delete - marcar como inativa)
          result = await financialAPI.updateAccountPayable(id, { is_active: false });
          if (result.success) {
            notifySuccess('✅ Conta a Pagar Excluída', 'Conta excluída com sucesso');
          }
        } else if (type === 'bank') {
          // Deletar conta bancária (soft delete - marcar como inativa)
          result = await financialAPI.updateBankAccount(id, { is_active: false });
          if (result.success) {
            notifySuccess('✅ Conta Bancária Excluída', 'Conta excluída com sucesso');
          }
        }
        
        if (result && !result.success) {
          throw new Error(result.error);
        }
        
        // Recarregar dados após exclusão
        loadFinancialData();
      } catch (error) {
        console.error('Erro ao excluir no Supabase:', error);
        notifyError('❌ Erro', `Erro ao excluir: ${error.message}`);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      console.log('Salvando dados no Supabase:', formData);
      
      if (modalMode === 'create') {
        // Criar novo item no Supabase
        if (modalType === 'receivable') {
          const receivableData = {
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date,
            status: formData.status,
            installment: formData.installment,
            description: formData.description,
            type: 'sale'
          };
          
          const result = await financialAPI.createAccountReceivable(receivableData);
          if (result.success) {
            notifySuccess('✅ Conta a Receber Criada', 'Conta criada com sucesso no banco de dados');
            loadFinancialData(); // Recarregar dados
          } else {
            throw new Error(result.error);
          }
        } else if (modalType === 'payable') {
          const payableData = {
            supplier_name: formData.supplier_name,
            supplier_email: formData.supplier_email,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date,
            status: formData.status,
            category: formData.category,
            description: formData.description,
            type: 'purchase'
          };
          
          const result = await financialAPI.createAccountPayable(payableData);
          if (result.success) {
            notifySuccess('✅ Conta a Pagar Criada', 'Conta criada com sucesso no banco de dados');
            loadFinancialData(); // Recarregar dados
          } else {
            throw new Error(result.error);
          }
        } else if (modalType === 'bank') {
          const bankData = {
            name: `${formData.bank_name} - ${formData.account_number}`,
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            agency: formData.agency,
            account_type: formData.account_type,
            current_balance: parseFloat(formData.current_balance),
            is_active: true
          };
          
          const result = await financialAPI.createBankAccount(bankData);
          if (result.success) {
            notifySuccess('✅ Conta Bancária Criada', 'Conta criada com sucesso no banco de dados');
            loadFinancialData(); // Recarregar dados
          } else {
            throw new Error(result.error);
          }
        }
      } else if (modalMode === 'edit') {
        // Editar item existente no Supabase
        if (modalType === 'receivable') {
          const updates = {
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date,
            status: formData.status,
            installment: formData.installment,
            description: formData.description
          };
          
          const result = await financialAPI.updateAccountReceivable(selectedItem.id, updates);
          if (result.success) {
            notifySuccess('✅ Conta Atualizada', 'Conta atualizada com sucesso no banco de dados');
            loadFinancialData(); // Recarregar dados
          } else {
            throw new Error(result.error);
          }
        } else if (modalType === 'payable') {
          const updates = {
            supplier_name: formData.supplier_name,
            supplier_email: formData.supplier_email,
            amount: parseFloat(formData.amount),
            due_date: formData.due_date,
            status: formData.status,
            category: formData.category,
            description: formData.description
          };
          
          const result = await financialAPI.updateAccountPayable(selectedItem.id, updates);
          if (result.success) {
            notifySuccess('✅ Conta Atualizada', 'Conta atualizada com sucesso no banco de dados');
            loadFinancialData(); // Recarregar dados
          } else {
            throw new Error(result.error);
          }
        } else if (modalType === 'bank') {
          const updates = {
            name: `${formData.bank_name} - ${formData.account_number}`,
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            agency: formData.agency,
            account_type: formData.account_type,
            current_balance: parseFloat(formData.current_balance)
          };
          
          const result = await financialAPI.updateBankAccount(selectedItem.id, updates);
          if (result.success) {
            notifySuccess('✅ Conta Atualizada', 'Conta bancária atualizada com sucesso');
            loadFinancialData(); // Recarregar dados
          } else {
            throw new Error(result.error);
          }
        }
      }
      
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      notifyError('❌ Erro', `Erro ao salvar: ${error.message}`);
      throw error;
    }
  };

  // Cálculos resumidos - com verificações de segurança
  const totalReceber = Array.isArray(contasReceber) ? contasReceber.reduce((sum, conta) => sum + (conta?.valor || 0), 0) : 0;
  const totalPagar = Array.isArray(contasPagar) ? contasPagar.reduce((sum, conta) => sum + (conta?.valor || 0), 0) : 0;
  const saldoBancos = Array.isArray(bancos) ? bancos.reduce((sum, banco) => sum + (banco?.saldo || 0), 0) : 0;
  const saldoLiquido = totalReceber - totalPagar;

  const getStatusColor = (status) => {
    switch (status) {
      case 'recebido':
      case 'pago':
        return 'text-green-600 bg-green-50';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-50';
      case 'vencido':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 text-sm font-medium">Contas a Receber</span>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{formatCurrency(totalReceber)}</h3>
          <p className="text-green-600 text-sm">{contasReceber.length} títulos</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-700 text-sm font-medium">Contas a Pagar</span>
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-1">{formatCurrency(totalPagar)}</h3>
          <p className="text-red-600 text-sm">{contasPagar.length} títulos</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-700 text-sm font-medium">Saldo em Bancos</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{formatCurrency(saldoBancos)}</h3>
          <p className="text-blue-600 text-sm">{bancos.length} contas</p>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 ${
          saldoLiquido >= 0 
            ? 'from-brand-brown/10 to-amber-100 border-brand-brown/20' 
            : 'from-red-50 to-rose-100 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              saldoLiquido >= 0 ? 'bg-brand-brown' : 'bg-red-500'
            }`}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className={`text-sm font-medium ${
              saldoLiquido >= 0 ? 'text-brand-brown' : 'text-red-700'
            }`}>Saldo Líquido</span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${
            saldoLiquido >= 0 ? 'text-brand-brown' : 'text-red-900'
          }`}>{formatCurrency(saldoLiquido)}</h3>
          <p className={`text-sm ${
            saldoLiquido >= 0 ? 'text-brand-brown/70' : 'text-red-600'
          }`}>{saldoLiquido >= 0 ? 'Positivo' : 'Negativo'}</p>
        </div>
      </div>

      {/* Gráfico de Fluxo de Caixa Avançado */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Fluxo de Caixa - Últimos 7 dias</h3>
          <FinancialReport 
            data={{
              totalReceivables: totalReceber,
              totalPayables: totalPagar,
              totalBalance: saldoBancos,
              netResult: saldoLiquido,
              accountsReceivable: contasReceber,
              accountsPayable: contasPagar
            }}
            period={{
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
              end: new Date().toLocaleDateString('pt-BR')
            }}
          />
        </div>
        
        <AreaChartComponent
          data={fluxoCaixa}
          height={300}
          areas={[
            { dataKey: 'entradas', name: 'Entradas', color: '#10b981' },
            { dataKey: 'saidas', name: 'Saídas', color: '#ef4444' }
          ]}
          formatter={formatChartCurrency}
        />
      </div>

      {/* Análise Financeira com Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Status das Contas</h3>
          <PieChartComponent
            data={[
              { 
                name: 'Pendente', 
                value: (Array.isArray(contasReceber) ? contasReceber.filter(c => c?.status === 'pendente').length : 0) + 
                       (Array.isArray(contasPagar) ? contasPagar.filter(c => c?.status === 'pendente').length : 0)
              },
              { 
                name: 'Pago/Recebido', 
                value: (Array.isArray(contasReceber) ? contasReceber.filter(c => c?.status === 'recebido').length : 0) + 
                       (Array.isArray(contasPagar) ? contasPagar.filter(c => c?.status === 'pago').length : 0)
              },
              { 
                name: 'Vencido', 
                value: (Array.isArray(contasReceber) ? contasReceber.filter(c => c?.status === 'vencido').length : 0) + 
                       (Array.isArray(contasPagar) ? contasPagar.filter(c => c?.status === 'vencido').length : 0)
              }
            ]}
            height={250}
            showLabels={true}
          />
        </div>

        {/* Contas a Receber - Próximas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contas a Receber - Próximas</h3>
          <div className="space-y-3">
            {contasReceber.slice(0, 3).map((conta) => (
              <div key={conta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{conta.cliente}</p>
                  <p className="text-sm text-gray-600">Venc: {new Date(conta.vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(conta.valor)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conta.status)}`}>
                    {conta.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contas a Pagar - Próximas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contas a Pagar - Próximas</h3>
          <div className="space-y-3">
            {contasPagar.slice(0, 3).map((conta) => (
              <div key={conta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{conta.fornecedor}</p>
                  <p className="text-sm text-gray-600">Venc: {new Date(conta.vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(conta.valor)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conta.status)}`}>
                    {conta.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análise Comparativa */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Análise Comparativa - Últimos 7 Dias</h3>
        <BarChartComponent
          data={fluxoCaixa}
          height={300}
          bars={[
            { dataKey: 'entradas', name: 'Entradas', color: '#10b981' },
            { dataKey: 'saidas', name: 'Saídas', color: '#ef4444' },
            { dataKey: 'saldo', name: 'Saldo', color: '#b58150' }
          ]}
          formatter={formatChartCurrency}
        />
      </div>
    </div>
  );

  const renderContasReceber = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Contas a Receber</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-brown focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => handleCreate('receivable')}
            className="bg-brand-brown hover:bg-brand-brown/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Conta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vencimento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parcela</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contasReceber.map((conta) => (
                <tr key={conta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{conta.cliente}</p>
                      <p className="text-sm text-gray-600">{conta.tipo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green-600">{formatCurrency(conta.valor)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{conta.parcela}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(conta.status)}`}>
                      {conta.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(conta, 'receivable')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(conta, 'receivable')}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(conta.id, 'receivable')}
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

  const renderContasPagar = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Contas a Pagar</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-brown focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => handleCreate('payable')}
            className="bg-brand-brown hover:bg-brand-brown/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Conta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fornecedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vencimento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoria</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contasPagar.map((conta) => (
                <tr key={conta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{conta.fornecedor}</p>
                      <p className="text-sm text-gray-600">{conta.tipo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600">{formatCurrency(conta.valor)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 capitalize">{conta.categoria.replace('-', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(conta.status)}`}>
                      {conta.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(conta, 'payable')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(conta, 'payable')}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(conta.id, 'payable')}
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

  const renderFluxoCaixa = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Movimentação Diária</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Entradas</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Saídas</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fluxoCaixa.map((dia, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(dia.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {formatCurrency(dia.entradas)}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-semibold">
                      {formatCurrency(dia.saidas)}
                    </td>
                    <td className={`px-4 py-3 font-bold ${dia.saldo >= 0 ? 'text-brand-brown' : 'text-red-600'}`}>
                      {formatCurrency(dia.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Período</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Entradas</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(Array.isArray(fluxoCaixa) ? fluxoCaixa.reduce((sum, dia) => sum + (dia?.entradas || 0), 0) : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Saídas</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(Array.isArray(fluxoCaixa) ? fluxoCaixa.reduce((sum, dia) => sum + (dia?.saidas || 0), 0) : 0)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Saldo Líquido</span>
                  <span className={`font-bold ${saldoLiquido >= 0 ? 'text-brand-brown' : 'text-red-600'}`}>
                    {formatCurrency(saldoLiquido)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Projeção 7 dias</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Entradas previstas</span>
                <span className="text-green-600 font-semibold">{formatCurrency(45000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Saídas previstas</span>
                <span className="text-red-600 font-semibold">{formatCurrency(38000)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900 font-semibold">Projeção</span>
                  <span className="text-brand-brown font-bold">{formatCurrency(7000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBancos = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Contas Bancárias</h2>
        <button 
          onClick={() => handleCreate('bank')}
          className="bg-brand-brown hover:bg-brand-brown/90 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bancos.map((banco) => (
          <div key={banco.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                banco.tipo === 'conta-corrente' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {banco.tipo}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{banco.banco}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              {banco.agencia !== '-' && <p>Agência: {banco.agencia}</p>}
              <p>Conta: {banco.conta}</p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Saldo Atual</p>
              <p className="text-2xl font-bold text-brand-brown">{formatCurrency(banco.saldo)}</p>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Extrato
              </button>
              <button 
                onClick={() => handleEdit(banco, 'bank')}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Editar conta"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Conciliação Bancária</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-600 mb-1">Saldo Sistema</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(saldoBancos)}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600 mb-1">Saldo Bancos</p>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(saldoBancos - 150)}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-600 mb-1">Diferença</p>
            <p className="text-xl font-bold text-yellow-700">{formatCurrency(150)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRelatorios = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
        <div className="flex gap-3">
          <FinancialReport 
            data={{
              totalReceivables: totalReceber,
              totalPayables: totalPagar,
              totalBalance: saldoBancos,
              netResult: saldoLiquido,
              accountsReceivable: contasReceber,
              accountsPayable: contasPagar
            }}
            period={{
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
              end: new Date().toLocaleDateString('pt-BR')
            }}
          />
        </div>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Relatório de Contas a Receber */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-white" />
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Contas a Receber</h3>
          <p className="text-sm text-gray-600 mb-4">Relatório detalhado de recebimentos</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Pendente:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(contasReceber.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Títulos:</span>
              <span className="font-semibold">{contasReceber.length}</span>
            </div>
          </div>
        </div>

        {/* Relatório de Contas a Pagar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-white" />
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Contas a Pagar</h3>
          <p className="text-sm text-gray-600 mb-4">Relatório detalhado de pagamentos</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Pendente:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(contasPagar.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Títulos:</span>
              <span className="font-semibold">{contasPagar.length}</span>
            </div>
          </div>
        </div>

        {/* Relatório de Fluxo de Caixa */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Fluxo de Caixa</h3>
          <p className="text-sm text-gray-600 mb-4">Movimentação financeira completa</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entradas (7d):</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(fluxoCaixa.reduce((sum, dia) => sum + dia.entradas, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saídas (7d):</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(fluxoCaixa.reduce((sum, dia) => sum + dia.saidas, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* DRE Simplificado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">DRE Mensal</h3>
          <p className="text-sm text-gray-600 mb-4">Demonstrativo de resultados</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Receitas:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalReceber)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Despesas:</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalPagar)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 font-semibold">Resultado:</span>
                <span className={`font-bold ${saldoLiquido >= 0 ? 'text-brand-brown' : 'text-red-600'}`}>
                  {formatCurrency(saldoLiquido)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posição Bancária */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Posição Bancária</h3>
          <p className="text-sm text-gray-600 mb-4">Saldos em todas as contas</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total em Bancos:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(saldoBancos)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contas Ativas:</span>
              <span className="font-semibold">{bancos.length}</span>
            </div>
          </div>
        </div>

        {/* Análise de Tendências */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-brown rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Análise Financeira</h3>
          <p className="text-sm text-gray-600 mb-4">Indicadores e tendências</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Liquidez:</span>
              <span className="font-semibold text-brand-brown">
                {totalPagar > 0 ? ((saldoBancos / totalPagar) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pendências:</span>
              <span className="font-semibold">
                {contasReceber.filter(c => c.status === 'pendente').length + contasPagar.filter(c => c.status === 'pendente').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros de Relatório</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-brown focus:border-transparent">
              <option>Últimos 30 dias</option>
              <option>Último mês</option>
              <option>Últimos 3 meses</option>
              <option>Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-brown focus:border-transparent">
              <option>Todos</option>
              <option>Recebimentos</option>
              <option>Pagamentos</option>
              <option>Transferências</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-brown focus:border-transparent">
              <option>Todos</option>
              <option>Pendente</option>
              <option>Pago</option>
              <option>Vencido</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white py-2 px-4 rounded-lg font-medium transition-colors">
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Módulo Financeiro</h1>
          <p className="text-gray-600 mt-1">Gestão completa das finanças da empresa</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'contas-receber', label: 'Contas a Receber', icon: ArrowUpCircle },
                { id: 'contas-pagar', label: 'Contas a Pagar', icon: ArrowDownCircle },
                { id: 'fluxo-caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
                { id: 'bancos', label: 'Bancos', icon: Building2 },
                { id: 'relatorios', label: 'Relatórios', icon: Receipt }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-brand-brown text-brand-brown'
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'contas-receber' && renderContasReceber()}
            {activeTab === 'contas-pagar' && renderContasPagar()}
            {activeTab === 'fluxo-caixa' && renderFluxoCaixa()}
            {activeTab === 'bancos' && renderBancos()}
            {activeTab === 'relatorios' && renderRelatorios()}
          </>
        )}

        {/* Messages */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl z-50">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl z-50">
            {success}
          </div>
        )}

        {/* Modal */}
        <FinancialModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          type={modalType}
          data={selectedItem}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AdminFinanceiroDashboard; 