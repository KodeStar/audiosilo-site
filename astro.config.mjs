// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import clientSettled from './src/integrations/client-settled.ts'
import rehypeBlogChapters from './src/lib/rehype-blog-chapters.ts'

// https://astro.build/config
export default defineConfig({
  site: 'https://audiosilo.app',
  output: 'static',
  devToolbar: { enabled: false },
  // Inline the (one, ~22 KB gzipped) stylesheet: no render-blocking request
  // in front of the first paint. See docs/PERFORMANCE.md.
  build: { inlineStylesheets: 'always' },
  integrations: [react(), sitemap(), clientSettled()],
  // Markdown is only the blog (src/content/blog). Code is unhighlighted, as in
  // CodeBlock.astro, and h2s become chapters (the post's chapter list and
  // mini player).
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [rehypeBlogChapters],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // `@/` -> src/ (shadcn's alias; mirrors tsconfig.json `paths`).
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  },
})
