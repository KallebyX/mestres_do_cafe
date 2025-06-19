import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar mensagem quando usuário começar a digitar
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validações
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' });
      }
    } catch (_error) { // eslint-disable-line no-unused-vars
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null; // Ou um componente de loading
  }

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <Header />
      
      <main className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
              Meu Perfil
            </h1>
            <p className="text-coffee-gray text-lg">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Informações do Usuário */}
            <div className="lg:col-span-1">
              <div className="card text-center">
                <div className="w-24 h-24 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-coffee-white font-cormorant font-bold text-3xl">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="font-cormorant font-bold text-2xl text-coffee-intense mb-2">
                  {user.name}
                </h2>
                <p className="text-coffee-gray mb-4">{user.email}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-gray">Tipo de Conta:</span>
                    <span className="text-coffee-gold font-medium">
                      {user.user_type === 'cliente_pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-gray">Membro desde:</span>
                    <span className="text-coffee-intense">
                      {new Date(user.created_at || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full mt-6"
                >
                  Sair da Conta
                </button>
              </div>
            </div>

            {/* Formulário de Edição */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="font-cormorant font-bold text-2xl text-coffee-intense mb-6">
                  Editar Informações
                </h3>

                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-100 border border-green-400 text-green-700'
                      : 'bg-red-100 border border-red-400 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-coffee-intense font-medium mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-coffee-intense font-medium mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-coffee-intense font-medium mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                      placeholder="(55) 99999-9999"
                    />
                  </div>

                  <div className="border-t border-coffee-cream pt-6">
                    <h4 className="font-cormorant font-bold text-xl text-coffee-intense mb-4">
                      Alterar Senha
                    </h4>
                    <p className="text-coffee-gray text-sm mb-4">
                      Deixe em branco se não deseja alterar a senha
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-coffee-intense font-medium mb-2">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                          placeholder="Digite sua senha atual"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="newPassword" className="block text-coffee-intense font-medium mb-2">
                            Nova Senha
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                            placeholder="Nova senha (mín. 6 caracteres)"
                          />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-coffee-intense font-medium mb-2">
                            Confirmar Nova Senha
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                            placeholder="Confirme a nova senha"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex-1 py-3 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-white mr-2"></div>
                          Salvando...
                        </div>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/marketplace')}
                      className="btn-secondary px-6 py-3"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage; 