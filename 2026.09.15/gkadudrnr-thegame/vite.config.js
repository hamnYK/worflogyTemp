import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import {gameEntry} from './scripts/game-entry.mjs';
export default defineConfig({ plugins:[gameEntry()], base: './', server:{watch:{ignored:['**/output/**','**/dist/**','**/local/**']}}, build: { target: 'es2022', assetsInlineLimit: 0, rollupOptions: { input: {
  game: fileURLToPath(new URL('./index.html', import.meta.url)),
  designSystem: fileURLToPath(new URL('./design-system.html', import.meta.url)),
} } } });
