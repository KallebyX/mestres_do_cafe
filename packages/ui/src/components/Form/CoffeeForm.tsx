import React from 'react';
import { cn } from '../../utils';

interface CoffeeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  variant?: 'default' | 'premium' | 'filled';
  state?: 'default' | 'error' | 'success';
}

const CoffeeInput = React.forwardRef<HTMLInputElement, CoffeeInputProps>(
  ({
    className,
    containerClassName,
    variant = 'default',
    state = 'default',
    label,
    helpText,
    error,
    success,
    leftIcon,
    rightIcon,
    required,
    disabled,
    id,
    ...props
  }, ref) => {
    const inputId = id || `coffee-input-${Math.random().toString(36).substr(2, 9)}`;
    const currentState = error ? 'error' : success ? 'success' : state;
    const currentHelpText = error || success || helpText;

    const baseInputClasses = [
      'flex w-full coffee-transition-normal',
      'coffee-text-neutral-800 coffee-body',
      'placeholder:coffee-text-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'border'
    ];

    const variantClasses = {
      default: [
        'coffee-bg-neutral-100 coffee-border-neutral-300',
        'focus:coffee-border-primary-light focus:ring-coffee-primary-light/20',
        'hover:coffee-border-neutral-400'
      ],
      premium: [
        'coffee-bg-neutral-100 coffee-border-primary-light/30',
        'focus:coffee-border-primary-light focus:ring-coffee-primary-light/30',
        'hover:coffee-border-primary-light/50',
        'coffee-shadow-sm'
      ],
      filled: [
        'coffee-bg-neutral-200 border-transparent',
        'focus:coffee-bg-neutral-100 focus:coffee-border-primary-light',
        'focus:ring-coffee-primary-light/20',
        'hover:coffee-bg-neutral-100'
      ]
    };

    const stateClasses = {
      default: '',
      error: [
        'border-red-500 focus:border-red-500',
        'focus:ring-red-500/20'
      ],
      success: [
        'border-green-500 focus:border-green-500',
        'focus:ring-green-500/20'
      ]
    };

    const sizeClasses = 'h-10 px-4 text-sm coffee-radius-md';

    const labelClasses = [
      'coffee-caption coffee-text-neutral-700 coffee-font-medium',
      'mb-2 block',
      required && 'after:content-["*"] after:ml-1 after:text-red-500',
      disabled && 'coffee-text-neutral-400 cursor-not-allowed'
    ];

    const helpTextClasses = [
      'coffee-body-small mt-2',
      currentState === 'error' && 'text-red-500',
      currentState === 'success' && 'text-green-500',
      currentState === 'default' && 'coffee-text-neutral-500'
    ];

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelClasses)}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 coffee-text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={cn(
              baseInputClasses,
              variantClasses[variant],
              stateClasses[currentState],
              sizeClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 coffee-text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {currentHelpText && (
          <p className={cn(helpTextClasses)}>
            {currentHelpText}
          </p>
        )}
      </div>
    );
  }
);

interface CoffeeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  error?: string;
  success?: string;
  containerClassName?: string;
  variant?: 'default' | 'premium' | 'filled';
  state?: 'default' | 'error' | 'success';
}

const CoffeeTextarea = React.forwardRef<HTMLTextAreaElement, CoffeeTextareaProps>(
  ({
    className,
    containerClassName,
    variant = 'default',
    state = 'default',
    label,
    helpText,
    error,
    success,
    required,
    disabled,
    id,
    ...props
  }, ref) => {
    const textareaId = id || `coffee-textarea-${Math.random().toString(36).substr(2, 9)}`;
    const currentState = error ? 'error' : success ? 'success' : state;
    const currentHelpText = error || success || helpText;

    const baseClasses = [
      'flex w-full coffee-transition-normal',
      'coffee-text-neutral-800 coffee-body',
      'placeholder:coffee-text-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'border coffee-radius-md',
      'min-h-[100px] py-3 px-4 resize-y'
    ];

    const variantClasses = {
      default: [
        'coffee-bg-neutral-100 coffee-border-neutral-300',
        'focus:coffee-border-primary-light focus:ring-coffee-primary-light/20',
        'hover:coffee-border-neutral-400'
      ],
      premium: [
        'coffee-bg-neutral-100 coffee-border-primary-light/30',
        'focus:coffee-border-primary-light focus:ring-coffee-primary-light/30',
        'hover:coffee-border-primary-light/50',
        'coffee-shadow-sm'
      ],
      filled: [
        'coffee-bg-neutral-200 border-transparent',
        'focus:coffee-bg-neutral-100 focus:coffee-border-primary-light',
        'focus:ring-coffee-primary-light/20',
        'hover:coffee-bg-neutral-100'
      ]
    };

    const stateClasses = {
      default: '',
      error: [
        'border-red-500 focus:border-red-500',
        'focus:ring-red-500/20'
      ],
      success: [
        'border-green-500 focus:border-green-500',
        'focus:ring-green-500/20'
      ]
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'coffee-caption coffee-text-neutral-700 coffee-font-medium',
              'mb-2 block',
              required && 'after:content-["*"] after:ml-1 after:text-red-500',
              disabled && 'coffee-text-neutral-400 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          required={required}
          className={cn(
            baseClasses,
            variantClasses[variant],
            stateClasses[currentState],
            className
          )}
          {...props}
        />
        {currentHelpText && (
          <p className={cn(
            'coffee-body-small mt-2',
            currentState === 'error' && 'text-red-500',
            currentState === 'success' && 'text-green-500',
            currentState === 'default' && 'coffee-text-neutral-500'
          )}>
            {currentHelpText}
          </p>
        )}
      </div>
    );
  }
);

interface CoffeeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helpText?: string;
  error?: string;
  success?: string;
  placeholder?: string;
  containerClassName?: string;
  variant?: 'default' | 'premium' | 'filled';
  state?: 'default' | 'error' | 'success';
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

const CoffeeSelect = React.forwardRef<HTMLSelectElement, CoffeeSelectProps>(
  ({
    className,
    containerClassName,
    variant = 'default',
    state = 'default',
    label,
    helpText,
    error,
    success,
    placeholder,
    options = [],
    required,
    disabled,
    id,
    children,
    ...props
  }, ref) => {
    const selectId = id || `coffee-select-${Math.random().toString(36).substr(2, 9)}`;
    const currentState = error ? 'error' : success ? 'success' : state;
    const currentHelpText = error || success || helpText;

    const baseClasses = [
      'flex w-full coffee-transition-normal',
      'coffee-text-neutral-800 coffee-body',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'border coffee-radius-md',
      'h-10 px-4 pr-10 cursor-pointer',
      'appearance-none'
    ];

    const variantClasses = {
      default: [
        'coffee-bg-neutral-100 coffee-border-neutral-300',
        'focus:coffee-border-primary-light focus:ring-coffee-primary-light/20',
        'hover:coffee-border-neutral-400'
      ],
      premium: [
        'coffee-bg-neutral-100 coffee-border-primary-light/30',
        'focus:coffee-border-primary-light focus:ring-coffee-primary-light/30',
        'hover:coffee-border-primary-light/50',
        'coffee-shadow-sm'
      ],
      filled: [
        'coffee-bg-neutral-200 border-transparent',
        'focus:coffee-bg-neutral-100 focus:coffee-border-primary-light',
        'focus:ring-coffee-primary-light/20',
        'hover:coffee-bg-neutral-100'
      ]
    };

    const stateClasses = {
      default: '',
      error: [
        'border-red-500 focus:border-red-500',
        'focus:ring-red-500/20'
      ],
      success: [
        'border-green-500 focus:border-green-500',
        'focus:ring-green-500/20'
      ]
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'coffee-caption coffee-text-neutral-700 coffee-font-medium',
              'mb-2 block',
              required && 'after:content-["*"] after:ml-1 after:text-red-500',
              disabled && 'coffee-text-neutral-400 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={cn(
              baseClasses,
              variantClasses[variant],
              stateClasses[currentState],
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 coffee-text-neutral-400 pointer-events-none">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {currentHelpText && (
          <p className={cn(
            'coffee-body-small mt-2',
            currentState === 'error' && 'text-red-500',
            currentState === 'success' && 'text-green-500',
            currentState === 'default' && 'coffee-text-neutral-500'
          )}>
            {currentHelpText}
          </p>
        )}
      </div>
    );
  }
);

CoffeeInput.displayName = 'CoffeeInput';
CoffeeTextarea.displayName = 'CoffeeTextarea';
CoffeeSelect.displayName = 'CoffeeSelect';

export { CoffeeInput, CoffeeSelect, CoffeeTextarea };
