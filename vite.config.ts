import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [
    {
      name: 'copy-projects',
      closeBundle() {
        const src = resolve(__dirname, 'projects');
        const dest = resolve(__dirname, 'dist/projects');
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true });
          console.log('✓ Copied projects/ → dist/projects/');
        }
      },
    },
  ],
});
