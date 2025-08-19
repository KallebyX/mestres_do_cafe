import React from 'react';
import { Check } from 'lucide-react';
import './CheckoutProgress.css';

const CheckoutProgress = ({ steps, currentStep, isMobile = false }) => {
  return (
    <div className="checkout-progress">
      <div className="progress-container">
        <div className="progress-bar">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isNext = step.id === currentStep + 1;
            const Icon = step.icon;
            
            return (
              <div 
                key={step.id} 
                className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isNext ? 'next' : ''}`}
              >
                <div className="step-indicator">
                  <div className="step-icon">
                    {isCompleted ? (
                      <Check size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <div className="step-number">{step.id}</div>
                </div>
                
                <div className="step-content">
                  <div className="step-label">{step.name}</div>
                  {!isMobile && (
                    <div className="step-description">{step.description}</div>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`}>
                    <div className="connector-line"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Indicador de progresso móvel */}
        {isMobile && (
          <div className="mobile-progress">
            <div className="mobile-progress-bar">
              <div 
                className="mobile-progress-fill"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="mobile-progress-text">
              Passo {currentStep} de {steps.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutProgress;