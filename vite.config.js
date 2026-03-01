import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://web-production-4b02.up.railway.app',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks — split heavy libraries for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'vendor-tiptap': [
            '@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-placeholder',
            '@tiptap/extension-underline', '@tiptap/extension-text-align',
            '@tiptap/extension-link', '@tiptap/extension-highlight',
            '@tiptap/extension-table', '@tiptap/extension-table-row',
            '@tiptap/extension-table-cell', '@tiptap/extension-table-header',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
