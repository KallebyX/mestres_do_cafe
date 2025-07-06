import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Star, Coffee, AlertCircle, Check, 
  Plus, Minus, Image as ImageIcon 
} from 'lucide-react';
import { 
  createProduct, 
  updateProduct, 
  getProductCategories, 
  getRoastLevels,
  validateProductData 
} from "../lib/api.js"

const ProductModal = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    origin: '',
    roast_level: 'medium',
    sca_score: 80,
    stock: 0,
    is_active: true,
    is_featured: false,
    processing_method: '',
    altitude: '',
    harvest_year: new Date().getFullYear(),
    flavor_notes: [],
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [newFlavorNote, setNewFlavorNote] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Preencher formulário quando editar produto existente
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        origin: product.origin || '',
        roast_level: product.roast_level || 'medium',
        sca_score: product.sca_score || 80,
        stock: product.stock || 0,
        is_active: product.is_active !== false,
        is_featured: product.is_featured || false,
        processing_method: product.processing_method || '',
        altitude: product.altitude || '',
        harvest_year: product.harvest_year || new Date().getFullYear(),
        flavor_notes: product.flavor_notes || [],
        images: product.images || []
      });
    } else if (!product && isOpen) {
      // Reset para novo produto
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        origin: '',
        roast_level: 'medium',
        sca_score: 80,
        stock: 0,
        is_active: true,
        is_featured: false,
        processing_method: '',
        altitude: '',
        harvest_year: new Date().getFullYear(),
        flavor_notes: [],
        images: []
      });
    }
    setErrors([]);
  }, [product, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const addFlavorNote = () => {
    if (newFlavorNote.trim() && !formData.flavor_notes.includes(newFlavorNote.trim())) {
      setFormData(prev => ({
        ...prev,
        flavor_notes: [...prev.flavor_notes, newFlavorNote.trim()]
      }));
      setNewFlavorNote('');
    }
  };

  const removeFlavorNote = (note) => {
    setFormData(prev => ({
      ...prev,
      flavor_notes: prev.flavor_notes.filter(n => n !== note)
    }));
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (url) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar dados
    const validation = validateProductData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (product?.id) {
        // Atualizar produto existente
        result = await updateProduct(product.id, formData);
      } else {
        // Criar novo produto
        result = await createProduct(formData);
      }

      if (result.success) {
        onSuccess && onSuccess(result.data, product ? 'updated' : 'created');
        onClose();
      } else {
        setErrors([result.error || 'Erro ao salvar produto']);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setErrors(['Erro interno do servidor']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {product ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-sm text-slate-600">
                {product ? 'Atualize as informações do produto' : 'Adicione um novo café ao catálogo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Erros */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Corrija os seguintes erros:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">📝 Informações Básicas</h3>
              
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Café Arabica Premium"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Descreva as características, origem e notas do café..."
                  required
                />
              </div>

              {/* Preço e Estoque */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estoque *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Categoria e Nível de Torra */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    {getProductCategories().map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nível de Torra
                  </label>
                  <select
                    value={formData.roast_level}
                    onChange={(e) => handleInputChange('roast_level', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {getRoastLevels().map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Origem e Score SCA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Origem
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex: Brasil, Minas Gerais"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Score SCA
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="60"
                      max="100"
                      value={formData.sca_score}
                      onChange={(e) => handleInputChange('sca_score', parseInt(e.target.value) || 80)}
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Detalhes Avançados */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">⚙️ Detalhes Avançados</h3>
              
              {/* Método de Processamento e Altitude */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Processamento
                  </label>
                  <input
                    type="text"
                    value={formData.processing_method}
                    onChange={(e) => handleInputChange('processing_method', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex: Lavado, Natural, Honey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Altitude
                  </label>
                  <input
                    type="text"
                    value={formData.altitude}
                    onChange={(e) => handleInputChange('altitude', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex: 1200m"
                  />
                </div>
              </div>

              {/* Ano da Safra */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ano da Safra
                </label>
                <input
                  type="number"
                  min="2020"
                  max={new Date().getFullYear() + 1}
                  value={formData.harvest_year}
                  onChange={(e) => handleInputChange('harvest_year', parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Notas de Sabor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas de Sabor
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFlavorNote}
                    onChange={(e) => setNewFlavorNote(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex: Chocolate, Caramelo, Cítrico"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavorNote())}
                  />
                  <button
                    type="button"
                    onClick={addFlavorNote}
                    className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.flavor_notes.map((note, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {note}
                      <button
                        type="button"
                        onClick={() => removeFlavorNote(note)}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Imagens */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagens
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="URL da imagem"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 text-sm text-slate-700 truncate">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-900">Status do Produto</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">Produto ativo no marketplace</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-700">Produto em destaque</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {product ? 'Atualizar Produto' : 'Criar Produto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal; 