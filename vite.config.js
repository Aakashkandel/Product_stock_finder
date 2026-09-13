import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * `/setup-api` is a real path, so the base must be absolute (a relative base
 * would resolve assets against /setup-api/ and 404). Deploying to a
 * subdirectory — GitHub Pages project sites — means setting BASE_PATH:
 *
 *   BASE_PATH=/my-repo/ npm run build
 */
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    {
      // GitHub Pages has no rewrite rules; it serves 404.html for unknown
      // paths. Shipping a copy of the app as 404.html makes /setup-api load.
      name: 'spa-fallback-404',
      closeBundle() {
        try {
          const out = resolve(__dirname, 'dist')
          copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
        } catch {
          /* index.html missing — nothing to copy */
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
