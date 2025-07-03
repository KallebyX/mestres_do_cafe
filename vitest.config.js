import { _defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.{test,spec}.{js,jsx}', 'src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', 'server/node_modules', 'server/whatsapp-session'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [
        'src/main.jsx',
        'src/assets/**',
        'src/**/*.stories.{js,jsx}',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}'
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },
}) 