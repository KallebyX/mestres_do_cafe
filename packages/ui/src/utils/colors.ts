/**
 * Utilitários para manipulação de cores do sistema de design
 */

export const COFFEE_COLORS = {
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
} as const;

export type CoffeeColorKey = keyof typeof COFFEE_COLORS;
export type CoffeePrimaryColorKey = keyof typeof COFFEE_COLORS.primary;
export type CoffeeSecondaryColorKey = keyof typeof COFFEE_COLORS.secondary;
export type CoffeeSupportColorKey = keyof typeof COFFEE_COLORS.support;
export type CoffeeNeutralColorKey = keyof typeof COFFEE_COLORS.neutral;
export type CoffeeSemanticColorKey = keyof typeof COFFEE_COLORS.semantic;

/**
 * Converte cor hex para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converte RGB para hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Aplica opacidade a uma cor hex
 */
export function withOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Escurece uma cor hex
 */
export function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const darkened = {
    r: Math.max(0, rgb.r - Math.round(255 * amount)),
    g: Math.max(0, rgb.g - Math.round(255 * amount)),
    b: Math.max(0, rgb.b - Math.round(255 * amount))
  };
  
  return rgbToHex(darkened.r, darkened.g, darkened.b);
}

/**
 * Clareia uma cor hex
 */
export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const lightened = {
    r: Math.min(255, rgb.r + Math.round(255 * amount)),
    g: Math.min(255, rgb.g + Math.round(255 * amount)),
    b: Math.min(255, rgb.b + Math.round(255 * amount))
  };
  
  return rgbToHex(lightened.r, lightened.g, lightened.b);
}

/**
 * Retorna cor de contraste apropriada (preto ou branco)
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  // Fórmula de luminância
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Gera uma paleta de cores baseada em uma cor principal
 */
export function generatePalette(baseColor: string, steps: number = 9): string[] {
  const palette: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    if (factor < 0.5) {
      // Tons mais claros
      palette.push(lighten(baseColor, (0.5 - factor) * 0.8));
    } else if (factor === 0.5) {
      // Cor base
      palette.push(baseColor);
    } else {
      // Tons mais escuros
      palette.push(darken(baseColor, (factor - 0.5) * 0.8));
    }
  }
  
  return palette;
}

/**
 * Valida se uma string é uma cor hex válida
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Aplica saturação a uma cor
 */
export function saturate(hex: string, amount: number): string {
  // Implementação simplificada - em um projeto real, usaria HSL
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = 1 + amount;
  const gray = (rgb.r + rgb.g + rgb.b) / 3;
  
  const saturated = {
    r: Math.min(255, Math.max(0, Math.round(gray + (rgb.r - gray) * factor))),
    g: Math.min(255, Math.max(0, Math.round(gray + (rgb.g - gray) * factor))),
    b: Math.min(255, Math.max(0, Math.round(gray + (rgb.b - gray) * factor)))
  };
  
  return rgbToHex(saturated.r, saturated.g, saturated.b);
}

/**
 * Remove saturação de uma cor
 */
export function desaturate(hex: string, amount: number): string {
  return saturate(hex, -amount);
}