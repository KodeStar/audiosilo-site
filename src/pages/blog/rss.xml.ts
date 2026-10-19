import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { BLOG_DESCRIPTION, BLOG_TITLE } from '@/data/blog'
import { getPosts, kindLabel, liveBlogLinks } from '@/lib/blog'

/** /blog/rss.xml: every published post, newest first, linking the live /blog/<slug>/ routes. */
export async function GET(context: APIContext) {
  const posts = await getPosts({ includeHidden: false })
  return rss({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    site: context.site!,
    trailingSlash: true,
    customData: '<language>en-gb</language>',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      link: liveBlogLinks.post(p.id),
      pubDate: p.data.published,
      categories: [kindLabel(p.data.kind), ...p.data.tags],
    })),
  })
}
