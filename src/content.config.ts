import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { BLOG_KINDS, type BlogKind } from './data/blog'

/** Blog posts: one Markdown file per post, src/content/blog/<slug>.md. See BLOG-SPIKE.md. */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(90),
      /** Meta description and card summary: one or two sentences. */
      description: z.string().max(180),
      kind: z.enum(Object.keys(BLOG_KINDS) as [BlogKind, ...BlogKind[]]),
      published: z.coerce.date(),
      /** Set on any substantive edit; drives dateModified. */
      updated: z.coerce.date().optional(),
      /** Last date every claim was checked against shipped software. */
      verified: z.coerce.date(),
      /** Versions the post describes, e.g. "Server 2.3.1, app 2.0.0". */
      appliesTo: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Feature keys this post depends on (server:<area>, app:<area>, docs:<path>). */
      covers: z.array(z.string()).default([]),
      /** A newer post that replaces this one; renders the forward-link banner. */
      supersededBy: reference('blog').optional(),
      supersededNote: z.string().optional(),
      related: z.array(reference('blog')).default([]),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      video: z
        .object({
          youtube: z.string().optional(),
          /** A tour name from src/data/media.ts `tours`. */
          tour: z.string().optional(),
          duration: z.string().optional(),
          /** Chapters for the description and the on-page list, "m:ss Title". */
          chapters: z.array(z.string()).default([]),
        })
        .optional(),
      revisions: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
      draft: z.boolean().default(false),
    }),
})

export const collections = { blog }
