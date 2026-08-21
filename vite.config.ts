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
          // React Three Fiber + drei power the immersive scroll experience
          // (src/experience/*). Only its lazy chunk imports them, so this
          // named chunk stays a cacheable async sibling and never lands in the
          // entry bundle the classic site ships.
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          // supabase-js (GoTrue + Realtime + PostgREST) is imported only from
          // lazy chunks: the /admin tree and /share-testimonial. Because two
          // separate async chunks share it, Rollup would otherwise hoist it
          // into their nearest common ancestor — the entry chunk — putting
          // ~110 KB of auth/websocket code in front of every public visitor.
          // Naming it here keeps it a sibling chunk that only those routes
          // pull in.
          'vendor-supabase': ['@supabase/supabase-js'],
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
