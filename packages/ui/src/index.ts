/**
 * Sistema de Design Premium - Mestres do Café
 * 
 * Sistema completo de componentes UI com identidade visual premium,
 * otimizado para torrefação artesanal de cafés especiais.
 */

// Estilos do sistema de design
import './styles.css';

// Componentes
export * from './components/Button/CoffeeButton';
export * from './components/Card/CoffeeCard';
export * from './components/Card/ProductCard';
export * from './components/Card/ProductGrid';
export * from './components/Card/ProductGridDemo';
export * from './components/Form/CoffeeForm';
export * from './components/Loading/CoffeeLoading';

// Utilitários
export * from './utils';
export * from './utils/animations';
export * from './utils/colors';
export * from './utils/theme';

// Constantes e tipos
export const COFFEE_DESIGN_SYSTEM_VERSION = '1.0.0';

export type CoffeeTheme = 'light' | 'dark' | 'system';

export interface CoffeeDesignTokens {
  colors: {
    primary: {
      light: string;
      medium: string;
      dark: string;
    };
    secondary: {
      light: string;
      medium: string;
      accent: string;
    };
    support: {
      warm: string;
      light: string;
    };
    neutral: Record<string, string>;
    semantic: Record<string, string>;
  };
  typography: {
    fontDisplay: string;
    fontBody: string;
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

export const coffeeDesignTokens: CoffeeDesignTokens = {
  colors: {
    primary: {
      light: '#8B4513',
      medium: '#5D4037',
      dark: '#3E2723'
    },
    secondary: {
      light: '#D2691E',
      medium: '#FF8F00',
      accent: '#FFC107'
    },
    support: {
      warm: '#F4A460',
      light: '#FFE082'
    },
    neutral: {
      100: '#FAFAFA',
      200: '#F5F5F5',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#757575',
      600: '#616161',
      700: '#424242',
      800: '#212121',
      900: '#000000'
    },
    semantic: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    }
  },
  typography: {
    fontDisplay: 'Playfair Display, serif',
    fontBody: 'Inter, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    premium: '0 32px 64px -12px rgba(139, 69, 19, 0.2)'
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

/**
 * Inicializa o sistema de design
 */
export function initializeCoffeeDesignSystem(options?: {
  theme?: CoffeeTheme;
  customTokens?: Partial<CoffeeDesignTokens>;
}): void {
  // Aplica tema inicial
  if (options?.theme) {
    const { applyTheme } = require('./utils/theme');
    applyTheme(options.theme);
  }
  
  // Aplica tokens customizados
  if (options?.customTokens) {
    applyCoffeeTokens(options.customTokens);
  }
  
  // Inicializa animações responsivas
  const { animateOnScroll } = require('./utils/animations');
  animateOnScroll('.coffee-animate-fade-in');
  animateOnScroll('.coffee-animate-slide-in-right');
  animateOnScroll('.coffee-animate-scale-in');
  
  console.log('☕ Sistema de Design Mestres do Café inicializado com sucesso!');
}

/**
 * Aplica tokens de design customizados
 */
function applyCoffeeTokens(customTokens: Partial<CoffeeDesignTokens>): void {
  const root = document.documentElement;
  
  // Aplica cores customizadas
  if (customTokens.colors?.primary) {
    root.style.setProperty('--coffee-primary-light', customTokens.colors.primary.light);
    root.style.setProperty('--coffee-primary-medium', customTokens.colors.primary.medium);
    root.style.setProperty('--coffee-primary-dark', customTokens.colors.primary.dark);
  }
  
  if (customTokens.colors?.secondary) {
    root.style.setProperty('--coffee-secondary-light', customTokens.colors.secondary.light);
    root.style.setProperty('--coffee-secondary-medium', customTokens.colors.secondary.medium);
    root.style.setProperty('--coffee-secondary-accent', customTokens.colors.secondary.accent);
  }
  
  // Aplica tipografia customizada
  if (customTokens.typography?.fontDisplay) {
    root.style.setProperty('--coffee-font-display', customTokens.typography.fontDisplay);
  }
  
  if (customTokens.typography?.fontBody) {
    root.style.setProperty('--coffee-font-body', customTokens.typography.fontBody);
  }
}

/**
 * Utilitário para obter tokens de design atuais
 */
export function getCoffeeDesignTokens(): CoffeeDesignTokens {
  return coffeeDesignTokens;
}

/**
 * Verifica se o sistema de design está inicializado
 */
export function isCoffeeDesignSystemInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  
  const root = document.documentElement;
  return root.style.getPropertyValue('--coffee-primary-light') !== '';
}

/**
 * Constantes de breakpoints responsivos
 */
export const COFFEE_BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

/**
 * Utilitário para queries de mídia
 */
export function createMediaQuery(breakpoint: keyof typeof COFFEE_BREAKPOINTS): string {
  return `(min-width: ${COFFEE_BREAKPOINTS[breakpoint]})`;
}

/**
 * Verifica se está em um breakpoint específico
 */
export function isBreakpoint(breakpoint: keyof typeof COFFEE_BREAKPOINTS): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia(createMediaQuery(breakpoint)).matches;
}