import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Key, Shield, AlertCircle, Check } from 'lucide-react';
import { createUserAdmin, updateUserAdmin } from "../lib/api";

const UserModal = ({ 
  isOpen, 
  onClose, 
  user = null, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    is_admin: false,
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Preencher formulário quando editar usuário existente
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        phone: user.phone || '',
        is_admin: user.is_admin || false,
        is_active: user.is_active !== false
      });
    } else if (!user && isOpen) {
      // Reset para novo usuário
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        is_admin: false,
        is_active: true
      });
    }
    
    // Limpar erros ao abrir/fechar modal
    setErrors([]);
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.name.trim()) {
      newErrors.push('Nome é obrigatório');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Email deve ter um formato válido');
    }

    // Para novo usuário, senha é obrigatória
    if (!user && !formData.password) {
      newErrors.push('Senha é obrigatória');
    }

    // Se há senha, validar
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.push('Senha deve ter pelo menos 6 caracteres');
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Senhas não coincidem');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Preparar dados para envio
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        is_admin: formData.is_admin,
        is_active: formData.is_active
      };

      // Incluir senha apenas se fornecida
      if (formData.password) {
        userData.password = formData.password;
      }

      let result;
      
      if (user?.id) {
        // Atualizar usuário existente
        result = await updateUserAdmin(user.id, userData);
      } else {
        // Criar novo usuário
        result = await createUserAdmin(userData);
      }

      if (result.success) {
        onSuccess && onSuccess(result.data, user ? 'updated' : 'created');
        onClose();
      } else {
        setErrors([result.error || 'Erro ao salvar usuário']);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setErrors(['Erro interno do servidor']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Erros */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro</span>
              </div>
              <ul className="mt-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nome */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Nome completo"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {!user && '*'}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={user ? "Deixe em branco para manter a atual" : "Senha do usuário"}
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          {formData.password && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Confirme a senha"
                />
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleInputChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 flex items-center gap-1">
                <Shield className="w-4 h-4 text-amber-600" />
                Administrador
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-green-600" />
                Usuário ativo
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-md hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {user ? 'Atualizar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;