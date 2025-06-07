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
    proxy: {
      // Auth service endpoints
      '/token': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/health': 'http://localhost:8000',

      // Hive service endpoints  
      '/hives': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Hive service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🟢 Proxying to Hive Service:', req.method, req.url, '-> http://localhost:8001' + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🔵 Response from Hive Service:', proxyRes.statusCode, req.url);
          });
        }
      },

      // Monitoring service endpoints
      '/monitoring': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/monitoring/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Monitoring service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace('/monitoring', '') || '';
            console.log('🟢 Proxying to Monitoring Service:', req.method, req.url, '-> http://localhost:8002' + newPath);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🔵 Response from Monitoring Service:', proxyRes.statusCode, req.url);
          });
        }
      },

      // Notification service endpoints
      '/notifications': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/notifications/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Notification service proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const newPath = req.url?.replace('/notifications', '') || '';
            console.log('🟢 Proxying to Notification Service:', req.method, req.url, '-> http://localhost:8003' + newPath);
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