import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    let isMounted = true;
    
    const initTheme = () => {
      try {
        // Verificar se localStorage está disponível
        if (typeof localStorage === 'undefined') return;
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && isMounted) {
          setTheme(savedTheme);
        } else if (isMounted) {
          // Verificar preferência do sistema
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
        if (isMounted) setTheme('light');
      }
    };

    initTheme();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      // Verificar se localStorage está disponível
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
      
      // Verificar se document está disponível
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;