// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://audiosilo.app',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // `@/` -> src/ (shadcn's alias; mirrors tsconfig.json `paths`).
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  },
})
