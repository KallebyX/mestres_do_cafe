import React from 'react';
import './CheckoutProgress.css';

const CheckoutProgress = ({ steps, currentStep }) => {
  return (
    <div className="checkout-progress">
      <div className="progress-bar">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isNext = step.id === currentStep + 1;
          
          return (
            <div 
              key={step.id} 
              className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isNext ? 'next' : ''}`}
            >
              <div className="step-indicator">
                <div className="step-number">
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
              </div>
              <div className="step-label">{step.name}</div>
              {index < steps.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'completed' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgress;