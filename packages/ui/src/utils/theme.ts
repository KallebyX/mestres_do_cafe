/**
 * Utilitários para gerenciamento de tema do sistema de design
 */

import React from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const THEME_KEY = 'coffee-theme';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(THEME_KEY) as Theme | null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Falha silenciosa se localStorage não estiver disponível
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;
  
  root.setAttribute('data-theme', actualTheme);
  
  // Compatibilidade com classes existentes
  if (actualTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initializeTheme(): Theme {
  const stored = getStoredTheme();
  const initial = stored || 'system';
  
  applyTheme(initial);
  
  return initial;
}

export function toggleTheme(currentTheme: Theme): Theme {
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  setStoredTheme(newTheme);
  applyTheme(newTheme);
  return newTheme;
}

export function cycleTheme(currentTheme: Theme): Theme {
  const themes: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const newTheme = themes[nextIndex];
  
  setStoredTheme(newTheme);
  applyTheme(newTheme);
  return newTheme;
}

/**
 * Hook para React (se disponível)
 */
export function useTheme() {
  if (!React || typeof window === 'undefined') {
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      toggleTheme: () => 'light' as Theme,
      cycleTheme: () => 'light' as Theme
    };
  }

  const [theme, setThemeState] = React.useState<Theme>(initializeTheme);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setStoredTheme(newTheme);
    applyTheme(newTheme);
    setThemeState(newTheme);
  }, []);

  const toggle = React.useCallback(() => {
    const newTheme = toggleTheme(theme);
    setThemeState(newTheme);
    return newTheme;
  }, [theme]);

  const cycle = React.useCallback(() => {
    const newTheme = cycleTheme(theme);
    setThemeState(newTheme);
    return newTheme;
  }, [theme]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme: toggle,
    cycleTheme: cycle
  };
}

/**
 * Verifica se estamos no modo escuro
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const root = document.documentElement;
  return root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
}

/**
 * Obtém o tema atual aplicado
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return isDarkMode() ? 'dark' : 'light';
}

/**
 * Provider de tema para React
 */
export function createThemeProvider() {
  if (!React) return null;

  const ThemeContext = React.createContext<{
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => Theme;
    cycleTheme: () => Theme;
    isDark: boolean;
  } | null>(null);

  const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { theme, setTheme, toggleTheme: toggle, cycleTheme: cycle } = useTheme();
    const isDark = getCurrentTheme() === 'dark';

    return React.createElement(
      ThemeContext.Provider,
      {
        value: {
          theme,
          setTheme,
          toggleTheme: toggle,
          cycleTheme: cycle,
          isDark
        }
      },
      children
    );
  };

  const useThemeContext = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
      throw new Error('useThemeContext deve ser usado dentro de um ThemeProvider');
    }
    return context;
  };

  return { ThemeProvider, useThemeContext };
}