import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Settings, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu') && !event.target.closest('.user-menu-button')) {
        setIsUserMenuOpen(false);
      }
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#2B3A42] shadow-lg sticky top-0 z-50 border-b border-[#C8956D]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#C8956D] rounded-full flex items-center justify-center shadow-lg">
              <Coffee className="text-[#2B3A42] w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl lg:text-2xl font-bold text-white">Mestres do Café</span>
              <div className="text-xs lg:text-sm text-[#C8956D] font-medium">Torrefação Artesanal</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30' 
                  : 'text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5'
              }`}
            >
              Início
            </Link>
            <Link
              to="/marketplace"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/marketplace') 
                  ? 'text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30' 
                  : 'text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5'
              }`}
            >
              Marketplace
            </Link>
            {user?.user_type === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/admin') 
                    ? 'text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30' 
                    : 'text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-300 hover:text-[#C8956D] transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8956D] text-[#2B3A42] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="user-menu-button flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5 transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.name?.split(' ')[0]}</span>
                  <span className="text-xs bg-[#C8956D] text-[#2B3A42] px-2 py-1 rounded-full font-semibold">
                    {user.user_type === 'admin' ? 'Admin' : user.user_type === 'cliente_pj' ? 'PJ' : 'PF'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1A2328] border border-[#C8956D]/20 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#C8956D] text-sm font-medium">{user.points || 0} pontos</span>
                        <span className="text-gray-400 text-sm">{user.level || 'Bronze'}</span>
                      </div>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      {user.user_type === 'admin' ? 'Painel Admin' : 'Meu Perfil'}
                    </Link>
                    
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-3" />
                      Meus Pedidos
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-400/5 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-[#C8956D] font-medium transition-colors duration-200"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-[#C8956D] text-[#2B3A42] font-semibold rounded-lg hover:bg-[#C8956D]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Mobile Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-300 hover:text-[#C8956D] transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8956D] text-[#2B3A42] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-button p-2 text-gray-300 hover:text-[#C8956D] transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1A2328] rounded-lg mt-2 border border-[#C8956D]/20">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30' 
                    : 'text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/marketplace"
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/marketplace') 
                    ? 'text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30' 
                    : 'text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              
              {user?.user_type === 'admin' && (
                <Link
                  to="/admin"
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/admin') 
                      ? 'text-[#C8956D] bg-[#C8956D]/10 border border-[#C8956D]/30' 
                      : 'text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}

              {user ? (
                <>
                  <div className="px-4 py-3 border-t border-gray-700 mt-2">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#C8956D] text-sm font-medium">{user.points || 0} pontos</span>
                      <span className="text-gray-400 text-sm">{user.level || 'Bronze'}</span>
                    </div>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-3 text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5 transition-colors duration-200 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    {user.user_type === 'admin' ? 'Painel Admin' : 'Meu Perfil'}
                  </Link>
                  
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 text-gray-300 hover:text-[#C8956D] hover:bg-[#C8956D]/5 transition-colors duration-200 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-3" />
                    Meus Pedidos
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-400/5 transition-colors duration-200 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 space-y-2 border-t border-gray-700 mt-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 text-center text-gray-300 hover:text-[#C8956D] font-medium transition-colors duration-200 border border-gray-600 rounded-lg hover:border-[#C8956D]/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-3 text-center bg-[#C8956D] text-[#2B3A42] font-semibold rounded-lg hover:bg-[#C8956D]/90 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
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

