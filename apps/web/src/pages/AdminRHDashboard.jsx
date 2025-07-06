import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Calendar, Clock, DollarSign, TrendingUp, Award,
  FileText, CheckCircle, AlertTriangle, Plus, Search, Edit, Eye, Trash2,
  Target, Activity, Star, BookOpen, Coffee, MapPin, Phone, Mail,
  Download, Filter, BarChart3, User, UserPlus, Settings, UserX, ChevronDown,
  PieChart, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/api"
import EmployeeModal from '../components/EmployeeModal';
import { useNotifications } from '../contexts/NotificationContext';
import { PieChartComponent, BarChartComponent } from '../components/AdvancedCharts';
import { StockReport } from '../components/PDFReports';
import { hrAPI } from "@/lib/api"

const AdminRHDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('30d');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para diferentes módulos
  const [funcionarios, setFuncionarios] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [treinamentos, setTreinamentos] = useState([]);
  const [folhaPagamento, setFolhaPagamento] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [ferias, setFerias] = useState([]);
  const [frequencia, setFrequencia] = useState([]);

  // Estados de interface
  const [statusFilter, setStatusFilter] = useState('todos');
  const [departmentFilter, setDepartmentFilter] = useState('todos');

  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Estados do modal
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    loadHRData();
  }, [user, hasPermission, navigate, activeTab]);

  const loadHRData = async () => {
    setLoading(true);
    try {
      // Carregar dados reais do Supabase
      const [
        employeesResult,
        departmentsResult,
        positionsResult
      ] = await Promise.all([
        hrAPI.getEmployees().catch(e => ({ success: false, error: e.message })),
        hrAPI.getDepartments().catch(e => ({ success: false, error: e.message })),
        hrAPI.getPositions().catch(e => ({ success: false, error: e.message }))
      ]);

      // Funcionários - APENAS DADOS REAIS
      if (employeesResult.success) {
        setFuncionarios(employeesResult.data || []);
        console.log(`✅ ${employeesResult.data?.length || 0} funcionários carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela employees não encontrada ou vazia');
        setFuncionarios([]);
      }

      // Departamentos - APENAS DADOS REAIS
      if (departmentsResult.success) {
        setDepartamentos(departmentsResult.data || []);
        console.log(`✅ ${departmentsResult.data?.length || 0} departamentos carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela departments não encontrada ou vazia');
        setDepartamentos([]);
      }

      // Cargos - APENAS DADOS REAIS
      if (positionsResult.success) {
        setCargos(positionsResult.data || []);
        console.log(`✅ ${positionsResult.data?.length || 0} cargos carregados do Supabase`);
      } else {
        console.log('⚠️ Tabela positions não encontrada ou vazia');
        setCargos([]);
      }

      // Para módulos ainda não implementados, deixar vazio até terem tabelas reais
      setFerias([]);
      setAvaliacoes([]);

      setSuccess('Dados RH carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados RH:', error);
      
      // Em caso de erro, garantir arrays vazios
      setFuncionarios([]);
      setDepartamentos([]);
      setCargos([]);
      setFerias([]);
      setAvaliacoes([]);
      
      setError('Erro ao carregar dados RH');
      notifyError('❌ Erro RH', 'Erro ao carregar dados do módulo RH');
    } finally {
      setLoading(false);
    }
  };

  // APIs integradas com hrAPI do supabase-erp-api.js

  // Funções CRUD para funcionários
  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setModalMode('create');
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setShowEmployeeModal(true);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        // Usar soft delete - marcar como inativo
        const result = await hrAPI.updateEmployee(employeeId, { is_active: false });

        if (result.success) {
          notifySuccess('✅ Funcionário Excluído', 'Funcionário excluído com sucesso');
          loadHRData();
        } else {
          notifyError('❌ Erro', result.error || 'Erro ao excluir funcionário');
        }
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        notifyError('❌ Erro', 'Erro ao excluir funcionário');
      }
    }
  };

  const handleEmployeeModalSuccess = () => {
    loadHRData();
    setShowEmployeeModal(false);
  };

  // Utilitários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'text-green-700 bg-green-100';
      case 'inativo':
        return 'text-red-700 bg-red-100';
      case 'ferias':
        return 'text-blue-700 bg-blue-100';
      case 'afastado':
        return 'text-orange-700 bg-orange-100';
      case 'aprovado':
        return 'text-green-700 bg-green-100';
      case 'pendente':
        return 'text-yellow-700 bg-yellow-100';
      case 'reprovado':
        return 'text-red-700 bg-red-100';
      case 'concluida':
        return 'text-green-700 bg-green-100';
      case 'em_andamento':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Cálculos - com verificações de segurança
  const totalFuncionarios = funcionarios ? funcionarios.length : 0;
  const funcionariosAtivos = funcionarios ? funcionarios.filter(f => f && f.status === 'ativo').length : 0;
  const folhaPagamentoTotal = funcionarios ? funcionarios.reduce((total, func) => total + (func && func.salario ? parseFloat(func.salario) : 0), 0) : 0;
  const salarioMedio = totalFuncionarios > 0 ? folhaPagamentoTotal / totalFuncionarios : 0;

  // Componentes de renderização
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-700 text-sm font-medium">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-900 mb-1">{totalFuncionarios}</h3>
          <p className="text-blue-600 text-sm">Funcionários</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 text-sm font-medium">Ativos</span>
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-1">{funcionariosAtivos}</h3>
          <p className="text-green-600 text-sm">Em atividade</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-purple-700 text-sm font-medium">Folha</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-1">{formatCurrency(folhaPagamentoTotal)}</h3>
          <p className="text-purple-600 text-sm">Total mensal</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-700 text-sm font-medium">Média</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-900 mb-1">{formatCurrency(salarioMedio)}</h3>
          <p className="text-orange-600 text-sm">Salário médio</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Funcionários por Departamento</h3>
          <PieChartComponent
            data={Array.isArray(departamentos) ? departamentos.map(dept => ({
              name: dept.nome || 'Departamento',
              value: dept.funcionarios_count || 0
            })) : []}
            height={250}
            showLabels={true}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Orçamento por Departamento</h3>
          <BarChartComponent
            data={Array.isArray(departamentos) ? departamentos.map(dept => ({
              name: dept.nome || 'Departamento',
              value: dept.orcamento_anual || 0
            })) : []}
            height={250}
            bars={[
              { dataKey: 'value', name: 'Orçamento', color: '#3b82f6' }
            ]}
          />
        </div>
      </div>

      {/* Solicitações Pendentes e Avaliações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Solicitações de Férias</h3>
          <div className="space-y-3">
            {Array.isArray(ferias) && ferias.length > 0 ? ferias.slice(0, 3).map((feriaItem) => (
              <div key={feriaItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{feriaItem.funcionario}</p>
                  <p className="text-sm text-gray-600">{feriaItem.periodo} ({feriaItem.dias} dias)</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feriaItem.status)}`}>
                  {feriaItem.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                <p>Nenhuma solicitação de férias pendente</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Avaliações de Desempenho</h3>
          <div className="space-y-3">
            {Array.isArray(avaliacoes) && avaliacoes.length > 0 ? avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{avaliacao.funcionario}</p>
                  <p className="text-sm text-gray-600">Nota: {avaliacao.nota_geral}/10 | Metas: {avaliacao.metas_atingidas}%</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(avaliacao.status)}`}>
                  {avaliacao.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                <p>Nenhuma avaliação de desempenho pendente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFuncionarios = () => (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar funcionários..."
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
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="ferias">Em Férias</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Departamentos</option>
            {Array.isArray(departamentos) ? departamentos.map(dept => (
              <option key={dept.id || Math.random()} value={dept.nome || ''}>{dept.nome || 'Departamento'}</option>
            )) : []}
          </select>

          <button
            onClick={handleCreateEmployee}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* Tabela de Funcionários */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Funcionário</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Cargo/Depto</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Contato</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-900">Salário</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Admissão</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(funcionarios) && funcionarios.length > 0 ? funcionarios
                .filter(func => {
                  // Verificar se func e suas propriedades existem
                  if (!func || !func.nome || !func.email) {
                    return false;
                  }
                  
                  const matchSearch = func.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   func.email.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchStatus = statusFilter === 'todos' || func.status === statusFilter;
                  const matchDept = departmentFilter === 'todos' || func.departamento === departmentFilter;
                  return matchSearch && matchStatus && matchDept;
                })
                .map((funcionario) => (
                  <tr key={funcionario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {funcionario.nome ? funcionario.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'XX'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{funcionario.nome || 'Nome não informado'}</p>
                          <p className="text-sm text-gray-600">{funcionario.cpf || 'CPF não informado'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{funcionario.cargo || 'Cargo não informado'}</p>
                        <p className="text-sm text-gray-600">{funcionario.departamento || 'Departamento não informado'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{funcionario.email || 'Email não informado'}</p>
                        <p className="text-sm text-gray-600">{funcionario.telefone || 'Telefone não informado'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(funcionario.salario || 0)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{funcionario.data_admissao ? formatDate(funcionario.data_admissao) : 'Data não informada'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(funcionario.status || 'inativo')}`}>
                        {funcionario.status || 'inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewEmployee(funcionario)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditEmployee(funcionario)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(funcionario.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {funcionarios && funcionarios.length === 0 ? (
                        <div>
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="font-medium">Nenhum funcionário cadastrado</p>
                          <p className="text-sm mt-1">Comece adicionando o primeiro funcionário</p>
                        </div>
                      ) : (
                        <div>
                          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                          <p>Carregando funcionários...</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRelatorios = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Relatórios de RH</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Folha de Pagamento',
            description: 'Relatório completo da folha mensal',
            icon: DollarSign,
            color: 'green'
          },
          {
            title: 'Funcionários Ativos',
            description: 'Lista completa de funcionários',
            icon: Users,
            color: 'blue'
          },
          {
            title: 'Avaliações de Desempenho',
            description: 'Relatório de avaliações do período',
            icon: Award,
            color: 'purple'
          }
        ].map((relatorio, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${relatorio.color}-500 rounded-xl flex items-center justify-center`}>
                <relatorio.icon className="w-6 h-6 text-white" />
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{relatorio.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{relatorio.description}</p>
            <div className="flex items-center space-x-2">
              <StockReport 
                data={{
                  employees: funcionarios,
                  departments: departamentos,
                  totalPayroll: folhaPagamentoTotal,
                  averageSalary: salarioMedio
                }}
                type="hr"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de RH...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recursos Humanos
          </h1>
          <p className="text-gray-600">
            Gestão completa de funcionários, departamentos e processos de RH
          </p>
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
                { id: 'funcionarios', label: 'Funcionários', icon: Users },
                { id: 'relatorios', label: 'Relatórios', icon: FileText }
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
        {activeTab === 'funcionarios' && renderFuncionarios()}
        {activeTab === 'relatorios' && renderRelatorios()}

        {/* Modal de Funcionários */}
        <EmployeeModal
          isOpen={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
          mode={modalMode}
          employee={selectedEmployee}
          onSuccess={handleEmployeeModalSuccess}
        />
      </div>
    </div>
  );
};

export default AdminRHDashboard; 