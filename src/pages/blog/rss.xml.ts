import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { BLOG_DESCRIPTION, BLOG_TITLE } from '@/data/blog'
import { getPosts, isHidden, kindLabel } from '@/lib/blog'

/** /blog/rss.xml: every published post, newest first, linking the live /blog/<slug>/ routes. */
export async function GET(context: APIContext) {
  const posts = await getPosts()
  return rss({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    site: context.site ?? 'https://audiosilo.app',
    trailingSlash: true,
    customData: '<language>en-gb</language>',
    items: posts
      .filter((p) => !isHidden(p))
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        link: `/blog/${p.id}/`,
        pubDate: p.data.published,
        categories: [kindLabel(p.data.kind), ...p.data.tags],
      })),
  })
}
