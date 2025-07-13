/**
 * Utilitário para debouncing de funções
 * Evita que uma função seja executada muitas vezes em sequência
 */

export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Hook personalizado para debouncing em React
 */
import { useCallback, useRef } from 'react';

export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Hook para debouncing de valores
 */
import { useEffect, useState } from 'react';

export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Throttle - limita a frequência de execução de uma função
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Hook para throttling em React
 */
export const useThrottledCallback = (callback, limit = 100) => {
  const throttledRef = useRef(false);
  
  return useCallback((...args) => {
    if (!throttledRef.current) {
      callback(...args);
      throttledRef.current = true;
      
      setTimeout(() => {
        throttledRef.current = false;
      }, limit);
    }
  }, [callback, limit]);
};

/**
 * Hook para throttling de valores
 */
export const useThrottledValue = (value, limit = 100) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdateRef = useRef(0);
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    if (timeSinceLastUpdate >= limit) {
      setThrottledValue(value);
      lastUpdateRef.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdateRef.current = Date.now();
      }, limit - timeSinceLastUpdate);
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, limit]);
  
  return throttledValue;
};