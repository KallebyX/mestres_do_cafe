/**
 * 🌙☀️ Theme Toggle - Mestres do Café
 * Botão para alternar entre tema claro e escuro
 */

import React from 'react';
// import { _Sun, _Moon } from 'lucide-react'; // Temporarily commented - unused import
import { _useTheme } from '../contexts/ThemeContext';

const _ThemeToggle = ({ size = 'md', className = '' }) => {
  const { currentTheme, toggleTheme, isDark } = useTheme();

  // Tamanhos disponíveis
  const _sizes = {
    sm: {
      button: 'w-10 h-10',
      icon: 'w-4 h-4'
    },
    md: {
      button: 'w-12 h-12',
      icon: 'w-5 h-5'
    },
    lg: {
      button: 'w-14 h-14',
      icon: 'w-6 h-6'
    }
  };

  const _sizeClasses = sizes[size] || sizes.md;

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses.button}
        relative
        rounded-full
        transition-all
        duration-300
        ease-in-out
        transform
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        group
        ${isDark 
          ? 'bg-gradient-to-br from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 focus:ring-purple-500 shadow-lg shadow-purple-500/25' 
          : 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:ring-amber-500 shadow-lg shadow-amber-500/25'
        }
        ${className}
      `}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
    >
      {/* Background com efeito de transição */}
      <div 
        className={`
          absolute inset-0 rounded-full transition-opacity duration-300
          ${isDark 
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 opacity-20' 
            : 'bg-gradient-to-br from-yellow-300 to-orange-400 opacity-30'
          }
        `}
      />
      
      {/* Container dos ícones */}
      <div className="relative flex items-center justify-center h-full">
        {/* Ícone do Sol */}
        <Sun 
          className={`
            ${sizeClasses.icon}
            absolute
            text-white
            transition-all
            duration-500
            transform
            ${isDark 
              ? 'opacity-0 rotate-90 scale-50' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
        
        {/* Ícone da Lua */}
        <Moon 
          className={`
            ${sizeClasses.icon}
            absolute
            text-white
            transition-all
            duration-500
            transform
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-50'
            }
          `}
        />
      </div>

      {/* Efeito de pulso quando ativo */}
      <div 
        className={`
          absolute inset-0 rounded-full
          transition-all duration-300
          ${isDark 
            ? 'bg-purple-400' 
            : 'bg-amber-300'
          }
          opacity-0 group-active:opacity-20 group-active:scale-75
        `}
      />

      {/* Indicador de tema */}
      <div 
        className={`
          absolute -bottom-1 -right-1
          w-3 h-3
          rounded-full
          border-2
          transition-all duration-300
          ${isDark 
            ? 'bg-purple-400 border-purple-300' 
            : 'bg-amber-400 border-amber-300'
          }
        `}
      />
    </button>
  );
};

// Versão compacta para uso em menus
export const _ThemeToggleCompact = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2 px-3 py-2
        text-sm font-medium
        rounded-lg
        transition-all duration-200
        hover:bg-opacity-80
        focus:outline-none focus:ring-2
        ${isDark 
          ? 'text-gray-200 hover:bg-gray-700 focus:ring-purple-500' 
          : 'text-gray-700 hover:bg-gray-100 focus:ring-amber-500'
        }
        ${className}
      `}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4" />
          <span>Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span>Escuro</span>
        </>
      )}
    </button>
  );
};

// Versão apenas ícone para barras de ferramentas
export const _ThemeToggleIcon = ({ size = 'md', className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  
  const _sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-lg
        transition-all duration-200
        hover:bg-opacity-10
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark 
          ? 'text-gray-300 hover:bg-white focus:ring-purple-500' 
          : 'text-gray-600 hover:bg-black focus:ring-amber-500'
        }
        ${className}
      `}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-180" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle; 