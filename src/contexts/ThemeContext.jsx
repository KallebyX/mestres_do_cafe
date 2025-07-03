/**
 * 🌙☀️ Theme Context - Mestres do Café
 * Sistema de tema escuro/claro com cores da marca
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Cores da marca Mestres do Café
const BRAND_COLORS = {
  dark: '#101820',      // Cor principal escura
  gold: '#b58150',      // Cor dourada/âmbar
  light: '#f7fcff',     // Cor clara
  accent: '#1f2937',    // Cinza escuro para elementos
  neutral: '#6b7280'    // Cinza neutro
};

// Definição dos temas
const themes = {
  light: {
    name: 'light',
    colors: {
      // Backgrounds
      bg: {
        primary: BRAND_COLORS.light,      // #f7fcff
        secondary: '#ffffff',
        tertiary: '#f8fafc',
        card: '#ffffff',
        hover: '#f1f5f9'
      },
      // Textos
      text: {
        primary: BRAND_COLORS.dark,       // #101820
        secondary: '#475569',
        muted: '#64748b',
        inverse: BRAND_COLORS.light
      },
      // Bordas
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        focus: BRAND_COLORS.gold          // #b58150
      },
      // Accents e destaque
      accent: {
        primary: BRAND_COLORS.gold,       // #b58150
        secondary: '#d97706',
        hover: '#92400e'
      },
      // Estados
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      // Backgrounds
      bg: {
        primary: BRAND_COLORS.dark,       // #101820
        secondary: '#1a202c',
        tertiary: '#2d3748',
        card: '#1e293b',
        hover: '#334155'
      },
      // Textos
      text: {
        primary: BRAND_COLORS.light,      // #f7fcff
        secondary: '#cbd5e1',
        muted: '#94a3b8',
        inverse: BRAND_COLORS.dark
      },
      // Bordas
      border: {
        primary: '#374151',
        secondary: '#4b5563',
        focus: BRAND_COLORS.gold          // #b58150
      },
      // Accents e destaque
      accent: {
        primary: BRAND_COLORS.gold,       // #b58150
        secondary: '#fbbf24',
        hover: '#f59e0b'
      },
      // Estados
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  }
};

const _ThemeContext = createContext();

export const _useTheme = () => {
  const _context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const _ThemeProvider = ({ children }) => {
  // Tentar recuperar tema salvo ou usar claro como padrão
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const _savedTheme = localStorage.getItem('mestres-cafe-theme');
      return savedTheme || 'light';
    } catch (error) {
      console.warn('Erro ao carregar tema do localStorage:', error);
      return 'light';
    }
  });

  // Aplicar tema ao documento
  useEffect(() => {
    const _theme = themes[currentTheme];
    const _root = document.documentElement;

    // Definir variáveis CSS customizadas
    Object.entries(theme.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${category}-${key}`, value);
        });
      } else {
        root.style.setProperty(`--color-${category}`, colors);
      }
    });

    // Adicionar classe do tema ao body
    document.body.className = document.body.className.replace(/theme-\w+/g, '').replace(/\bdark\b/g, '');
    document.body.classList.add(`theme-${currentTheme}`);
    
    // Adicionar classe 'dark' para compatibilidade com Tailwind/shadcn
    if (currentTheme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }

    // Salvar tema no localStorage
    try {
      localStorage.setItem('mestres-cafe-theme', currentTheme);
    } catch (error) {
      console.warn('Erro ao salvar tema no localStorage:', error);
    }
  }, [currentTheme]);

  // Função para alternar tema
  const _toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Função para definir tema específico
  const _setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  // Detectar preferência do sistema
  const _getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Usar tema do sistema
  const _useSystemTheme = () => {
    setCurrentTheme(getSystemTheme());
  };

  const _value = {
    // Estado atual
    currentTheme,
    theme: themes[currentTheme],
    isDark: currentTheme === 'dark',
    isLight: currentTheme === 'light',

    // Funções
    toggleTheme,
    setTheme,
    useSystemTheme,
    getSystemTheme,

    // Cores da marca
    brandColors: BRAND_COLORS,

    // Temas disponíveis
    availableThemes: Object.keys(themes)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 