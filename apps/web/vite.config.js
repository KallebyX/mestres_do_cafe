import react from "@vitejs/plugin-react";
import path from "path";
// import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from "vite";
// import { compression } from 'vite-plugin-compression2';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Carrega variáveis de ambiente baseadas no modo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      
      // Compressão Gzip e Brotli - INSTALAR: npm install --save-dev vite-plugin-compression2
      // compression({
      //   algorithm: 'gzip',
      //   ext: '.gz',
      //   threshold: 10240, // 10KB
      //   deleteOriginFile: false
      // }),
      
      // compression({
      //   algorithm: 'brotliCompress',
      //   ext: '.br',
      //   threshold: 10240,
      //   deleteOriginFile: false
      // }),
      
      // Visualizador de bundle - INSTALAR: npm install --save-dev rollup-plugin-visualizer
      // ...(mode === 'development' ? [
      //   visualizer({
      //     filename: './node_modules/.cache/visualizer/stats.html',
      //     open: true,
      //     gzipSize: true,
      //     brotliSize: true,
      //   })
      // ] : [])
    ],
    
    // Configuração de resolução de aliases
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/pages": path.resolve(__dirname, "./src/pages"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
        "@/contexts": path.resolve(__dirname, "./src/contexts"),
        "@/services": path.resolve(__dirname, "./src/services"),
        "@/utils": path.resolve(__dirname, "./src/utils"),
        "@/lib": path.resolve(__dirname, "./src/lib"),
        "@/assets": path.resolve(__dirname, "./src/assets"),
        
        // Otimizações específicas
        'lodash': 'lodash-es'
        // 'date-fns': path.resolve(__dirname, './src/utils/date-fns-wrapper.js') // Temporariamente desabilitado
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    },
    
    // Configuração do servidor de desenvolvimento
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5001",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    
    // Configuração do preview
    preview: {
      port: 4173,
      host: true,
    },
    
    // Configuração de build para produção
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false, // Desabilitar em produção
      minify: 'terser',
      target: 'es2015',
      
      // Configurações do Rollup
      rollupOptions: {
        output: {
          // Chunks manuais otimizados
          manualChunks: (id) => {
            // Vendor principal - React ecosystem
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            
            // UI Components
            if (id.includes('@radix-ui') || 
                id.includes('lucide-react') ||
                id.includes('@headlessui')) {
              return 'vendor-ui';
            }
            
            // Forms
            if (id.includes('react-hook-form') || 
                id.includes('@hookform') || 
                id.includes('zod')) {
              return 'vendor-forms';
            }
            
            // Charts - separar para lazy load
            if (id.includes('recharts') || 
                id.includes('d3') ||
                id.includes('victory')) {
              return 'vendor-charts';
            }
            
            // PDF - separar para lazy load
            if (id.includes('jspdf') || 
                id.includes('html2canvas') ||
                id.includes('pdfjs')) {
              return 'vendor-pdf';
            }
            
            // Date utilities
            if (id.includes('date-fns') || 
                id.includes('dayjs') ||
                id.includes('moment')) {
              return 'vendor-date';
            }
            
            // Estado e query
            if (id.includes('@tanstack/react-query') ||
                id.includes('redux') ||
                id.includes('zustand')) {
              return 'vendor-state';
            }
            
            // Utils
            if (id.includes('axios') || 
                id.includes('lodash') ||
                id.includes('clsx') ||
                id.includes('tailwind')) {
              return 'vendor-utils';
            }
            
            // Polyfills
            if (id.includes('core-js')) {
              return 'polyfills';
            }
          },
          
          // Nomenclatura dos arquivos
          chunkFileNames: 'assets/js/[name]-[hash:8].js',
          entryFileNames: 'assets/js/[name]-[hash:8].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash:8][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash:8][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash:8][extname]`;
            }
            return `assets/[name]-[hash:8][extname]`;
          }
        },
        
        // Tree shaking agressivo
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
          unknownGlobalSideEffects: false,
        }
      },
      
      // Configurações de otimização
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      
      // Configurações de assets
      assetsInlineLimit: 4096, // 4kb
      cssCodeSplit: true,
      
      // Configurações de report
      reportCompressedSize: false,
      chunkSizeWarningLimit: 500, // Reduzir para 500KB
    },
    
    // Configuração de dependências
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'clsx',
        'tailwind-merge',
      ],
      exclude: [
        // Excluir bibliotecas grandes que serão lazy loaded
        'recharts',
        'jspdf',
        'html2canvas',
        'date-fns',
      ],
      esbuildOptions: {
        target: 'es2015',
      }
    },
    
    // Configuração de CSS
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        css: {
          charset: false,
        },
      },
      // PostCSS usa o arquivo postcss.config.js
    },
    
    // Configuração de definições globais
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      // Definir process.env para o navegador
      'process.env': {},
      global: 'globalThis',
    },
    
    // Configuração de base pública
    base: mode === 'production' ? '/' : '/',
    
    // Configuração de assets públicos
    publicDir: 'public',
    
    // Configuração de logs
    logLevel: 'info',
    
    // Configuração de workers
    worker: {
      format: 'es',
    },
  };
});
