import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Menu, X, ShoppingCart, User, LogOut, Settings, Shield } from 'lucide-react';
import Logo from './Logo';

export const Header = () => {
  const { user, logout, profile } = useSupabaseAuth();
  const { getCartCount, cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Gamificação', href: '/gamificacao' },
    { label: 'Cursos', href: '/cursos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Contato', href: '/contato' }
  ];

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
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

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  const isActive = (href) => location.pathname === href;

  const isLoggedIn = !!user;
  const userName = profile?.name || user?.user_metadata?.name || 'Usuário';
  const userRole = profile?.role || 'customer';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled || isMenuOpen
          ? 'bg-brand-light/95 backdrop-blur-sm shadow-lg border-b border-brand-brown/10'
          : 'bg-brand-light/80 backdrop-blur-none shadow-none border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center shrink-0" aria-label="Mestres do Café - Página Inicial">
            <Logo size="medium" showText={true} variant="light" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-6" aria-label="Navegação Principal">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200 relative group',
                  isActive(item.href) ? 'text-brand-brown' : 'text-brand-dark hover:text-brand-brown'
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[2px] bg-brand-brown transition-all duration-300',
                    isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                  aria-hidden="true"
                ></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Link to="/carrinho">
              <button
                className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 hidden lg:inline-flex relative p-2 rounded-md transition-colors"
                aria-label="Carrinho de Compras"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-brown text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cart.length}
                  </span>
                )}
              </button>
            </Link>
            
            {!isLoggedIn ? (
              <div className="hidden lg:flex items-center space-x-1">
                <Link to="/login">
                  <button className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 px-3 py-2 text-sm rounded-md transition-colors">
                    Entrar
                  </button>
                </Link>
                <span className="text-brand-dark/30 hidden md:inline" aria-hidden="true">|</span>
                <Link to="/registro">
                  <button className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light px-3 py-2 text-sm shadow-md hover:shadow-lg transition-all rounded-md">
                    Cadastrar
                  </button>
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3 relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-brand-brown/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitials(userName)}
                  </div>
                  <span className="text-sm font-medium text-brand-dark">{userName}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
                    </div>
                    
                    <Link to="/perfil" onClick={() => setIsUserMenuOpen(false)}>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </button>
                    </Link>
                    
                    {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                      <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </button>
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-brand-dark hover:text-brand-brown focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-brown rounded-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMenuOpen
              ? 'max-h-[calc(100vh-4rem)] opacity-100 py-3 border-t border-brand-brown/10'
              : 'max-h-0 opacity-0 py-0 border-t border-transparent'
          )}
        >
          <nav className="flex flex-col space-y-1.5" aria-label="Navegação Móvel">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block font-medium py-2.5 px-3 rounded-md transition-colors text-base',
                  isActive(item.href)
                    ? 'bg-brand-brown/10 text-brand-brown'
                    : 'text-brand-dark hover:bg-brand-brown/5 hover:text-brand-brown'
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {!isLoggedIn ? (
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-brand-brown/10">
                <Link to="/login" className="flex-1">
                  <button
                    className="border-2 border-brand-brown text-brand-brown hover:bg-brand-brown/10 justify-center w-full py-2 px-4 rounded-md transition-colors bg-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </button>
                </Link>
                <Link to="/registro" className="flex-1">
                  <button
                    className="bg-brand-brown hover:bg-brand-brown/90 text-brand-light justify-center w-full py-2 px-4 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar
                  </button>
                </Link>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-brand-brown/10">
                <div className="flex items-center gap-2 px-3 py-2 text-sm">
                  <div className="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitials(userName)}
                  </div>
                  <div>
                    <div className="font-medium text-brand-dark">{userName}</div>
                    <div className="text-xs text-gray-500 capitalize">{userRole.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sair
                </button>
              </div>
            )}
            
            <Link to="/carrinho">
              <button
                className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 flex items-center justify-start w-full mt-2 py-2.5 px-3 text-base rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrinho
                {cart && cart.length > 0 && (
                  <span className="ml-auto bg-brand-brown text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

