import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    assetsInlineLimit: 10240,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    host: true,
  },
});
