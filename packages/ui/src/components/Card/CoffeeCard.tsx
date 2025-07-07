import React from 'react';
import { cn } from '../../utils';

interface CoffeeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'product' | 'elevated' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

const CoffeeCard = React.forwardRef<HTMLDivElement, CoffeeCardProps>(
  ({ className, variant = 'default', size = 'md', interactive = false, ...props }, ref) => {
    const baseClasses = [
      'rounded-lg border coffee-shadow-md coffee-transition-normal',
      'coffee-bg-neutral-100 coffee-border-neutral-200',
      'overflow-hidden'
    ];

    const variantClasses = {
      default: [
        'coffee-bg-neutral-100 coffee-border-neutral-200',
        'hover:coffee-shadow-lg coffee-hover-lift'
      ],
      premium: [
        'coffee-bg-neutral-100 coffee-border-primary-light',
        'hover:coffee-shadow-premium coffee-hover-lift',
        'relative',
        'before:absolute before:inset-0 before:bg-gradient-to-br',
        'before:from-coffee-primary-light/5 before:to-coffee-secondary-light/5',
        'before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100'
      ],
      product: [
        'coffee-bg-neutral-100 coffee-border-neutral-200',
        'hover:coffee-shadow-lg coffee-hover-lift',
        'group cursor-pointer',
        'hover:coffee-border-primary-light/50'
      ],
      elevated: [
        'coffee-bg-neutral-100 coffee-shadow-lg',
        'border-0',
        'hover:coffee-shadow-xl coffee-hover-lift'
      ],
      outline: [
        'bg-transparent coffee-border-primary-light',
        'hover:coffee-bg-primary-light/5 coffee-hover-lift'
      ]
    };

    const sizeClasses = {
      sm: 'coffee-padding-4',
      md: 'coffee-padding-6',
      lg: 'coffee-padding-8',
      xl: 'coffee-padding-10'
    };

    const interactiveClasses = interactive ? 'cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          interactiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);

const CoffeeCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-start justify-between',
      'coffee-space-4 pb-4',
      'border-b coffee-border-neutral-200',
      className
    )}
    {...props}
  />
));

const CoffeeCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'coffee-heading-5 coffee-text-neutral-800 leading-tight',
      className
    )}
    {...props}
  />
));

const CoffeeCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'coffee-body-small coffee-text-neutral-600',
      className
    )}
    {...props}
  />
));

const CoffeeCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('coffee-space-4 pt-4', className)}
    {...props}
  />
));

const CoffeeCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between',
      'coffee-space-4 pt-4',
      'border-t coffee-border-neutral-200',
      className
    )}
    {...props}
  />
));

CoffeeCard.displayName = 'CoffeeCard';
CoffeeCardHeader.displayName = 'CoffeeCardHeader';
CoffeeCardTitle.displayName = 'CoffeeCardTitle';
CoffeeCardDescription.displayName = 'CoffeeCardDescription';
CoffeeCardContent.displayName = 'CoffeeCardContent';
CoffeeCardFooter.displayName = 'CoffeeCardFooter';

export {
  CoffeeCard, CoffeeCardContent, CoffeeCardDescription, CoffeeCardFooter, CoffeeCardHeader,
  CoffeeCardTitle
};
