/**
 * Componente Button - Sistema de Design Mestres do Café
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

// ============================================================================
// VARIANTES DO BOTÃO
// ============================================================================

const buttonVariants = cva(
  // Classes base
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95',
  ],
  {
    variants: {
      variant: {
        // Variante primária - cor principal da marca
        primary: [
          'bg-amber-600 text-white shadow-md',
          'hover:bg-amber-700 hover:shadow-lg',
          'focus-visible:ring-amber-500',
          'dark:bg-amber-500 dark:hover:bg-amber-600',
        ],
        // Variante secundária - cor secundária
        secondary: [
          'bg-amber-100 text-amber-900 shadow-sm',
          'hover:bg-amber-200 hover:shadow-md',
          'focus-visible:ring-amber-500',
          'dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800',
        ],
        // Variante destrutiva - para ações perigosas
        destructive: [
          'bg-red-600 text-white shadow-md',
          'hover:bg-red-700 hover:shadow-lg',
          'focus-visible:ring-red-500',
          'dark:bg-red-500 dark:hover:bg-red-600',
        ],
        // Variante outline - apenas borda
        outline: [
          'border border-amber-200 bg-transparent text-amber-900 shadow-sm',
          'hover:bg-amber-50 hover:border-amber-300',
          'focus-visible:ring-amber-500',
          'dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900',
        ],
        // Variante ghost - sem fundo
        ghost: [
          'text-amber-900 shadow-none',
          'hover:bg-amber-100',
          'focus-visible:ring-amber-500',
          'dark:text-amber-100 dark:hover:bg-amber-900',
        ],
        // Variante link - aparência de link
        link: [
          'text-amber-600 underline-offset-4 shadow-none',
          'hover:underline hover:text-amber-700',
          'focus-visible:ring-amber-500',
          'dark:text-amber-400 dark:hover:text-amber-300',
        ],
        // Variante success - para ações de sucesso
        success: [
          'bg-green-600 text-white shadow-md',
          'hover:bg-green-700 hover:shadow-lg',
          'focus-visible:ring-green-500',
          'dark:bg-green-500 dark:hover:bg-green-600',
        ],
        // Variante warning - para avisos
        warning: [
          'bg-yellow-500 text-white shadow-md',
          'hover:bg-yellow-600 hover:shadow-lg',
          'focus-visible:ring-yellow-500',
          'dark:bg-yellow-600 dark:hover:bg-yellow-700',
        ],
        // Variante info - para informações
        info: [
          'bg-blue-600 text-white shadow-md',
          'hover:bg-blue-700 hover:shadow-lg',
          'focus-visible:ring-blue-500',
          'dark:bg-blue-500 dark:hover:bg-blue-600',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: 'md',
    },
  }
);

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Conteúdo do botão */
  children: React.ReactNode;
  /** Se o botão está em estado de carregamento */
  loading?: boolean;
  /** Ícone à esquerda do texto */
  leftIcon?: React.ReactNode;
  /** Ícone à direita do texto */
  rightIcon?: React.ReactNode;
  /** Tooltip do botão */
  tooltip?: string;
  /** Se deve mostrar apenas o ícone (para botões icon) */
  iconOnly?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Referência para o elemento */
  ref?: React.Ref<HTMLButtonElement>;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      rounded = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      className,
      tooltip,
      ...props
    },
    ref
  ) => {
    // Determina se o botão está desabilitado
    const isDisabled = disabled || loading;

    // Renderiza o conteúdo do botão
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {!iconOnly && (typeof children === 'string' ? 'Carregando...' : children)}
          </>
        );
      }

      if (iconOnly) {
        return children;
      }

      return (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      );
    };

    const buttonElement = (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size, fullWidth, rounded }),
          className
        )}
        {...props}
      >
        {renderContent()}
      </button>
    );

    // Se há tooltip, envolve com elemento de tooltip
    if (tooltip) {
      return (
        <div className="relative group">
          {buttonElement}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      );
    }

    return buttonElement;
  }
);

Button.displayName = 'Button';

// ============================================================================
// COMPONENTES ESPECIALIZADOS
// ============================================================================

/**
 * Botão de ação primária
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

PrimaryButton.displayName = 'PrimaryButton';

/**
 * Botão de ação secundária
 */
export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);

SecondaryButton.displayName = 'SecondaryButton';

/**
 * Botão destrutivo
 */
export const DestructiveButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="destructive" {...props} />
);

DestructiveButton.displayName = 'DestructiveButton';

/**
 * Botão outline
 */
export const OutlineButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);

OutlineButton.displayName = 'OutlineButton';

/**
 * Botão ghost
 */
export const GhostButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);

GhostButton.displayName = 'GhostButton';

/**
 * Botão de link
 */
export const LinkButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="link" {...props} />
);

LinkButton.displayName = 'LinkButton';

/**
 * Botão de sucesso
 */
export const SuccessButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="success" {...props} />
);

SuccessButton.displayName = 'SuccessButton';

/**
 * Botão de aviso
 */
export const WarningButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="warning" {...props} />
);

WarningButton.displayName = 'WarningButton';

/**
 * Botão de informação
 */
export const InfoButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="info" {...props} />
);

InfoButton.displayName = 'InfoButton';

/**
 * Botão de ícone
 */
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'iconOnly'>>(
  (props, ref) => <Button ref={ref} size="icon" iconOnly {...props} />
);

IconButton.displayName = 'IconButton';

// ============================================================================
// EXPORTS
// ============================================================================

export default Button;
export { buttonVariants };
export type { ButtonProps };

