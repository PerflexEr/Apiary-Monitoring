// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0', // Позволяет подключения с других хостов
    hmr: {
      port: 3001, // Используем отдельный порт для HMR
    },
    proxy: {
      // Auth service endpoints - используем 127.0.0.1 вместо localhost
      '^/(token|users|change-password|health)': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Auth service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🟢 Proxying to Auth Service:', req.method, req.url, '-> http://127.0.0.1:8000' + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🔵 Response from Auth Service:', proxyRes.statusCode, req.url);
          });
        }
      },

      // Hive service endpoints  
      '/hives': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Hive service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🟢 Proxying to Hive Service:', req.method, req.url, '-> http://127.0.0.1:8001' + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🔵 Response from Hive Service:', proxyRes.statusCode, req.url);
          });
        }
      },

      '/inspections': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },

      // Monitoring service endpoints
      '/monitoring': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/monitoring/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Monitoring service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace('/monitoring', '') || '';
            console.log('🟢 Proxying to Monitoring Service:', req.method, req.url, '-> http://127.0.0.1:8002' + newPath);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🔵 Response from Monitoring Service:', proxyRes.statusCode, req.url);
          });
        }
      },

      // Notification service endpoints
      '/notifications': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/notifications/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Notification service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace('/notifications', '') || '';
            console.log('🟢 Proxying to Notification Service:', req.method, req.url, '-> http://127.0.0.1:8003' + newPath);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🔵 Response from Notification Service:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})