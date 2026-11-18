import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const r = (p: string) => new URL(p, import.meta.url).pathname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'portfolio-gallery-dev-entry',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/studio-gallery.js') req.url = '/src/features/work/galleryEntry.tsx';
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },
  build: {
    rolldownOptions: {
      input: { main: r('./index.html'), 'studio-gallery': r('./src/features/work/galleryEntry.tsx') },
      output: {
        entryFileNames: chunk => chunk.name === 'studio-gallery' ? 'studio-gallery.js' : 'assets/[name]-[hash].js',
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /[/\\]node_modules[/\\](?:react|react-dom|react-router-dom)[/\\]/ },
            { name: 'vendor-framer', test: /[/\\]node_modules[/\\]framer-motion[/\\]/ },
            { name: 'vendor-lucide', test: /[/\\]node_modules[/\\]lucide-react[/\\]/ },
            // WebGL and Supabase are reached only from lazy public/admin routes.
            { name: 'vendor-three', test: /[/\\]node_modules[/\\]three[/\\]/ },
            { name: 'vendor-supabase', test: /[/\\]node_modules[/\\]@supabase[/\\]supabase-js[/\\]/ },
          ],
        },
        minify: {
          compress: {
            treeshake: { manualPureFunctions: ['console.log', 'console.debug', 'console.info'] },
          },
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
