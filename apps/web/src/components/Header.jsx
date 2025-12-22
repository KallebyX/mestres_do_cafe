import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Menu, X, ShoppingCart, User, LogOut, Shield,
  ChevronDown, Coffee, BookOpen, Users, Mail, Info,
  Home, Store, Trophy, GraduationCap
} from 'lucide-react';
import Logo from './Logo';
import CartDropdown from './CartDropdown';
import { ThemeToggleIcon } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';

export const Header = () => {
  const { user, logout, profile } = useAuth();
  const { getCartItemsCountSafe } = useCart();
  const { isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Marketplace', href: '/marketplace', icon: Store },
    { label: 'Clube dos Mestres', href: '/gamificacao', icon: Trophy },
    { label: 'Cursos', href: '/cursos', icon: GraduationCap },
    { label: 'Blog', href: '/blog', icon: BookOpen },
    { label: 'Sobre', href: '/sobre', icon: Info },
    { label: 'Contato', href: '/contato', icon: Mail }
  ];

  // Fechar menu do usuario quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevenir scroll quando menu mobile estiver aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const isActive = (href) => location.pathname === href;
  const isLoggedIn = !!user;
  const userName = profile?.name || user?.user_metadata?.name || 'Usuario';
  const userRole = profile?.role || 'customer';
  const cartCount = getCartItemsCountSafe();

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 w-full transition-all duration-300
          ${isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-border/50'
            : 'bg-transparent'
          }
        `}
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="Mestres do Cafe - Pagina Inicial"
            >
              <Logo size="medium" showText={true} variant={isDark ? 'dark' : 'light'} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegacao Principal">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`
                    nav-link px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive(item.href)
                      ? 'text-brand-brown bg-brand-brown/10'
                      : 'text-foreground/70 hover:text-brand-brown hover:bg-brand-brown/5'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggleIcon size="md" className="btn-ghost btn-icon" />

              {/* Notifications */}
              {isLoggedIn && <NotificationCenter />}

              {/* Cart */}
              <CartDropdown />

              {/* Auth Buttons ou User Menu */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login">
                    <button className="btn-ghost px-4 py-2 text-sm">
                      Entrar
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="btn-primary px-4 py-2 text-sm">
                      Cadastrar
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="relative ml-2" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl
                               bg-muted hover:bg-brand-brown/10 transition-all duration-200"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-brown flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getUserInitials(userName)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                      {userName.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200
                      ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="dropdown-menu">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{userName}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {userRole.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link to="/perfil" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="dropdown-item flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            Meu Perfil
                          </span>
                        </Link>

                        {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                            <span className="dropdown-item flex items-center gap-3">
                              <Shield className="w-4 h-4 text-muted-foreground" />
                              Painel Admin
                            </span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleLogout}
                          className="dropdown-item w-full flex items-center gap-3 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <ThemeToggleIcon size="sm" />

              {/* Mobile Cart Button */}
              <Link to="/carrinho" className="relative p-2.5 rounded-xl hover:bg-muted transition-colors">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-brown text-white
                                   text-xs font-medium rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="p-2.5 rounded-xl hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-40 lg:hidden transition-all duration-300
          ${isMenuOpen ? 'visible' : 'invisible'}
        `}
      >
        {/* Backdrop */}
        <div
          className={`
            absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
            ${isMenuOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`
            absolute right-0 top-0 h-full w-full max-w-sm bg-card shadow-premium
            transform transition-transform duration-300 ease-out
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            safe-top
          `}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <Logo size="small" showText={true} variant={isDark ? 'dark' : 'light'} />
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex flex-col h-[calc(100%-72px)] overflow-y-auto">
            {/* User Section (if logged in) */}
            {isLoggedIn && (
              <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-brown flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {getUserInitials(userName)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{userName}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {userRole.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 px-2 py-4" aria-label="Navegacao Mobile">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3.5 rounded-xl
                          transition-all duration-200 touch-target
                          ${isActive(item.href)
                            ? 'bg-brand-brown/10 text-brand-brown font-medium'
                            : 'text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Actions */}
            {isLoggedIn ? (
              <div className="px-2 py-4 border-t border-border">
                <Link
                  to="/perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Meu Perfil</span>
                </Link>

                {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Painel Admin</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl
                             text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="px-4 py-4 border-t border-border space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                  <button className="btn-outline w-full py-3">
                    Entrar
                  </button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block">
                  <button className="btn-primary w-full py-3">
                    Criar Conta
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
