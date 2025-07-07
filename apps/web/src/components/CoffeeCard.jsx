import React from 'react';
import { cn } from '../lib/utils';

const cardVariants = {
  variant: {
    default: 'coffee-card-default',
    premium: 'coffee-card-premium',
    product: 'coffee-card-product',
    elevated: 'coffee-card-elevated',
    outline: 'coffee-card-outline'
  }
};

export const CoffeeCard = React.forwardRef(({ 
  variant = 'default',
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'coffee-card',
        cardVariants.variant[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const CoffeeCardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('coffee-card-header', className)} {...props}>
    {children}
  </div>
));

const CoffeeCardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn('coffee-card-title', className)} {...props}>
    {children}
  </h3>
));

const CoffeeCardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn('coffee-card-description', className)} {...props}>
    {children}
  </p>
));

const CoffeeCardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('coffee-card-content', className)} {...props}>
    {children}
  </div>
));

const CoffeeCardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('coffee-card-footer', className)} {...props}>
    {children}
  </div>
));

CoffeeCard.displayName = 'CoffeeCard';
CoffeeCardHeader.displayName = 'CoffeeCardHeader';
CoffeeCardTitle.displayName = 'CoffeeCardTitle';
CoffeeCardDescription.displayName = 'CoffeeCardDescription';
CoffeeCardContent.displayName = 'CoffeeCardContent';
CoffeeCardFooter.displayName = 'CoffeeCardFooter';

CoffeeCard.Header = CoffeeCardHeader;
CoffeeCard.Title = CoffeeCardTitle;
CoffeeCard.Description = CoffeeCardDescription;
CoffeeCard.Content = CoffeeCardContent;
CoffeeCard.Footer = CoffeeCardFooter;