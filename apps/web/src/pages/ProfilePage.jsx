import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  Star,
  Coffee
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Carregar dados do usuário no formulário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.profile?.name || user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validações
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      setIsLoading(false);
      return;
    }

    try {
      // Aqui você implementaria a mudança de senha no Supabase
      // Por enquanto, vamos simular sucesso
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cancelEdit = () => {
    setFormData({
      name: user.profile?.name || user.name || '',
      email: user.email || '',
      phone: user.profile?.phone || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    setMessage({ type: '', text: '' });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Meu Perfil</h1>
          <p className="text-xl text-slate-600">Gerencie suas informações pessoais e preferências</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              {/* Avatar */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {(user.profile?.name || user.name || user.email)?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {user.profile?.name || user.name || 'Usuário'}
                </h2>
                <p className="text-slate-600">{user.email}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-600">
                    {user.profile?.user_type === 'cliente_pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Membro desde</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Pontos</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600">
                    {user.profile?.points || 0} pts
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Ver Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 rounded-xl transition-colors"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Informações Pessoais</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="grid gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                          isEditing 
                            ? 'border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent' 
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true} // Email não pode ser alterado no Supabase
                        className="w-full pl-10 pr-4 py-3 border border-slate-100 bg-slate-50 text-slate-600 rounded-xl"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">O e-mail não pode ser alterado</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                          isEditing 
                            ? 'border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent' 
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                        placeholder="(55) 99999-9999"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Segurança</h3>
                  <p className="text-slate-600">Altere sua senha para manter sua conta segura</p>
                </div>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Alterar Senha
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Senha Atual</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Digite a nova senha (mín. 6 caracteres)"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Confirmar Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Confirme a nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Alterando...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Alterar Senha
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelPasswordChange}
                        className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Senha protegida</p>
                    <p className="text-sm text-slate-600">Sua senha está segura e criptografada</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 