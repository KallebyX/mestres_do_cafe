import React, { useState, useEffect } from 'react';
import { 
  X, Save, FileText, CheckCircle, AlertCircle, 
  Plus, Trash2, Edit, Search, Calculator, Download,
  Calendar, Package, BarChart3, Target, Clock, Users
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const InventoryCountModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [activeTab, setActiveTab] = useState('create');
  const [inventarios, setInventarios] = useState([]);
  const [contagens, setContagens] = useState([]);
  const [newInventory, setNewInventory] = useState({
    name: '',
    type: 'ciclico',
    scheduled_date: '',
    warehouse_id: '',
    category_filter: '',
    responsible_user: '',
    notes: ''
  });
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [countingItems, setCountingItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { notifySuccess, notifyError } = useNotifications();

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInventoryData();
    }
  }, [isOpen]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      // Dados simulados de inventários
      const inventoryData = [
        {
          id: 'inv-1',
          name: 'Inventário Mensal - Janeiro 2025',
          type: 'ciclico',
          status: 'programado',
          scheduled_date: '2025-01-30',
          warehouse: 'Depósito Principal',
          category_filter: 'Todas as categorias',
          responsible_user: 'João Silva',
          total_items: 15,
          counted_items: 0,
          progress: 0,
          discrepancies: 0,
          notes: 'Inventário mensal programado',
          created_at: new Date().toISOString()
        }
      ];
      setInventarios(inventoryData);

      // Dados simulados de contagens
      const countsData = [];
      setContagens(countsData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados de inventário:', error);
      setInventarios([]);
      setContagens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInventory = async () => {
    if (!newInventory.name || !newInventory.scheduled_date || !newInventory.responsible_user) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const inventory = {
        id: `inv-${Date.now()}`,
        name: newInventory.name,
        type: newInventory.type,
        status: 'programado',
        scheduled_date: newInventory.scheduled_date,
        warehouse: newInventory.warehouse_id || 'Depósito Principal',
        category_filter: newInventory.category_filter || 'Todas as categorias',
        responsible_user: newInventory.responsible_user,
        total_items: Math.floor(Math.random() * 20) + 10, // Simular contagem de itens
        counted_items: 0,
        progress: 0,
        discrepancies: 0,
        notes: newInventory.notes,
        created_at: new Date().toISOString()
      };

      setInventarios(prev => [...prev, inventory]);
      
      // Reset form
      setNewInventory({
        name: '',
        type: 'ciclico',
        scheduled_date: '',
        warehouse_id: '',
        category_filter: '',
        responsible_user: '',
        notes: ''
      });

      notifySuccess('✅ Inventário Criado', `Inventário "${inventory.name}" programado com sucesso`);
      setError('');
      setActiveTab('list');
    } catch (error) {
      setError('Erro ao criar inventário');
      notifyError('❌ Erro', 'Erro ao criar inventário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartInventory = (inventory) => {
    const updatedInventory = {
      ...inventory,
      status: 'em_andamento',
      started_date: new Date().toISOString().split('T')[0]
    };

    setInventarios(prev => 
      prev.map(inv => inv.id === inventory.id ? updatedInventory : inv)
    );

    // Gerar itens de contagem simulados
    const items = [
      {
        id: `item-${Date.now()}-1`,
        product_name: 'Café Santos Premium',
        sku: 'CAF-001',
        location: 'A1-01',
        batch: 'LOT2024001',
        system_quantity: 325,
        status: 'pendente'
      },
      {
        id: `item-${Date.now()}-2`,
        product_name: 'Café Robusta Especial',
        sku: 'CAF-002',
        location: 'A2-01',
        batch: 'LOT2024003',
        system_quantity: 28,
        status: 'pendente'
      }
    ];

    setCountingItems(items);
    setSelectedInventory(updatedInventory);
    setActiveTab('execute');

    notifySuccess('✅ Inventário Iniciado', `Inventário "${inventory.name}" foi iniciado`);
  };

  const handleCountItem = (itemId, countedQuantity, notes = '') => {
    const item = countingItems.find(i => i.id === itemId);
    if (!item) return;

    const difference = countedQuantity - item.system_quantity;
    const status = difference === 0 ? 'conferido' : 'divergencia';

    const updatedItem = {
      ...item,
      counted_quantity: countedQuantity,
      difference,
      status,
      notes,
      counted_by: 'Usuário Atual',
      counted_at: new Date().toISOString()
    };

    setCountingItems(prev => 
      prev.map(item => item.id === itemId ? updatedItem : item)
    );

    // Atualizar contagens
    const newCount = {
      id: `count-${Date.now()}`,
      inventory_id: selectedInventory.id,
      product_name: item.product_name,
      sku: item.sku,
      location: item.location,
      batch: item.batch,
      system_quantity: item.system_quantity,
      counted_quantity: countedQuantity,
      difference,
      status,
      counted_by: 'Usuário Atual',
      counted_at: new Date().toISOString(),
      notes
    };

    setContagens(prev => [...prev, newCount]);

    notifySuccess('✅ Item Contado', `${item.product_name} registrado`);
  };

  const generateInventoryReport = (inventory) => {
    const relatedCounts = contagens.filter(c => c.inventory_id === inventory.id);
    const totalDiscrepancies = relatedCounts.filter(c => c.status === 'divergencia').length;
    
    const report = {
      inventory: inventory.name,
      date: new Date().toLocaleDateString('pt-BR'),
      responsible: inventory.responsible_user,
      warehouse: inventory.warehouse,
      totalItems: relatedCounts.length,
      discrepancies: totalDiscrepancies,
      accuracy: relatedCounts.length > 0 ? ((relatedCounts.length - totalDiscrepancies) / relatedCounts.length * 100).toFixed(1) : 0,
      items: relatedCounts
    };

    // Simular download do relatório
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario-${inventory.id}-${Date.now()}.json`;
    link.click();

    notifySuccess('✅ Relatório Gerado', 'Relatório de inventário baixado');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'programado':
        return 'text-blue-700 bg-blue-100';
      case 'em_andamento':
        return 'text-yellow-700 bg-yellow-100';
      case 'concluido':
        return 'text-green-700 bg-green-100';
      case 'cancelado':
        return 'text-red-700 bg-red-100';
      case 'conferido':
        return 'text-green-700 bg-green-100';
      case 'divergencia':
        return 'text-red-700 bg-red-100';
      case 'pendente':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Inventário Cíclico</h2>
              <p className="text-green-100">
                Gestão completa de contagens e inventários
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'list', label: 'Inventários', icon: FileText },
              { id: 'create', label: 'Novo Inventário', icon: Plus },
              { id: 'execute', label: 'Executar Contagem', icon: Calculator },
              { id: 'reports', label: 'Relatórios', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Lista de Inventários */}
          {activeTab === 'list' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Inventários Programados e Concluídos</h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Inventário
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inventarios.map((inventory) => (
                  <div key={inventory.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{inventory.name}</h4>
                        <p className="text-sm text-gray-600">{inventory.warehouse}</p>
                        <p className="text-sm text-gray-600">Responsável: {inventory.responsible_user}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inventory.status)}`}>
                        {inventory.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tipo:</span>
                          <p className="font-semibold">{inventory.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Data Programada:</span>
                          <p className="font-semibold">
                            {new Date(inventory.scheduled_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Progresso:</span>
                          <p className="font-semibold">
                            {inventory.counted_items}/{inventory.total_items} ({inventory.progress}%)
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Divergências:</span>
                          <p className={`font-semibold ${inventory.discrepancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {inventory.discrepancies}
                          </p>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progresso da Contagem</span>
                          <span>{inventory.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              inventory.progress === 100 
                                ? 'bg-green-500' 
                                : inventory.progress > 0 
                                  ? 'bg-yellow-500' 
                                  : 'bg-gray-400'
                            }`}
                            style={{ width: `${inventory.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {inventory.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{inventory.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {inventory.status === 'programado' && (
                        <button
                          onClick={() => handleStartInventory(inventory)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Target className="w-4 h-4" />
                          Iniciar
                        </button>
                      )}
                      {inventory.status === 'em_andamento' && (
                        <button
                          onClick={() => {
                            setSelectedInventory(inventory);
                            setActiveTab('execute');
                          }}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Calculator className="w-4 h-4" />
                          Continuar
                        </button>
                      )}
                      {inventory.status === 'concluido' && (
                        <button
                          onClick={() => generateInventoryReport(inventory)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Relatório
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Criar Novo Inventário */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Programar Novo Inventário</h3>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Inventário *
                    </label>
                    <input
                      type="text"
                      value={newInventory.name}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Inventário Mensal - Janeiro 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Inventário
                    </label>
                    <select
                      value={newInventory.type}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="ciclico">Cíclico</option>
                      <option value="geral">Geral</option>
                      <option value="amostragem">Amostragem</option>
                      <option value="especifico">Específico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Programada *
                    </label>
                    <input
                      type="date"
                      value={newInventory.scheduled_date}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Depósito
                    </label>
                    <select
                      value={newInventory.warehouse_id}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, warehouse_id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Todos os depósitos</option>
                      <option value="principal">Depósito Principal</option>
                      <option value="secundario">Depósito Secundário</option>
                      <option value="cd">Centro de Distribuição</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtro por Categoria
                    </label>
                    <select
                      value={newInventory.category_filter}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, category_filter: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Todas as categorias</option>
                      <option value="cafes-especiais">Cafés Especiais</option>
                      <option value="cafes-premium">Cafés Premium</option>
                      <option value="acessorios">Acessórios</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsável *
                    </label>
                    <input
                      type="text"
                      value={newInventory.responsible_user}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, responsible_user: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={newInventory.notes}
                      onChange={(e) => setNewInventory(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Informações adicionais sobre o inventário..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateInventory}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Criando Inventário...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Programar Inventário
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Executar Contagem */}
          {activeTab === 'execute' && selectedInventory && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Executando: {selectedInventory.name}
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Instruções para Contagem</h4>
                    <p className="text-blue-700 text-sm">
                      Conte fisicamente cada item e registre a quantidade encontrada. 
                      O sistema calculará automaticamente as divergências.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {countingItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{item.product_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>SKU: {item.sku}</span>
                          <span>Local: {item.location}</span>
                          <span>Lote: {item.batch}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantidade no Sistema
                        </label>
                        <div className="px-4 py-2 bg-gray-100 rounded-xl">
                          <span className="font-bold text-gray-900">{item.system_quantity}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantidade Contada
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="0"
                          placeholder="Digite a quantidade"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const quantity = parseInt(e.target.value) || 0;
                              handleCountItem(item.id, quantity);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>

                      <div>
                        <button
                          onClick={(e) => {
                            const input = e.target.parentElement.previousElementSibling.querySelector('input');
                            const quantity = parseInt(input.value) || 0;
                            handleCountItem(item.id, quantity);
                            input.value = '';
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                        >
                          Registrar
                        </button>
                      </div>
                    </div>

                    {item.status !== 'pendente' && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        item.status === 'conferido' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {item.status === 'conferido' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            item.status === 'conferido' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {item.status === 'conferido' 
                              ? 'Quantidade conferida' 
                              : `Divergência: ${item.difference > 0 ? '+' : ''}${item.difference}`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryCountModal; 