import React, { useState, useEffect } from 'react';
import { 
  X, Save, AlertCircle, Package, DollarSign, 
  Hash, BarChart3, ShoppingCart, Truck, Eye, Upload
} from 'lucide-react';
import { stockAPI } from "@/lib/api.js"
import { useNotifications } from '../contexts/NotificationContext';

const ProductStockModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' | 'edit' | 'view'
  product = null,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_id: '',
    description: '',
    unit_of_measure: 'kg',
    cost_price: '',
    sale_price: '',
    min_stock: '',
    max_stock: '',
    current_stock: '',
    supplier_id: '',
    weight: '',
    dimensions: '',
    image_url: ''
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { notifySuccess, notifyError } = useNotifications();

  const unitOptions = [
    { value: 'kg', label: 'Quilograma' },
    { value: 'g', label: 'Grama' },
    { value: 'un', label: 'Unidade' },
    { value: 'lt', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'pc', label: 'Peça' },
    { value: 'cx', label: 'Caixa' },
    { value: 'sc', label: 'Saco' }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadSelectOptions();
      
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          category_id: product.category_id || '',
          description: product.description || '',
          unit_of_measure: product.unit_of_measure || 'kg',
          cost_price: product.cost_price ? product.cost_price.toString() : '',
          sale_price: product.sale_price ? product.sale_price.toString() : '',
          min_stock: product.min_stock ? product.min_stock.toString() : '',
          max_stock: product.max_stock ? product.max_stock.toString() : '',
          current_stock: product.current_stock ? product.current_stock.toString() : '',
          supplier_id: product.supplier_id || '',
          weight: product.weight ? product.weight.toString() : '',
          dimensions: product.dimensions || '',
          image_url: product.image_url || ''
        });
      } else if (mode === 'create') {
        setFormData({
          name: '',
          sku: generateSKU(),
          barcode: '',
          category_id: '',
          description: '',
          unit_of_measure: 'kg',
          cost_price: '',
          sale_price: '',
          min_stock: '10',
          max_stock: '100',
          current_stock: '0',
          supplier_id: '',
          weight: '',
          dimensions: '',
          image_url: ''
        });
      }
      
      setError('');
      setFieldErrors({});
    }
  }, [isOpen, mode, product]);

  const loadSelectOptions = async () => {
    try {
      const [categoriesResult, suppliersResult, warehousesResult] = await Promise.all([
        stockAPI.getProductCategories(),
        stockAPI.getSuppliers(),
        stockAPI.getWarehouses()
      ]);

      if (categoriesResult.success) setCategories(categoriesResult.data);
      if (suppliersResult.success) setSuppliers(suppliersResult.data);
      if (warehousesResult.success) setWarehouses(warehousesResult.data);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `SKU${timestamp}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Campos obrigatórios
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.sku.trim()) errors.sku = 'SKU é obrigatório';
    if (!formData.unit_of_measure) errors.unit_of_measure = 'Unidade de medida é obrigatória';

    // Validações numéricas
    if (formData.cost_price && isNaN(parseFloat(formData.cost_price))) {
      errors.cost_price = 'Preço de custo deve ser um número válido';
    }
    if (formData.sale_price && isNaN(parseFloat(formData.sale_price))) {
      errors.sale_price = 'Preço de venda deve ser um número válido';
    }
    if (formData.current_stock && isNaN(parseInt(formData.current_stock))) {
      errors.current_stock = 'Estoque atual deve ser um número válido';
    }
    if (formData.min_stock && isNaN(parseInt(formData.min_stock))) {
      errors.min_stock = 'Estoque mínimo deve ser um número válido';
    }
    if (formData.max_stock && isNaN(parseInt(formData.max_stock))) {
      errors.max_stock = 'Estoque máximo deve ser um número válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : 0,
        current_stock: formData.current_stock ? parseInt(formData.current_stock) : 0,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0,
        max_stock: formData.max_stock ? parseInt(formData.max_stock) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        is_active: true
      };

      let result;
      if (mode === 'create') {
        result = await stockAPI.createProduct(productData);
      } else {
        result = await stockAPI.updateProduct(product.id, productData);
      }

      if (result.success) {
        notifySuccess(
          mode === 'create' ? '✅ Produto Criado' : '✅ Produto Atualizado',
          `${formData.name} foi ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso`,
          '/admin/estoque'
        );
        onSuccess && onSuccess(result.data);
        onClose();
      } else {
        setError(result.error);
        notifyError('❌ Erro', result.error);
      }
    } catch (error) {
      setError('Erro interno do servidor');
      notifyError('❌ Erro', 'Erro interno do servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">
              {mode === 'create' ? 'Novo Produto' : mode === 'edit' ? 'Editar Produto' : 'Visualizar Produto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.name ? 'border-red-300' : 'border-gray-200'
                  } ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Ex: Café Arabica Premium"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.sku ? 'border-red-300' : 'border-gray-200'
                  } ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="SKU123456"
                />
                {fieldErrors.sku && (
                  <p className="mt-1 text-red-600 text-sm">{fieldErrors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Código de Barras
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="7891234567890"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Categoria
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  rows={3}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Descrição detalhada do produto..."
                />
              </div>
            </div>
          </div>

          {/* Preços e Estoque */}
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Preços e Estoque
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Unidade de Medida *
                </label>
                <select
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  {unitOptions.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Preço de Custo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Preço de Venda (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Estoque Atual
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Estoque Máximo
                </label>
                <input
                  type="number"
                  name="max_stock"
                  value={formData.max_stock}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Informações Adicionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Fornecedor
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Dimensões (L x A x P)
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="Ex: 30x20x15 cm"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-gray-100' : ''}`}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'create' ? 'Criando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {mode === 'create' ? 'Criar Produto' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Botão Visualizar */}
          {isReadOnly && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Fechar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductStockModal; 