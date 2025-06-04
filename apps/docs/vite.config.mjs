import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const __dirname = path.resolve();

export default defineConfig({
  resolve: {
    alias: {
      '@lambdacurry/medusa-forms': path.resolve(__dirname, '../../packages/medusa-forms/src'),
      '@lambdacurry/medusa-forms/lib': path.resolve(__dirname, '../../packages/medusa-forms/lib'),
    },
  },
  plugins: [tailwindcss()],
  server: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    include: [],
  },
});
