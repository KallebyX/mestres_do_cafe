// Simple Frontend Tests for CI/CD
// These are minimal tests to ensure the build system works

import { describe, it, expect } from 'vitest';

describe('Frontend Build System', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });
  
  it('should have proper API configuration', () => {
    // Test that we can import the API config
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    expect(typeof apiUrl).toBe('string');
    expect(apiUrl).toMatch(/^https?:\/\//);
  });
});

describe('Environment Configuration', () => {
  it('should detect environment correctly', () => {
    const env = import.meta.env.MODE;
    expect(env).toBeDefined();
    expect(['development', 'production', 'test'].includes(env)).toBe(true);
  });
});