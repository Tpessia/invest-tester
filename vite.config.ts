/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // minify: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        app: './index.html',
      },
      output: {
        entryFileNames: assetInfo => 'assets/js/[name]-[hash].js',
        manualChunks: {
          'libs': ['react','react-dom','@remix-run/router','axios','lodash','lodash-es','decimal.js'], // ,'@react-spring','@nivo'
          'ace': ['ace-builds','react-ace'],
          'antd': ['antd'], // ,'@ant-design'
        },
      }
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@core": path.resolve(__dirname, "src/modules/core"),
      "@utils": path.resolve(__dirname, "src/modules/@utils"),
    },
  },
  test: {
    setupFiles: ['./src/tests/setup-tests.ts'],
  },
  plugins: [
    react(),
  ],
});
