import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // Vital for GitHub Pages & static hosting
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-core': ['vue', 'vue-router', 'pinia'],
          'vendor-db': ['dexie'],
          'vendor-xlsx': ['xlsx'],
          'vendor-exceljs': ['exceljs'],
          'vendor-chart': ['chart.js']
        }
      }
    }
  }
});
