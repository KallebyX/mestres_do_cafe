import React, { useState, useEffect } from 'react';
// import { _X, _Save, _MapPin, _Building, _Package, _Scan, _Plus, _Trash2, _Edit, _Search, _Grid, _Map } from 'lucide-react'; // Temporarily commented - unused import
import { _useNotifications } from '../contexts/NotificationContext';
import { _supabase } from '../lib/supabase';

const _ProductLocationModal = ({ 
  isOpen, 
  onClose, 
  product = null,
  onSuccess 
}) => {
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [newLocation, setNewLocation] = useState({
    warehouse_id: '',
    zone: '',
    aisle: '',
    shelf: '',
    position: '',
    quantity: 0,
    max_capacity: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { notifySuccess, notifyError } = useNotifications();

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadWarehouses();
      if (product) {
        loadProductLocations();
      }
    }
  }, [isOpen, product]);

  const _loadWarehouses = async () => {
    try {
      // Buscar depósitos reais do Supabase
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar depósitos:', error);
        setWarehouses([]);
      } else {
        setWarehouses(data || []);
        console.log(`✅ ${data?.length || 0} depósitos carregados do Supabase`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar depósitos:', error);
      setWarehouses([]);
    }
  };

  const _loadProductLocations = async () => {
    try {
      // Buscar localizações reais do produto no Supabase
      const { data, error } = await supabase
        .from('product_locations')
        .select(`
          *,
          warehouse:warehouses(name)
        `)
        .eq('product_id', product.id)
        .order('position');

      if (error) {
        console.error('Erro ao buscar localizações:', error);
        setLocations([]);
      } else {
        const _mappedLocations = data?.map(location => ({
          id: location.id,
          warehouse_id: location.warehouse_id,
          warehouse_name: location.warehouse?.name || 'Depósito não encontrado',
          zone: location.zone,
          aisle: location.aisle,
          shelf: location.shelf,
          position: location.position,
          quantity: location.quantity,
          max_capacity: location.max_capacity,
          last_movement: location.updated_at || location.created_at
        })) || [];

        setLocations(mappedLocations);
        console.log(`✅ ${mappedLocations.length} localizações carregadas do Supabase`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar localizações:', error);
      setLocations([]);
    }
  };

  const _generateLocationCode = () => {
    const { zone, aisle, shelf } = newLocation;
    if (zone && aisle && shelf) {
      return `${zone}${aisle}-${shelf.padStart(2, '0')}`;
    }
    return '';
  };

  const _handleAddLocation = async () => {
    if (!newLocation.warehouse_id || !newLocation.zone || !newLocation.aisle || !newLocation.shelf) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const _locationCode = generateLocationCode();
      const _warehouse = warehouses.find(w => w.id === newLocation.warehouse_id);

      const _location = {
        id: `loc-${Date.now()}`,
        warehouse_id: newLocation.warehouse_id,
        warehouse_name: warehouse?.name || '',
        zone: newLocation.zone,
        aisle: newLocation.aisle,
        shelf: newLocation.shelf,
        position: locationCode,
        quantity: parseInt(newLocation.quantity) || 0,
        max_capacity: parseInt(newLocation.max_capacity) || 100,
        last_movement: new Date().toISOString().split('T')[0]
      };

      setLocations(prev => [...prev, location]);
      
      // Reset form
      setNewLocation({
        warehouse_id: '',
        zone: '',
        aisle: '',
        shelf: '',
        position: '',
        quantity: 0,
        max_capacity: 100
      });

      notifySuccess('✅ Localização Adicionada', `Nova localização ${locationCode} cadastrada`);
      setError('');
    } catch (error) {
      setError('Erro ao adicionar localização');
      notifyError('❌ Erro', 'Erro ao adicionar localização');
    } finally {
      setIsSubmitting(false);
    }
  };

  const _handleRemoveLocation = async (locationId) => {
    if (window.confirm('Tem certeza que deseja remover esta localização?')) {
      setLocations(prev => prev.filter(l => l.id !== locationId));
      notifySuccess('✅ Localização Removida', 'Localização removida com sucesso');
    }
  };

  const _handleSave = async () => {
    if (onSuccess) {
      onSuccess(locations);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Localização Física</h2>
              <p className="text-orange-100">
                {product ? `Produto: ${product.nome}` : 'Gerenciar localizações'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form para Nova Localização */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Localização
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depósito
                  </label>
                  <select
                    value={newLocation.warehouse_id}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, warehouse_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecione um depósito</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona
                  </label>
                  <input
                    type="text"
                    placeholder="A, B, C..."
                    value={newLocation.zone}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, zone: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corredor
                  </label>
                  <input
                    type="text"
                    placeholder="1, 2, 3..."
                    value={newLocation.aisle}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, aisle: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prateleira
                  </label>
                  <input
                    type="text"
                    placeholder="01, 02, 03..."
                    value={newLocation.shelf}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, shelf: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={newLocation.quantity}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidade Máxima
                  </label>
                  <input
                    type="number"
                    value={newLocation.max_capacity}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, max_capacity: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              {/* Preview da Localização */}
              {generateLocationCode() && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Código da Localização:</p>
                  <p className="text-xl font-mono font-bold text-orange-600">
                    {generateLocationCode()}
                  </p>
                </div>
              )}

              <button
                onClick={handleAddLocation}
                disabled={isSubmitting}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Adicionar Localização
                  </>
                )}
              </button>
            </div>

            {/* Lista de Localizações Existentes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5" />
                Localizações Atuais
              </h3>

              {locations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Nenhuma localização cadastrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-mono text-lg font-bold text-gray-900">
                                {location.position}
                              </p>
                              <p className="text-sm text-gray-600">
                                {location.warehouse_name}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Quantidade:</span>
                              <span className="ml-2 font-semibold">{location.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Capacidade:</span>
                              <span className="ml-2 font-semibold">{location.max_capacity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Ocupação:</span>
                              <span className="ml-2 font-semibold">
                                {Math.round((location.quantity / location.max_capacity) * 100)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Última Movimentação:</span>
                              <span className="ml-2 font-semibold">
                                {new Date(location.last_movement).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          {/* Barra de Ocupação */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (location.quantity / location.max_capacity) > 0.8 
                                    ? 'bg-red-500' 
                                    : (location.quantity / location.max_capacity) > 0.6 
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((location.quantity / location.max_capacity) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveLocation(location.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Localizações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductLocationModal; 