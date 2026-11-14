import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Relative base => all asset paths are relative (CrazyGames requirement).
export default defineConfig({
  base: './',
  plugins: process.env.SINGLE ? [viteSingleFile()] : [],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
  },
  server: { host: true },
});
