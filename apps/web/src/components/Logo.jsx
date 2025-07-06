import React, { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  variant = 'light', // 'light' para fundo claro, 'dark' para fundo escuro
  className = '',
  textColor = 'text-brand-dark'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [workingPath, setWorkingPath] = useState(null);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-8 h-8'
  };

  const textSizeClasses = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-3xl'
  };

  const subtextSizeClasses = {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-base'
  };

  // Diferentes caminhos baseados no variant
  const getLogoPaths = () => {
    if (variant === 'dark') {
      // Para fundos escuros (footer)
      return [
        '/logo-para-fundo-escuro.png',
        '/assets/logo/logo-para-fundo-escuro.png',
        '/logo-mestres-do-cafe.png', // fallback
        '/assets/logo/logo-mestres-do-cafe.png'
      ];
    } else {
      // Para fundos claros (header)
      return [
        '/logo-para-fundo-branco.png',
        '/assets/logo/logo-para-fundo-branco.png',
        '/logo-mestres-do-cafe.png', // fallback
        '/assets/logo/logo-mestres-do-cafe.png'
      ];
    }
  };

  // Função para testar múltiplos caminhos
  useEffect(() => {
    const possiblePaths = getLogoPaths();
    let pathIndex = 0;
    
    const testNextPath = () => {
      if (pathIndex >= possiblePaths.length) {
        setImageLoaded(false);
        setImageError(true);
        return;
      }

      const currentPath = possiblePaths[pathIndex];
      
      const img = new Image();
      img.onload = () => {
        setWorkingPath(currentPath);
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        pathIndex++;
        testNextPath();
      };
      img.src = currentPath;
    };

    testNextPath();
  }, [variant]); // Recarrega quando o variant muda

  // Estilos do container baseados no variant
  const getContainerClasses = () => {
    if (variant === 'dark') {
      return `${sizeClasses[size]} rounded-lg flex items-center justify-center bg-white/10 border border-white/20 shadow-sm backdrop-blur-sm`;
    } else {
      return `${sizeClasses[size]} rounded-lg flex items-center justify-center bg-white border border-gray-200 shadow-sm`;
    }
  };

  // Cor do ícone de fallback baseada no variant
  const getIconColor = () => {
    return variant === 'dark' ? 'text-white' : 'text-brand-brown';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Container da Logo/Ícone */}
      <div className={getContainerClasses()}>
        {imageLoaded && !imageError && workingPath ? (
          /* Logo personalizada */
          <img 
            src={workingPath}
            alt="Mestres do Café"
            className="w-full h-full object-contain rounded-lg p-1"
          />
        ) : (
          /* Ícone de fallback */
          <Coffee 
            className={`${iconSizeClasses[size]} ${getIconColor()}`}
          />
        )}
      </div>
      
      {/* Texto da Logo */}
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold font-serif ${textColor}`}>
            Mestres do Café
          </h1>
          <p className={`${subtextSizeClasses[size]} ${variant === 'dark' ? 'text-white/80' : 'text-brand-brown'} font-medium`}>
            Torrefação Artesanal
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo; 