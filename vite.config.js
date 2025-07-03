import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react')) {
            return 'react-vendor';
          }
          if (id.includes('react-router')) {
            return 'router';
          }
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui';
          }
          if (id.includes('recharts') || id.includes('chart')) {
            return 'charts';
          }
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase';
          }
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'dates';
          }
          if (id.includes('clsx') || id.includes('tailwind') || id.includes('class-variance-authority')) {
            return 'utilities';
          }
          if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('pdf')) {
            return 'pdf-canvas';
          }
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'forms';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash][extname]'
      },
    },
    chunkSizeWarningLimit: 500,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  optimizeDeps: {
    exclude: ['bcryptjs'],
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'clsx',
      'tailwind-merge'
    ],
    force: true
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  }
})
