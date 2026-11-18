import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';


// Phaser's own webpack build replaces `typeof FLAG` with literals; do the same so dead branches (debug tooling, sound manager, camera3d...) are dropped.
const PHASER_FLAGS: Record<string, string> = { CANVAS_RENDERER: 'true', WEBGL_RENDERER: 'true', WEBGL_DEBUG: 'false', EXPERIMENTAL: 'false', PLUGIN_CAMERA3D: 'false', PLUGIN_FBINSTANT: 'false', FEATURE_SOUND: 'false' };
const phaserFlags = () => ({
  name: 'phaser-flags', enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!/node_modules[\\/]phaser[\\/]src/.test(id) && !/phaserLite/.test(id)) return null;
    let out = code;
    for (const [k, v] of Object.entries(PHASER_FLAGS)) out = out.split(`typeof ${k}`).join(v);
    return out === code ? null : { code: out, map: null };
  },
});

// Relative base => all asset paths are relative (CrazyGames requirement).
export default defineConfig({
  base: './',
  define: { global: 'globalThis' },
  resolve: { alias: [{ find: 'phaser3spectorjs', replacement: fileURLToPath(new URL('./src/emptyModule.cjs', import.meta.url)) }, { find: /^phaser$/, replacement: fileURLToPath(new URL('./src/phaserLite.js', import.meta.url)) }] },
  plugins: [phaserFlags(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    commonjsOptions: { include: [/node_modules/, /emptyModule\.cjs/], transformMixedEsModules: true },
  },
  // dev server pre-bundles deps with esbuild, which bypasses the plugin above: apply the same flag replacement there.
  optimizeDeps: {
    esbuildOptions: {
      plugins: [{
        name: 'phaser-flags-dev',
        setup(build: any) {
          build.onLoad({ filter: /node_modules[\\/]phaser[\\/]src[\\/].*\.js$/ }, (a: any) => {
            let code = readFileSync(a.path, 'utf8');
            for (const [k, v] of Object.entries(PHASER_FLAGS)) code = code.split(`typeof ${k}`).join(v);
            return { contents: code, loader: 'js' };
          });
        },
      }],
    },
  },
  server: { host: true },
});
