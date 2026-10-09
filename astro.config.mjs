// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import clientSettled from './src/integrations/client-settled.ts'

// https://astro.build/config
export default defineConfig({
  site: 'https://audiosilo.app',
  output: 'static',
  devToolbar: { enabled: false },
  // Inline the (one, ~22 KB gzipped) stylesheet: no render-blocking request
  // in front of the first paint. See docs/PERFORMANCE.md.
  build: { inlineStylesheets: 'always' },
  integrations: [react(), sitemap(), clientSettled()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // `@/` -> src/ (shadcn's alias; mirrors tsconfig.json `paths`).
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  },
})
