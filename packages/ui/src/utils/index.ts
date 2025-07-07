/**
 * Utilitários básicos do sistema de design
 * Versão simplificada que não depende de bibliotecas externas
 */

type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

/**
 * Combina classes CSS de forma inteligente
 * Versão simplificada do clsx + tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) {
        classes.push(result);
      }
    }
  }
  
  // Remove duplicatas e retorna
  return Array.from(new Set(classes)).join(' ');
}

export * from './theme';
export * from './animations';
export * from './colors';