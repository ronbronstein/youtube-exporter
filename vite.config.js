import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/youtube-exporter/' : '/',
  root: 'src',
  build: {
    outDir: '../dist',
    sourcemap: false,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  server: {
    port: 5177,
    host: true,
    open: false,
    cors: true
  },
  preview: {
    port: 4173,
    host: true
  },
  css: {
    devSourcemap: false
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  plugins: []
}) 