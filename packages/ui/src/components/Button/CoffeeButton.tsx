import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const buttonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'font-medium text-sm leading-none',
    'transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-lg',
    'coffee-transition-normal',
    'coffee-focus-visible'
  ],
  {
    variants: {
      variant: {
        primary: [
          'coffee-bg-primary-light coffee-text-neutral-100',
          'hover:coffee-bg-primary-medium hover:shadow-lg',
          'active:coffee-bg-primary-dark active:scale-95',
          'focus:ring-coffee-primary-light/50',
          'coffee-shadow-md',
          'coffee-hover-lift'
        ],
        secondary: [
          'coffee-bg-secondary-light coffee-text-neutral-100',
          'hover:coffee-bg-secondary-medium hover:shadow-lg',
          'active:coffee-bg-secondary-accent active:scale-95',
          'focus:ring-coffee-secondary-light/50',
          'coffee-shadow-md',
          'coffee-hover-lift'
        ],
        outline: [
          'border-2 coffee-border-primary-light coffee-text-primary-light',
          'bg-transparent',
          'hover:coffee-bg-primary-light hover:coffee-text-neutral-100',
          'active:coffee-bg-primary-medium active:scale-95',
          'focus:ring-coffee-primary-light/50',
          'coffee-shadow-sm',
          'coffee-hover-lift'
        ],
        ghost: [
          'bg-transparent coffee-text-primary-light',
          'hover:coffee-bg-primary-light/10',
          'active:coffee-bg-primary-light/20 active:scale-95',
          'focus:ring-coffee-primary-light/50',
          'coffee-hover-glow'
        ],
        premium: [
          'coffee-gradient-coffee coffee-text-neutral-100',
          'hover:shadow-xl hover:shadow-coffee-primary-light/25',
          'active:scale-95',
          'focus:ring-coffee-primary-light/50',
          'coffee-shadow-premium',
          'coffee-hover-lift',
          'relative overflow-hidden',
          'before:absolute before:inset-0 before:bg-gradient-to-r',
          'before:from-transparent before:via-white/20 before:to-transparent',
          'before:translate-x-[-100%] before:transition-transform before:duration-700',
          'hover:before:translate-x-[100%]'
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700 hover:shadow-lg',
          'active:bg-red-800 active:scale-95',
          'focus:ring-red-500/50',
          'coffee-shadow-md',
          'coffee-hover-lift'
        ]
      },
      size: {
        sm: [
          'h-8 px-3 text-xs',
          'coffee-radius-sm'
        ],
        md: [
          'h-10 px-4 text-sm',
          'coffee-radius-md'
        ],
        lg: [
          'h-12 px-6 text-base',
          'coffee-radius-lg'
        ],
        xl: [
          'h-14 px-8 text-lg',
          'coffee-radius-xl'
        ],
        icon: [
          'h-10 w-10 p-0',
          'coffee-radius-md'
        ]
      },
      loading: {
        true: 'coffee-state-loading cursor-wait',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      loading: false
    }
  }
);

export interface CoffeeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CoffeeButton = React.forwardRef<HTMLButtonElement, CoffeeButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="coffee-animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        {children && (
          <span className={cn(
            'flex-1 text-center',
            loading && 'opacity-70'
          )}>
            {children}
          </span>
        )}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

CoffeeButton.displayName = 'CoffeeButton';

export { CoffeeButton, buttonVariants };