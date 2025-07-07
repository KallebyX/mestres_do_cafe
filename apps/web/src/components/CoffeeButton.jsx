import React from 'react';
import { cn } from '../lib/utils';

const buttonVariants = {
  variant: {
    primary: 'coffee-btn-primary',
    secondary: 'coffee-btn-secondary', 
    outline: 'coffee-btn-outline',
    ghost: 'coffee-btn-ghost',
    premium: 'coffee-btn-premium',
    destructive: 'coffee-btn-destructive'
  },
  size: {
    sm: 'coffee-btn-sm',
    md: 'coffee-btn-md',
    lg: 'coffee-btn-lg'
  }
};

export const CoffeeButton = React.forwardRef(({ 
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'coffee-btn',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

CoffeeButton.displayName = 'CoffeeButton';