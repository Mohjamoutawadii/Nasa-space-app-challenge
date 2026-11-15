
import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        certif: resolve(__dirname, 'certif.html'),
        mission1: resolve(__dirname, 'mission1.html'),
        mission2: resolve(__dirname, 'mission2.html'),
        start: resolve(__dirname, 'start.html'),
        path: resolve(__dirname, 'path.html'),
        'Cosmo-introduction': resolve(__dirname, 'Cosmo-introduction.html'),
        'mission1-exploration': resolve(__dirname, 'mission1-exploration.html'),
      },
    },
  },
});
