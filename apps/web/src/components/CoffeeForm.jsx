import React from 'react';
import { cn } from '../lib/utils';

const CoffeeInput = React.forwardRef(({ 
  label,
  helperText,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="coffee-form-field">
      {label && (
        <label className="coffee-form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'coffee-input',
          error && 'coffee-input-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="coffee-form-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="coffee-form-helper">{helperText}</p>
      )}
    </div>
  );
});

const CoffeeTextarea = React.forwardRef(({ 
  label,
  helperText,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="coffee-form-field">
      {label && (
        <label className="coffee-form-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'coffee-textarea',
          error && 'coffee-textarea-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="coffee-form-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="coffee-form-helper">{helperText}</p>
      )}
    </div>
  );
});

const CoffeeSelect = React.forwardRef(({ 
  label,
  helperText,
  error,
  children,
  className,
  ...props
}, ref) => {
  return (
    <div className="coffee-form-field">
      {label && (
        <label className="coffee-form-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'coffee-select',
          error && 'coffee-select-error',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="coffee-form-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="coffee-form-helper">{helperText}</p>
      )}
    </div>
  );
});

CoffeeInput.displayName = 'CoffeeInput';
CoffeeTextarea.displayName = 'CoffeeTextarea';
CoffeeSelect.displayName = 'CoffeeSelect';

export const CoffeeForm = {
  Input: CoffeeInput,
  Textarea: CoffeeTextarea,
  Select: CoffeeSelect
};