import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['chart.js'],
          'crypto': ['crypto-js']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { 
        drop_console: true // Remove console.logs in production
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
}) 