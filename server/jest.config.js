module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.{test,spec}.js',
    '**/__tests__/**/*.{test,spec}.js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/__tests__/**',
    '!jest.config.js',
    '!coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  setupFiles: ['<rootDir>/tests/env-setup.js']
} 