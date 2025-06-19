import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Fechar menu do usuário quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-coffee-white shadow-coffee sticky top-0 z-50 border-b border-coffee-cream font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-105 flex-shrink-0"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-coffee rounded-full flex items-center justify-center shadow-gold">
              <span className="text-coffee-white font-cormorant font-bold text-lg lg:text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-cormorant font-bold text-lg lg:text-xl text-coffee-intense">
                Mestres do Café
              </span>
              <div className="text-xs text-coffee-gold font-medium">
                Torrefação Artesanal
              </div>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Início
            </Link>
            <Link 
              to="/marketplace" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Marketplace
            </Link>
            <Link 
              to="/gamificacao" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Gamificação
            </Link>
            <Link 
              to="/sobre" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Sobre
            </Link>
            <Link 
              to="/cursos" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Cursos
            </Link>
            <Link 
              to="/blog" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Blog
            </Link>
            <Link 
              to="/contato" 
              className="text-coffee-intense hover:text-coffee-gold transition-colors font-medium py-2 px-1 border-b-2 border-transparent hover:border-coffee-gold text-sm"
            >
              Contato
            </Link>
          </nav>

          {/* Ações do Usuário */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            {user ? (
              <>
                {/* Carrinho */}
                <Link
                  to="/carrinho"
                  className="relative p-2 bg-coffee-cream hover:bg-coffee-gold/20 rounded-full transition-colors group"
                >
                  <span className="text-lg text-coffee-gold group-hover:text-coffee-intense">🛒</span>
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-coffee-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getCartCount()}
                    </span>
                  )}
                </Link>

                {/* Menu do Usuário */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-coffee-cream hover:bg-coffee-gold/20 rounded-full py-2 px-3 transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-coffee rounded-full flex items-center justify-center">
                      <span className="text-coffee-white text-sm font-bold">
                        {getUserInitials(user.name)}
                      </span>
                    </div>
                    <span className="hidden lg:block text-coffee-intense font-medium group-hover:text-coffee-gold text-sm">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className={`text-coffee-gold transition-transform text-xs ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-coffee-white border-2 border-coffee-cream rounded-xl shadow-gold overflow-hidden">
                      <div className="bg-coffee-cream/50 px-4 py-3 border-b border-coffee-cream">
                        <p className="font-medium text-coffee-intense">{user.name}</p>
                        <p className="text-sm text-coffee-gray">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-coffee-intense hover:bg-coffee-cream transition-colors"
                      >
                        <span className="text-coffee-gold">👤</span>
                        <span>Meu Perfil</span>
                      </Link>
                      <Link
                        to="/pedidos"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-coffee-intense hover:bg-coffee-cream transition-colors"
                      >
                        <span className="text-coffee-gold">📦</span>
                        <span>Meus Pedidos</span>
                      </Link>
                      <Link
                        to="/carrinho"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-coffee-intense hover:bg-coffee-cream transition-colors"
                      >
                        <span className="text-coffee-gold">🛒</span>
                        <span>Carrinho ({getCartCount()})</span>
                      </Link>
                      <Link
                        to="/subscriptions"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-coffee-intense hover:bg-coffee-cream transition-colors"
                      >
                        <span className="text-coffee-gold">📋</span>
                        <span>Assinaturas</span>
                      </Link>
                      <div className="border-t border-coffee-cream"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <span>🚪</span>
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary px-3 py-2 text-xs lg:px-4 lg:py-2 lg:text-sm"
                >
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  className="btn-primary px-3 py-2 text-xs lg:px-4 lg:py-2 lg:text-sm"
                >
                  Cadastrar
                </Link>
              </>
            )}

            {/* Menu Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-coffee-intense hover:text-coffee-gold transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-coffee-cream py-4">
            <div className="space-y-4">
              {/* Links de Navegação Mobile */}
              <nav className="space-y-1">
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  🏠 Início
                </Link>
                <Link 
                  to="/marketplace" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  🛍️ Marketplace
                </Link>
                <Link 
                  to="/gamificacao" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  🏆 Gamificação
                </Link>
                <Link 
                  to="/sobre" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  ℹ️ Sobre
                </Link>
                <Link 
                  to="/cursos" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  🎓 Cursos
                </Link>
                <Link 
                  to="/blog" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  📝 Blog
                </Link>
                <Link 
                  to="/contato" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 text-coffee-intense hover:bg-coffee-cream hover:text-coffee-gold transition-colors rounded-lg font-medium"
                >
                  📞 Contato
                </Link>
              </nav>

              {/* Ações Mobile para usuários não logados */}
              {!user && (
                <div className="pt-4 border-t border-coffee-cream space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full btn-secondary text-center py-3"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/registro"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full btn-primary text-center py-3"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

