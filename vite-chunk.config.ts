/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import fs from 'fs';

const getChunkName = (() => {
  const SIZE_THRESHOLD = 1 * 1024 * 1024; // mb
  const folderSizes = new Map();
  
  return function(filePath: string, pkgName: string, pkgDir: string): string {
    if (['dayjs', 'lodash'].includes(pkgName)) return pkgName;
    
    if (['react', 'react-dom'].includes(pkgName)) return 'react';
    if (['ace-builds', 'react-ace'].includes(pkgName)) return 'ace';
    if (['@ant-design', 'antd'].includes(pkgName)) return 'antd';
    if (['@babel', '@nivo'].includes(pkgName)) return 'libs';

    if (!folderSizes.has(pkgDir)) folderSizes.set(pkgDir, getFolderSize(pkgDir));
    return folderSizes.get(pkgDir) > SIZE_THRESHOLD ? pkgName : 'libs';

    function getFolderSize(dir: string) {
      let size = 0;
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          size += stats.isDirectory() ? getFolderSize(filePath)
            : path.extname(file) === '.js' ? stats.size : 0;
        }
      } catch (e) {
        console.error(`Error reading directory ${dir}: ${e}`);
      }
      return size;
    }
  }
})();

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id, meta) => {
          // if (id.includes('src/modules')) return 'modules';

          if (id.includes('node_modules')) {
            const nodeModulesPath = path.join(process.cwd(), 'node_modules');
            const pkgName = id.split('node_modules/').pop()!.split('/')[0];
            const pkgDir = path.join(nodeModulesPath, pkgName);
            return getChunkName(id, pkgName, pkgDir);
          }
        },
        // experimentalMinChunkSize: 500 * 1024, // kb
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
