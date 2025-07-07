import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Download, UserPlus, Mail, Phone, 
  TrendingUp, DollarSign, Edit, Eye, UserCheck, 
  BarChart3, PieChart, Activity, Target, Award,
  AlertCircle, CheckCircle, User, Building, Clock,
  MoreVertical, Filter, ChevronLeft, ChevronRight, 
  Shield, Globe, ArrowLeft, Send, MessageSquare,
  FileText, Image, Zap, Calendar, Copy, Trash2
} from 'lucide-react';
import { Toggle } from '../components/ui/toggle';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerCreateModal from '../components/CustomerCreateModal';
import { 
  getAdminCustomers, 
  toggleCustomerStatus,
  getAllCustomers,
  toggleAnyCustomerStatus,
  syncAuthUsersToPublic
} from "../lib/api.js"
import { 
  sendCompleteNewsletter, 
  validateNewsletterData,
  getNewsletterTemplates
} from '../lib/newsletter-api';

const AdminCRMDashboard = () => {
  const [activeTab, setActiveTab] = useState('admin-only'); // 'admin-only', 'all-customers', 'newsletter'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'admin', 'self'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados da Newsletter
  const [newsletterData, setNewsletterData] = useState({
    title: '',
    message: '',
    template: 'custom',
    sendMethod: 'both', // 'email', 'whatsapp', 'both'
    audience: 'all', // 'all', 'admin-created', 'self-registered', 'active', 'inactive'
    schedule: 'now' // 'now', 'schedule'
  });
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Templates pré-definidos
  const newsletterTemplates = {
    promotion: {
      title: '🔥 OFERTA IMPERDÍVEL | Mestres do Café',
      message: `┌─────────────────────────────┐
│  🔥 OFERTA EXCLUSIVA 🔥    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕✨

🎯 *LIQUIDAÇÃO ESPECIAL* acontecendo AGORA!

💰 *DESCONTOS INCRÍVEIS:*
├ 🏆 Premium: 25% OFF
├ ⭐ Especiais: 20% OFF  
├ 🌟 Tradicionais: 15% OFF
└ 🎁 FRETE GRÁTIS acima de R$ 89

⏰ *ÚLTIMAS HORAS* - Válido até [DATA]

🛒 *GARANTIR DESCONTO:*
🔗 mestrescafe.com.br/promocao
🏷️ Cupom: MESTRE25

🚚 *Entrega expressa em Santa Maria/RS*
📞 *Dúvidas: (55) 3220-1234*

┌─────────────────────────────┐
│ Não perca! Estoque limitado │
└─────────────────────────────┘

🌟 Equipe Mestres do Café
📍 Santa Maria/RS - Desde 2020`
    },
    newsletter: {
      title: '📰 Novidades Quentinhas | Mestres do Café',
      message: `┌─────────────────────────────┐
│   📰 NEWSLETTER SEMANAL    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕📰

🗞️ *AS NOVIDADES DA SEMANA:*

🌟 *DESTAQUES:*
├ ☕ Lançamento: Café Bourbon Premium
├ 🏪 Nova loja na Rua do Acampamento  
├ 🎓 Workshop gratuito de barista
└ 🏆 Sistema de pontos renovado

📈 *CAFÉ DO MÊS:*
🥇 Geisha Especial - Notas florais
💝 Edição limitada com 30% OFF

🎯 *EVENTOS EM MARÇO:*
├ 📅 05/03 - Degustação gratuita
├ 📅 12/03 - Workshop de latte art
└ 📅 19/03 - Concurso de receitas

📚 *DICA DO ESPECIALISTA:*
"Para realçar notas frutais, use água entre 88-92°C"
- João, Mestre Barista

🔗 *LEIA MAIS:*
📖 mestrescafe.com.br/blog
📱 Nos siga: @mestres_do_cafe

☕ Até a próxima semana!
🌟 Equipe Mestres do Café`
    },
    welcome: {
      title: '🎊 Seja Bem-Vindo(a) à Família! | Mestres do Café',
      message: `┌─────────────────────────────┐
│  🎊 BEM-VINDO À FAMÍLIA!   │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! ☕🤝

🌟 *Você agora faz parte da nossa família de apaixonados por café!*

🎁 *SEUS BENEFÍCIOS DE BOAS-VINDAS:*
├ 🏷️ 15% OFF na primeira compra
├ 🚚 FRETE GRÁTIS sem valor mínimo
├ ⭐ 200 PONTOS de bônus
├ 📱 Acesso VIP às promoções
└ 📰 Newsletter exclusiva

☕ *CONHEÇA NOSSA SELEÇÃO:*
🥇 Cafés Premium: Geisha, Bourbon
⭐ Especiais: Catuaí, Mundo Novo  
🌟 Tradicionais: Blend Supremo

🏆 *PROGRAMA MESTRES:*
💰 Acumule pontos a cada compra
🎯 Troque por descontos e brindes
📈 Evolua de Aprendiz à Lenda!

🛒 *FAZER PRIMEIRA COMPRA:*
🔗 mestrescafe.com.br
🏷️ Cupom: BEMVINDO15
⏰ Válido por 30 dias

📞 *CONTATO:*
💬 WhatsApp: (55) 99999-9999
📧 Email: contato@mestrescafe.com.br

☕ Bem-vindo(a) à jornada do café perfeito!
🌟 Equipe Mestres do Café`
    },
    birthday: {
      title: '🎂 Parabéns! Hoje é seu Dia Especial! | Mestres do Café',
      message: `┌─────────────────────────────┐
│   🎂 FELIZ ANIVERSÁRIO!    │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

🎊 *PARABÉNS, [NOME]!* 🎊

Hoje é um dia muito especial! A família Mestres do Café deseja um feliz aniversário repleto de alegria e momentos especiais! ☕🎈

🎁 *SEU PRESENTE DE ANIVERSÁRIO:*
├ 🏷️ 30% OFF em TODA loja
├ ☕ Café de aniversário GRÁTIS*  
├ 🎂 Brownie especial na compra
├ 📦 Frete grátis para qualquer valor
└ ⭐ PONTOS EM DOBRO por 7 dias

🏪 *RETIRAR SEU CAFÉ GRÁTIS:*
📍 Qualquer uma de nossas lojas
🆔 Apresente este cupom
⏰ Válido até: [DATA]

🛒 *APROVEITAR 30% OFF:*
🔗 mestrescafe.com.br/aniversario
🏷️ Cupom: NIVER30
📅 Válido por 7 dias

☕ *SUGESTÃO ESPECIAL:*
🥇 Geisha Premium - Perfeito para celebrar!
🎯 Com seu desconto fica R$ 62,93

📞 *AGENDAR RETIRADA:*
💬 WhatsApp: (55) 99999-9999
📧 Email: aniversarios@mestrescafe.com.br

🎉 *Que seu novo ano seja repleto de cafés especiais e momentos inesquecíveis!*

☕ Com carinho,
🌟 Toda equipe Mestres do Café

*Café grátis: Tradicional 100g nas lojas físicas`
    },
    event: {
      title: '🎪 Evento Especial | Mestres do Café',
      message: `┌─────────────────────────────┐
│   🎪 EVENTO ESPECIAL       │
│     MESTRES DO CAFÉ         │
└─────────────────────────────┘

Olá, [NOME]! 🎭☕

🎯 *VOCÊ ESTÁ CONVIDADO(A) PARA:*

🎪 **FESTIVAL DO CAFÉ 2024**
📅 Data: [DATA]
🕐 Horário: 14h às 20h
📍 Local: Loja Centro - Rua do Acampamento, 123

🌟 *PROGRAMAÇÃO:*
├ 14h - Abertura e degustação
├ 15h - Workshop de métodos de preparo
├ 16h30 - Palestra sobre origens
├ 18h - Concurso de latte art
└ 19h - Sorteios e encerramento

🎁 *BENEFÍCIOS EXCLUSIVOS:*
├ 🎫 Entrada GRATUITA  
├ ☕ Degustação ilimitada
├ 🏷️ 20% OFF em compras no evento
├ 🎪 Brindes exclusivos
└ 📜 Certificado de participação

🏆 *CONCURSO LATTE ART:*
🥇 1º lugar: Kit barista completo
🥈 2º lugar: 1kg de café premium  
🥉 3º lugar: Xícara personalizada

📝 *CONFIRMAR PRESENÇA:*
💬 WhatsApp: (55) 99999-9999
🔗 mestrescafe.com.br/eventos
📧 eventos@mestrescafe.com.br

🎪 Venha viver uma experiência única no mundo do café!

☕ Te esperamos lá!
🌟 Equipe Mestres do Café`
    }
  };

  const { user, hasPermission } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
    if (activeTab !== 'newsletter') {
      loadCustomersData();
    }
  }, [user, hasPermission, navigate, pagination.page, searchTerm, filterSource, activeTab]);

  const loadCustomersData = async () => {
    console.log('🔄 Iniciando carregamento de clientes...');
    console.log('📊 Parâmetros:', { activeTab, pagination, searchTerm, filterSource });
    
    setLoading(true);
    setError('');
    
    try {
      let result;
      
      if (activeTab === 'admin-only') {
        console.log('👤 Buscando clientes criados pelo admin...');
        // Buscar apenas clientes criados pelo admin
        result = await getAdminCustomers({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        console.log('👤 Resultado admin clients:', result);
      } else {
        console.log('📋 Buscando todos os clientes...');
        // Buscar todos os clientes
        result = await getAllCustomers({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          origin: filterSource === 'admin' ? 'admin' : filterSource === 'self' ? 'auto' : undefined
        });
        console.log('📋 Resultado all clients:', result);
      }
      
      if (result && result.success) {
        console.log(`✅ ${result.customers.length} clientes carregados com sucesso`);
        setCustomers(result.customers);
        if (result.pagination) {
          setPagination(prev => ({ ...prev, ...result.pagination }));
        }
      } else {
        console.error('❌ Erro na resposta:', result);
        setError(result ? result.error : 'Erro desconhecido ao carregar clientes');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados de clientes:', error);
      setError('Erro ao carregar clientes: ' + error.message);
    } finally {
      setLoading(false);
      console.log('🏁 Carregamento finalizado');
    }
  };

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setShowCustomerModal(true);
  };

  const handleModalSuccess = () => {
    loadCustomersData();
    setSuccess('Operação realizada com sucesso!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleStatus = async (customerId, currentIsActive, isAdminCreated) => {
    try {
      let result;
      
      // Simular toggle do status baseado no campo is_active ou role
      const newStatus = currentIsActive ? 'inactive' : 'active';
      
      if (isAdminCreated) {
        // Usar a API específica para clientes criados pelo admin
        result = await toggleCustomerStatus(customerId, newStatus);
      } else {
        // Usar a API genérica para qualquer cliente
        result = await toggleAnyCustomerStatus(customerId, newStatus);
      }
      
      if (result.success) {
        loadCustomersData();
        setSuccess('Status do cliente alterado com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Erro ao alterar status do cliente');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Resetar filtros ao mudar de aba
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchTerm('');
    setFilterSource('all');
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Carregar clientes quando mudar para newsletter
    if (newTab === 'newsletter') {
      loadCustomersForNewsletter();
    }
  };

  // Carregar clientes para newsletter
  const loadCustomersForNewsletter = async () => {
    setLoading(true);
    try {
      const result = await getAllCustomers({
        page: 1,
        limit: 1000, // Carregar todos para newsletter
        search: ''
      });
      
      if (result && result.success) {
        setCustomers(result.customers);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes para newsletter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções da Newsletter
  const handleTemplateChange = (templateKey) => {
    if (templateKey === 'custom') {
      setNewsletterData(prev => ({
        ...prev,
        template: 'custom',
        title: '',
        message: ''
      }));
    } else {
      const template = newsletterTemplates[templateKey];
      setNewsletterData(prev => ({
        ...prev,
        template: templateKey,
        title: template.title,
        message: template.message
      }));
    }
  };

  const handleAudienceChange = (audience) => {
    let filteredCustomers = [...customers];
    
    switch (audience) {
      case 'admin-created':
        filteredCustomers = customers.filter(c => c.criado_por_admin);
        break;
      case 'self-registered':
        filteredCustomers = customers.filter(c => !c.criado_por_admin);
        break;
      case 'active':
        filteredCustomers = customers.filter(c => c.is_active);
        break;
      case 'inactive':
        filteredCustomers = customers.filter(c => !c.is_active);
        break;
      default:
        filteredCustomers = customers;
    }
    
    setSelectedCustomers(filteredCustomers);
    setNewsletterData(prev => ({ ...prev, audience }));
  };

  const processMessageTemplate = (message, customerName) => {
    return message
      .replace(/\[NOME\]/g, customerName)
      .replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'));
  };

  const sendNewsletter = async () => {
    // Validar dados da newsletter
    const validation = validateNewsletterData(newsletterData, selectedCustomers);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setNewsletterLoading(true);

    try {
      console.log('📧📱 Enviando newsletter...', {
        method: newsletterData.sendMethod,
        customers: selectedCustomers.length,
        title: newsletterData.title
      });

      const result = await sendCompleteNewsletter(newsletterData, selectedCustomers);
      
      if (result.success) {
        setSuccess(result.message);
        
        // Reset form
        setNewsletterData({
          title: '',
          message: '',
          template: 'custom',
          sendMethod: 'both',
          audience: 'all',
          schedule: 'now'
        });
        setSelectedCustomers([]);
        
        console.log('✅ Newsletter enviada com sucesso:', result.results);
      } else {
        setError(result.error || 'Erro ao enviar newsletter');
        console.error('❌ Erro no envio da newsletter:', result);
      }

    } catch (error) {
      setError('Erro ao enviar newsletter: ' + error.message);
      console.error('❌ Erro crítico no envio da newsletter:', error);
    } finally {
      setNewsletterLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  // Cálculos para KPIs
  const totalCustomers = customers.length;
  const pendingCustomers = customers.filter(c => c.pendente_ativacao).length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const adminCreatedCustomers = customers.filter(c => c.criado_por_admin).length;
  const selfRegisteredCustomers = customers.filter(c => !c.criado_por_admin).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

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
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-amber-600" />
                <h1 className="text-4xl font-bold text-slate-900">CRM - Gestão de Clientes</h1>
              </div>
              <p className="text-xl text-slate-600">
                {activeTab === 'admin-only' 
                  ? 'Gerencie clientes criados manualmente pelo admin'
                  : activeTab === 'all-customers'
                    ? 'Gerencie todos os clientes do sistema'
                    : 'Gerencie newsletters'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  setSyncLoading(true);
                  setError('');
                  setSuccess('');
                  
                  try {
                    console.log('🔄 Forçando sincronização manual de usuários...');
                    const result = await syncAuthUsersToPublic();
                    
                    if (result.success) {
                      setSuccess(`✅ Sincronização concluída! ${result.synced} usuários sincronizados de ${result.total} total`);
                      await loadCustomersData();
                    } else {
                      setError(`❌ Erro na sincronização: ${result.error}`);
                    }
                  } catch (error) {
                    console.error('❌ Erro ao forçar sincronização:', error);
                    setError(`❌ Erro ao sincronizar usuários: ${error.message}`);
                  } finally {
                    setSyncLoading(false);
                  }
                }}
                disabled={syncLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                {syncLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Users className="w-4 h-4" />
                )}
                {syncLoading ? 'Sincronizando...' : 'Sincronizar Usuários'}
              </button>
              <button
                onClick={() => {/* Implementar exportação */}}
                className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handleCreateCustomer}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Criar Cliente Manual
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange('admin-only')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'admin-only'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Clientes Criados pelo Admin
              </button>
              <button
                onClick={() => handleTabChange('all-customers')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'all-customers'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                Todos os Clientes
              </button>
              <button
                onClick={() => handleTabChange('newsletter')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === 'newsletter'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Send className="w-4 h-4" />
                Newsletters
              </button>
            </nav>
          </div>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="text-white w-6 h-6" />
              </div>
              <TrendingUp className="text-blue-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Total Clientes</h3>
            <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
            <p className="text-xs text-slate-500">
              {activeTab === 'admin-only' ? 'Criados pelo admin' : activeTab === 'all-customers' ? 'Todos os clientes' : 'Todos os clientes'}
            </p>
          </div>

          {activeTab === 'all-customers' && (
            <>
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Shield className="text-white w-6 h-6" />
                  </div>
                  <Activity className="text-purple-600 w-5 h-5" />
                </div>
                <h3 className="text-slate-700 font-medium mb-2">Criados pelo Admin</h3>
                <p className="text-3xl font-bold text-purple-600">{adminCreatedCustomers}</p>
                <p className="text-xs text-slate-500">Cadastro manual</p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <Globe className="text-white w-6 h-6" />
                  </div>
                  <UserCheck className="text-cyan-600 w-5 h-5" />
                </div>
                <h3 className="text-slate-700 font-medium mb-2">Auto-cadastrados</h3>
                <p className="text-3xl font-bold text-cyan-600">{selfRegisteredCustomers}</p>
                <p className="text-xs text-slate-500">Cadastro próprio</p>
              </div>
            </>
          )}

          {activeTab === 'admin-only' && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <Activity className="text-orange-600 w-5 h-5" />
              </div>
              <h3 className="text-slate-700 font-medium mb-2">Pendentes</h3>
              <p className="text-3xl font-bold text-orange-600">{pendingCustomers}</p>
              <p className="text-xs text-slate-500">Aguardando ativação</p>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <UserCheck className="text-white w-6 h-6" />
              </div>
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">Ativos</h3>
            <p className="text-3xl font-bold text-green-600">{activeCustomers}</p>
            <p className="text-xs text-slate-500">Contas ativadas</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <Target className="text-amber-600 w-5 h-5" />
            </div>
            <h3 className="text-slate-700 font-medium mb-2">LTV Médio</h3>
            <p className="text-3xl font-bold text-amber-600">R$ {avgLifetimeValue.toFixed(0)}</p>
            <p className="text-xs text-slate-500">Valor por cliente</p>
          </div>
        </div>

        {/* Newsletter Tab Content */}
        {activeTab === 'newsletter' ? (
          <div className="space-y-8">
            {/* Newsletter Form */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Send className="w-6 h-6 text-amber-600" />
                  <h3 className="text-xl font-bold text-slate-900">Criar Newsletter</h3>
                </div>
                <p className="text-slate-600">Envie mensagens para seus clientes por email ou WhatsApp</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Formulário */}
                  <div className="space-y-6">
                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Template
                      </label>
                      <select
                        value={newsletterData.template}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="custom">🎨 Personalizada</option>
                        <option value="promotion">🔥 Promoção Especial</option>
                        <option value="newsletter">📰 Newsletter Semanal</option>
                        <option value="welcome">🎊 Boas-vindas</option>
                        <option value="birthday">🎂 Aniversário</option>
                        <option value="event">🎪 Evento Especial</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Título
                      </label>
                      <input
                        type="text"
                        value={newsletterData.title}
                        onChange={(e) => setNewsletterData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Digite o título da newsletter..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Mensagem
                      </label>
                      <textarea
                        value={newsletterData.message}
                        onChange={(e) => setNewsletterData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Digite sua mensagem... Use [NOME] para personalizar com o nome do cliente e [DATA] para a data atual."
                        rows={10}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        💡 Dica: Use [NOME] para personalizar com o nome do cliente e [DATA] para data atual
                      </p>
                    </div>

                    {/* Send Method */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Método de Envio
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setNewsletterData(prev => ({ ...prev, sendMethod: 'email' }))}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            newsletterData.sendMethod === 'email'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Mail className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">Email</span>
                        </button>
                        <button
                          onClick={() => setNewsletterData(prev => ({ ...prev, sendMethod: 'whatsapp' }))}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            newsletterData.sendMethod === 'whatsapp'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setNewsletterData(prev => ({ ...prev, sendMethod: 'both' }))}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            newsletterData.sendMethod === 'both'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Zap className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">Ambos</span>
                        </button>
                      </div>
                    </div>

                    {/* Audience Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        <Users className="w-4 h-4 inline mr-2" />
                        Público-alvo
                      </label>
                      <select
                        value={newsletterData.audience}
                        onChange={(e) => handleAudienceChange(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="all">Todos os clientes</option>
                        <option value="admin-created">Criados pelo admin</option>
                        <option value="self-registered">Auto-cadastrados</option>
                        <option value="active">Clientes ativos</option>
                        <option value="inactive">Clientes inativos</option>
                      </select>
                      <p className="text-sm text-slate-600 mt-2">
                        {selectedCustomers.length} cliente(s) selecionado(s)
                      </p>
                    </div>

                    {/* Send Button */}
                    <div className="pt-4">
                      <button
                        onClick={sendNewsletter}
                        disabled={newsletterLoading || !newsletterData.title || !newsletterData.message || selectedCustomers.length === 0}
                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {newsletterLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Enviar Newsletter
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Preview da Mensagem
                      </h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h5 className="font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                            {newsletterData.title || 'Título da Newsletter'}
                          </h5>
                          <div className="text-slate-700 whitespace-pre-wrap">
                            {processMessageTemplate(newsletterData.message || 'Sua mensagem aparecerá aqui...', 'João Silva')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selected Customers Preview */}
                    {selectedCustomers.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Destinatários ({selectedCustomers.length})
                        </h4>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                          <div className="space-y-2">
                            {selectedCustomers.slice(0, 10).map(customer => (
                              <div key={customer.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                                  {customer.user_type === 'cliente_pj' ? (
                                    <Building className="text-white w-4 h-4" />
                                  ) : (
                                    <User className="text-white w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{customer.name}</p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {customer.email}
                                    </span>
                                    {customer.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {customer.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {selectedCustomers.length > 10 && (
                              <div className="text-center text-slate-500 text-sm py-2">
                                E mais {selectedCustomers.length - 10} cliente(s)...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filtros e Busca */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 mb-8">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Lista de Clientes</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
                      />
                    </div>
                    
                    {/* Filtro por origem (apenas na aba todos os clientes) */}
                    {activeTab === 'all-customers' && (
                      <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="all">Todas as origens</option>
                        <option value="admin">Criados pelo admin</option>
                        <option value="self">Auto-cadastrados</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

          {/* Lista de Clientes */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando clientes...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mb-6">
                  {activeTab === 'admin-only' 
                    ? 'Crie o primeiro cliente manualmente para começar'
                    : activeTab === 'all-customers'
                      ? 'Não há clientes que correspondam aos filtros aplicados'
                      : 'Não há newsletters criadas'
                  }
                </p>
                {activeTab === 'admin-only' && (
                  <button
                    onClick={handleCreateCustomer}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                  >
                    Criar Primeiro Cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map(customer => (
                  <div key={customer.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                          {customer.user_type === 'cliente_pj' ? (
                            <Building className="text-white w-6 h-6" />
                          ) : (
                            <User className="text-white w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-1">{customer.name}</h5>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              customer.pendente_ativacao 
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : customer.is_active 
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {customer.pendente_ativacao ? 'Pendente' : customer.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              customer.user_type === 'cliente_pj' 
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {customer.user_type === 'cliente_pj' ? 'PJ' : 'PF'}
                            </span>
                            {/* Badge para identificar origem */}
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              customer.criado_por_admin 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-cyan-100 text-cyan-700'
                            }`}>
                              {customer.criado_por_admin ? 'Admin' : 'Auto'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Criado em {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {customer.admin_name && (
                            <p className="text-xs text-slate-500">por {customer.admin_name}</p>
                          )}
                          {customer.orders_count > 0 && (
                            <p className="text-xs text-slate-500">
                              {customer.orders_count} pedidos • R$ {customer.total_spent.toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/customer/${customer.id}`)}
                            className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                            title="Ver detalhes completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Só pode editar clientes criados pelo admin */}
                          {customer.criado_por_admin && (
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="p-2 text-slate-600 hover:text-amber-600 transition-colors"
                              title="Editar cliente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleToggleStatus(customer.id, customer.is_active, customer.criado_por_admin)}
                            className={`p-2 transition-colors ${
                              customer.is_active 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={customer.is_active ? 'Desativar' : 'Ativar'}
                          >
                            <Toggle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {customer.observacao && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-800">
                          <strong>Observação:</strong> {customer.observacao}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Página {pagination.page} de {pagination.pages} ({pagination.total} clientes)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      <CustomerCreateModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        mode={modalMode}
        customer={selectedCustomer}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AdminCRMDashboard; 