import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Custom Vite plugin that copies the existing root `Assets/` directory
 * directly into `dist/Assets/` during `vite build` without hashing or
 * re-encoding the original PNG or MP3 files.
 */
function preserveRootAssetsPlugin() {
  return {
    name: 'preserve-root-assets',
    closeBundle() {
      const srcAssetsDir = resolve(process.cwd(), 'Assets');
      const distAssetsDir = resolve(process.cwd(), 'dist', 'Assets');
      if (existsSync(srcAssetsDir)) {
        cpSync(srcAssetsDir, distAssetsDir, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [preserveRootAssetsPlugin()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});