import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const r = (p: string) => new URL(p, import.meta.url).pathname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('.'),
      '@components': r('./components'),
      '@contexts': r('./contexts'),
      '@hooks': r('./hooks'),
      '@utils': r('./utils'),
      '@translations': r('./translations'),
    },
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  esbuild: {
    // Strip noisy logs from production, preserve error/warn for debugging.
    pure: ['console.log', 'console.debug', 'console.info'],
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
