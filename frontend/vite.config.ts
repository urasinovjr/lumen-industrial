import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/products': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/categories': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/cart': { target: 'http://localhost:3002', changeOrigin: true },
      '/api/orders': { target: 'http://localhost:3002', changeOrigin: true },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
})
