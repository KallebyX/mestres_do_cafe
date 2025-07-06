import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Carrega variáveis de ambiente baseadas no modo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
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
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    },
    
    // Configuração do servidor de desenvolvimento
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
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
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
      
      // Configurações do Rollup
      rollupOptions: {
        output: {
          // Chunks manuais para melhor cache
          manualChunks: {
            // Bibliotecas principais
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            
            // Bibliotecas UI
            ui: [
              '@radix-ui/react-slot',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              'lucide-react'
            ],
            
            // Bibliotecas de formulário
            forms: [
              'react-hook-form',
              '@hookform/resolvers',
              'zod'
            ],
            
            // Bibliotecas de utilidade
            utils: [
              'axios',
              'clsx',
              'class-variance-authority',
              'tailwind-merge',
              'date-fns'
            ],
            
            // Bibliotecas de gráficos e PDF
            charts: ['recharts', 'jspdf', 'jspdf-autotable'],
            
            // Query e estado
            query: ['@tanstack/react-query']
          },
          
          // Nomenclatura dos arquivos
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      },
      
      // Configurações de otimização
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      
      // Configurações de assets
      assetsInlineLimit: 4096, // 4kb
      cssCodeSplit: true,
      
      // Configurações de report
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
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
        'class-variance-authority',
        'tailwind-merge',
        'lucide-react',
        'date-fns',
        'recharts'
      ],
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
    },
    
    // Configuração de definições globais
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Configuração de base pública
    base: mode === 'production' ? '/' : '/',
    
    // Configuração de assets públicos
    publicDir: 'public',
    
    // Configuração de logs
    logLevel: mode === 'production' ? 'info' : 'info',
    
    // Configuração de workers
    worker: {
      format: 'es',
    },
  };
});
