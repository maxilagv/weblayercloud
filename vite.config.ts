import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  ssr: {
    // These packages are ESM-only; bundle them for SSR instead of loading as CJS externals
    noExternal: ['class-variance-authority', '@radix-ui/react-slot', '@radix-ui/react-label', 'gsap'],
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
