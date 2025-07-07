import React from 'react';
import { cn } from '../../utils';

interface CoffeeLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'pulse' | 'dots' | 'coffee';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'neutral';
  text?: string;
}

const CoffeeLoading = React.forwardRef<HTMLDivElement, CoffeeLoadingProps>(
  ({ className, variant = 'spinner', size = 'md', color = 'primary', text, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12'
    };

    const colorClasses = {
      primary: 'coffee-text-primary-light',
      secondary: 'coffee-text-secondary-light',
      neutral: 'coffee-text-neutral-500'
    };

    const renderSpinner = () => (
      <div
        className={cn(
          'border-2 border-current border-t-transparent coffee-radius-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    );

    const renderPulse = () => (
      <div
        className={cn(
          'coffee-bg-current coffee-radius-full animate-pulse',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    );

    const renderDots = () => (
      <div className={cn('flex space-x-1', colorClasses[color])}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'coffee-bg-current coffee-radius-full animate-pulse',
              size === 'sm' && 'h-1.5 w-1.5',
              size === 'md' && 'h-2 w-2',
              size === 'lg' && 'h-3 w-3',
              size === 'xl' && 'h-4 w-4'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );

    const renderCoffee = () => (
      <div className={cn('coffee-animate-float', sizeClasses[size], colorClasses[color])}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M2 21h20v-2H2v2zm1.5-3h1.1l.9-8H4.4l.9 8H3.5zm1.9-9h1.1l.9-8H5.5l.9 8zm0 0h1.1l.9-8H5.5l.9 8zm3.7-9h1.1l.9-8H9.1l.9 8zm0 0h1.1l.9-8H9.1l.9 8zm3.7-9h1.1l.9-8h-1.1l.9 8zm0 0h1.1l.9-8h-1.1l.9 8zM19 8h-1.5l-.9 8H18l1-8zm0 0h-1.5l-.9 8H18l1-8z"/>
        </svg>
      </div>
    );

    const renderLoading = () => {
      switch (variant) {
        case 'pulse':
          return renderPulse();
        case 'dots':
          return renderDots();
        case 'coffee':
          return renderCoffee();
        default:
          return renderSpinner();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-2',
          'coffee-transition-normal',
          className
        )}
        {...props}
      >
        {renderLoading()}
        {text && (
          <p className="coffee-body-small coffee-text-neutral-600 text-center">
            {text}
          </p>
        )}
      </div>
    );
  }
);

interface CoffeeSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'avatar' | 'image' | 'button' | 'card';
  lines?: number;
}

const CoffeeSkeleton = React.forwardRef<HTMLDivElement, CoffeeSkeletonProps>(
  ({ className, variant = 'text', lines = 1, ...props }, ref) => {
    const variantClasses = {
      text: 'h-4 w-full',
      title: 'h-6 w-3/4',
      avatar: 'h-12 w-12 coffee-radius-full',
      image: 'h-48 w-full',
      button: 'h-10 w-24',
      card: 'h-32 w-full'
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse coffee-bg-neutral-200 coffee-radius-md',
                variantClasses.text,
                i === lines - 1 && 'w-2/3' // Última linha mais curta
              )}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse coffee-bg-neutral-200 coffee-radius-md',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

interface CoffeeSkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  showImage?: boolean;
  textLines?: number;
}

const CoffeeSkeletonCard = React.forwardRef<HTMLDivElement, CoffeeSkeletonCardProps>(
  ({ className, showAvatar = false, showImage = false, textLines = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'coffee-padding-6 coffee-bg-neutral-100 coffee-radius-lg coffee-shadow-sm',
          'space-y-4',
          className
        )}
        {...props}
      >
        {showImage && (
          <CoffeeSkeleton variant="image" />
        )}
        
        <div className="flex items-start space-x-3">
          {showAvatar && (
            <CoffeeSkeleton variant="avatar" />
          )}
          <div className="flex-1 space-y-2">
            <CoffeeSkeleton variant="title" />
            <CoffeeSkeleton variant="text" lines={textLines} />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <CoffeeSkeleton variant="button" />
          <CoffeeSkeleton variant="text" className="w-20" />
        </div>
      </div>
    );
  }
);

interface CoffeeLoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  backdrop?: boolean;
  text?: string;
}

const CoffeeLoadingOverlay = React.forwardRef<HTMLDivElement, CoffeeLoadingOverlayProps>(
  ({ className, isLoading = true, backdrop = true, text, children, ...props }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center z-50',
            backdrop && 'coffee-bg-neutral-100/80 backdrop-blur-sm'
          )}
        >
          <CoffeeLoading variant="coffee" size="lg" text={text} />
        </div>
      </div>
    );
  }
);

CoffeeLoading.displayName = 'CoffeeLoading';
CoffeeSkeleton.displayName = 'CoffeeSkeleton';
CoffeeSkeletonCard.displayName = 'CoffeeSkeletonCard';
CoffeeLoadingOverlay.displayName = 'CoffeeLoadingOverlay';

export {
  CoffeeLoading,
  CoffeeSkeletonCard,
  CoffeeSkeleton,
  CoffeeLoadingOverlay
};