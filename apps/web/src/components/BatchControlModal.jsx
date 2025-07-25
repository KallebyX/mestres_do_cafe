import React, { useState, useEffect } from 'react';
import { 
  X, Save, Package, Calendar, AlertCircle, 
  Plus, Trash2, Edit, Eye, CheckCircle, Clock,
  Hash, Truck, FileText, Search
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
// Supabase removed - batch control functionality uses mock data
// import { supabase } from "@/lib/api"

const BatchControlModal = ({ 
  isOpen, 
  onClose, 
  product = null,
  onSuccess 
}) => {
  const [batches, setBatches] = useState([]);
  const [movements, setMovements] = useState([]);
  const [newBatch, setNewBatch] = useState({
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    supplier_batch: '',
    quantity: 0,
    unit_cost: 0,
    quality_status: 'aprovado',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('batches');
  const [loading, setLoading] = useState(false);

  const { notifySuccess, notifyError } = useNotifications();

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadBatchData();
    }
  }, [isOpen, product]);

  const loadBatchData = async () => {
    setLoading(true);
    try {
      // Mock data for batch control - Supabase removed
      console.warn('Batch data loading disabled - using mock data (Supabase removed)');
      
      // Set mock batches data
      const mockBatches = [
        {
          id: 'batch-1',
          batch_number: 'LOT202401001',
          manufacturing_date: '2024-01-15',
          expiry_date: '2024-07-15',
          supplier_batch: 'FORN001',
          quantity: 100,
          available_quantity: 85,
          unit_cost: 15.50,
          quality_status: 'aprovado',
          status: 'ativo',
          location: 'A1-01',
          notes: 'Lote de alta qualidade',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];
      
      const mockMovements = [
        {
          id: 'mov-1',
          batch_id: 'batch-1',
          batch_number: 'LOT202401001',
          type: 'entrada',
          quantity: 100,
          date: '2024-01-15',
          reason: 'Novo lote criado',
          document: '-',
          user: 'Sistema'
        }
      ];
      
      setBatches(mockBatches);
      setMovements(mockMovements);

    } catch (error) {
      console.error('❌ Erro ao carregar dados de lotes:', error);
      setBatches([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const generateBatchNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(batches.length + 1).padStart(3, '0');
    return `LOT${year}${month}${sequence}`;
  };

  const calculateExpiryDate = (manufacturingDate, monthsToAdd = 6) => {
    if (!manufacturingDate) return '';
    const date = new Date(manufacturingDate);
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toISOString().split('T')[0];
  };

  const handleAddBatch = async () => {
    if (!newBatch.batch_number || !newBatch.manufacturing_date || !newBatch.quantity) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = {
        id: `batch-${Date.now()}`,
        batch_number: newBatch.batch_number,
        manufacturing_date: newBatch.manufacturing_date,
        expiry_date: newBatch.expiry_date || calculateExpiryDate(newBatch.manufacturing_date),
        supplier_batch: newBatch.supplier_batch,
        quantity: parseInt(newBatch.quantity),
        available_quantity: parseInt(newBatch.quantity),
        unit_cost: parseFloat(newBatch.unit_cost) || 0,
        quality_status: newBatch.quality_status,
        status: 'ativo',
        location: 'A1-01',
        notes: newBatch.notes,
        created_at: new Date().toISOString().split('T')[0]
      };

      setBatches(prev => [...prev, batch]);

      // Adicionar movimentação de entrada
      const movement = {
        id: `mov-${Date.now()}`,
        batch_id: batch.id,
        batch_number: batch.batch_number,
        type: 'entrada',
        quantity: batch.quantity,
        date: batch.created_at,
        reason: 'Novo lote criado',
        document: '-',
        user: 'Sistema'
      };

      setMovements(prev => [...prev, movement]);

      // Reset form
      setNewBatch({
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        supplier_batch: '',
        quantity: 0,
        unit_cost: 0,
        quality_status: 'aprovado',
        notes: ''
      });

      notifySuccess('✅ Lote Criado', `Lote ${batch.batch_number} cadastrado com sucesso`);
      setError('');
    } catch (error) {
      setError('Erro ao criar lote');
      notifyError('❌ Erro', 'Erro ao criar lote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'text-green-700 bg-green-100';
      case 'esgotado':
        return 'text-gray-700 bg-gray-100';
      case 'vencido':
        return 'text-red-700 bg-red-100';
      case 'bloqueado':
        return 'text-orange-700 bg-orange-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'aprovado':
        return 'text-green-700 bg-green-100';
      case 'reprovado':
        return 'text-red-700 bg-red-100';
      case 'quarentena':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Controle de Lotes</h2>
              <p className="text-purple-100">
                {product ? `Produto: ${product.name}` : 'Gerenciar lotes de estoque'}
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
              { id: 'batches', label: 'Lotes Ativos', icon: Package },
              { id: 'movements', label: 'Movimentações', icon: Truck },
              { id: 'create', label: 'Novo Lote', icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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

          {/* Tab Lotes Ativos */}
          {activeTab === 'batches' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Lotes em Estoque</h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Total de lotes: <span className="font-semibold">{batches.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {batches.map((batch) => (
                  <div key={batch.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Hash className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-mono text-lg font-bold text-gray-900">
                            {batch.batch_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Fornecedor: {batch.supplier_batch}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                          {batch.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(batch.quality_status)}`}>
                          {batch.quality_status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Fabricação:</span>
                          <p className="font-semibold">
                            {new Date(batch.manufacturing_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Validade:</span>
                          <p className={`font-semibold ${
                            isExpired(batch.expiry_date) 
                              ? 'text-red-600' 
                              : isExpiringSoon(batch.expiry_date) 
                                ? 'text-yellow-600' 
                                : 'text-gray-900'
                          }`}>
                            {new Date(batch.expiry_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantidade:</span>
                          <p className="font-semibold">
                            {batch.available_quantity} / {batch.quantity}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Custo Unit.:</span>
                          <p className="font-semibold text-green-600">
                            R$ {batch.unit_cost.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Barra de Disponibilidade */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Disponível</span>
                          <span>{Math.round((batch.available_quantity / batch.quantity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (batch.available_quantity / batch.quantity) > 0.5 
                                ? 'bg-green-500' 
                                : (batch.available_quantity / batch.quantity) > 0.2 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${(batch.available_quantity / batch.quantity) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Alertas */}
                      {isExpired(batch.expiry_date) && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-700 font-medium">Lote vencido</span>
                        </div>
                      )}
                      
                      {isExpiringSoon(batch.expiry_date) && !isExpired(batch.expiry_date) && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 font-medium">Vence em breve</span>
                        </div>
                      )}
                    </div>

                    {batch.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{batch.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Movimentações */}
          {activeTab === 'movements' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Movimentações por Lote</h3>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold text-gray-900">Lote</th>
                        <th className="text-left px-6 py-4 font-semibold text-gray-900">Tipo</th>
                        <th className="text-right px-6 py-4 font-semibold text-gray-900">Quantidade</th>
                        <th className="text-left px-6 py-4 font-semibold text-gray-900">Motivo</th>
                        <th className="text-left px-6 py-4 font-semibold text-gray-900">Data</th>
                        <th className="text-left px-6 py-4 font-semibold text-gray-900">Usuário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {movements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-purple-600">
                              {movement.batch_number}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              movement.type === 'entrada' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {movement.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-semibold ${
                              movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-gray-900">{movement.reason}</p>
                              <p className="text-sm text-gray-600">Doc: {movement.document}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900">
                              {new Date(movement.date).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900">{movement.user}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Criar Novo Lote */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Criar Novo Lote</h3>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Lote *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBatch.batch_number}
                        onChange={(e) => setNewBatch(prev => ({ ...prev, batch_number: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="LOT2024001"
                      />
                      <button
                        onClick={() => setNewBatch(prev => ({ ...prev, batch_number: generateBatchNumber() }))}
                        className="px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                        title="Gerar automaticamente"
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fabricação *
                    </label>
                    <input
                      type="date"
                      value={newBatch.manufacturing_date}
                      onChange={(e) => setNewBatch(prev => ({ 
                        ...prev, 
                        manufacturing_date: e.target.value,
                        expiry_date: calculateExpiryDate(e.target.value)
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Validade
                    </label>
                    <input
                      type="date"
                      value={newBatch.expiry_date}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, expiry_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lote do Fornecedor
                    </label>
                    <input
                      type="text"
                      value={newBatch.supplier_batch}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, supplier_batch: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="FORN001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      value={newBatch.quantity}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custo Unitário
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBatch.unit_cost}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, unit_cost: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status de Qualidade
                    </label>
                    <select
                      value={newBatch.quality_status}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, quality_status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="aprovado">Aprovado</option>
                      <option value="quarentena">Quarentena</option>
                      <option value="reprovado">Reprovado</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={newBatch.notes}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="Informações adicionais sobre o lote..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddBatch}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Criando Lote...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Criar Lote
                    </>
                  )}
                </button>
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

export default BatchControlModal; 