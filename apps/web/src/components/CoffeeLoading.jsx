import React from 'react';
import { cn } from '../lib/utils';

const loadingVariants = {
  variant: {
    spinner: 'coffee-loading-spinner',
    pulse: 'coffee-loading-pulse',
    dots: 'coffee-loading-dots',
    coffee: 'coffee-loading-coffee'
  },
  size: {
    sm: 'coffee-loading-sm',
    md: 'coffee-loading-md',
    lg: 'coffee-loading-lg'
  }
};

export const CoffeeLoading = ({ 
  variant = 'spinner',
  size = 'md',
  className,
  ...props
}) => {
  const baseClass = `coffee-loading ${loadingVariants.variant[variant]} ${loadingVariants.size[size]}`;
  
  switch (variant) {
    case 'spinner':
      return (
        <div className={cn(baseClass, className)} {...props}>
          <div className="coffee-spinner"></div>
        </div>
      );
      
    case 'pulse':
      return (
        <div className={cn(baseClass, className)} {...props}>
          <div className="coffee-pulse"></div>
        </div>
      );
      
    case 'dots':
      return (
        <div className={cn(baseClass, className)} {...props}>
          <div className="coffee-dots">
            <div className="coffee-dot"></div>
            <div className="coffee-dot"></div>
            <div className="coffee-dot"></div>
          </div>
        </div>
      );
      
    case 'coffee':
      return (
        <div className={cn(baseClass, className)} {...props}>
          <div className="coffee-bean">
            ☕
          </div>
        </div>
      );
      
    default:
      return (
        <div className={cn(baseClass, className)} {...props}>
          <div className="coffee-spinner"></div>
        </div>
      );
  }
};

export const CoffeeSkeleton = ({ className, ...props }) => (
  <div className={cn('coffee-skeleton', className)} {...props} />
);

export const CoffeeSkeletonCard = ({ className, ...props }) => (
  <div className={cn('coffee-skeleton-card', className)} {...props}>
    <div className="coffee-skeleton h-48 w-full mb-4"></div>
    <div className="coffee-skeleton h-4 w-3/4 mb-2"></div>
    <div className="coffee-skeleton h-4 w-1/2 mb-4"></div>
    <div className="coffee-skeleton h-8 w-full"></div>
  </div>
);

CoffeeLoading.displayName = 'CoffeeLoading';
CoffeeSkeleton.displayName = 'CoffeeSkeleton';
CoffeeSkeletonCard.displayName = 'CoffeeSkeletonCard';