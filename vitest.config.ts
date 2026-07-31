import { defineConfig } from 'vitest/config';

const r = (p: string) => new URL(p, import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
});
