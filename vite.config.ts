import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const r = (p: string) => new URL(p, import.meta.url).pathname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('./src'),
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
          // Split the WebGL stack into its own cacheable chunk. Only pulled
          // in by the 3D logo scene (src/shared/three/*) — no reason for it
          // to bloat the main bundle.
          'vendor-three': ['three'],
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
