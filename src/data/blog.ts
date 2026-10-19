/**
 * Blog settings. Posts live in src/content/blog/<slug>.md (the collection is
 * defined in src/content.config.ts); the queries and helpers are in
 * src/lib/blog.ts. See BLOG-SPIKE.md at the workspace root.
 */

/**
 * The three design options of the blog spike. /blog/ and /blog/<slug>/ render
 * BLOG_DESIGN; /blog/designs/<id>/ previews each one (noindex, not in the
 * sitemap). Once the owner picks one, the other two and the preview routes
 * (src/pages/blog/designs/) are deleted.
 */
export const BLOG_DESIGNS = {
  a: { name: 'Front page', summary: 'An editorial magazine: a lead story, a card grid and a latest-release strip.' },
  b: { name: 'Changelog journal', summary: 'Release-cadence led: a timeline by month with a Start here rail.' },
  c: { name: 'Listening room', summary: 'Posts presented the way the player presents books: covers, chapters and a scrubber.' },
} as const

export type BlogDesign = keyof typeof BLOG_DESIGNS

/** The design /blog/ renders. */
export const BLOG_DESIGN: BlogDesign = 'a'

export const BLOG_TITLE = 'The AudioSilo blog'
export const BLOG_DESCRIPTION =
  'News, release notes, guides and video tutorials for AudioSilo, the self-hosted audiobook server and player. Every post says when it was last checked against the shipped software.'

/** Post kinds in display order, with their labels. */
export const BLOG_KINDS = {
  feature: { label: 'Feature', plural: 'Features', blurb: 'What a new feature does and why it is there.' },
  release: { label: 'Release', plural: 'Releases', blurb: 'What changed in each server and app release.' },
  tip: { label: 'Tip', plural: 'Tips', blurb: 'Small things worth knowing.' },
  tutorial: { label: 'Tutorial', plural: 'Tutorials', blurb: 'Step-by-step walkthroughs, most with a video.' },
  guide: { label: 'Guide', plural: 'Guides', blurb: 'Longer, evergreen articles on running your own audiobook library.' },
} as const

export type BlogKind = keyof typeof BLOG_KINDS

/** Words per minute for the reading time (an unhurried, technical-text pace). */
export const READING_WPM = 220

/**
 * Days after which a post's `verified` date counts as stale for
 * `yarn blog:audit` (scripts/blog-audit.mjs reads this file's value with a
 * regex, so keep it a plain number literal).
 */
export const VERIFY_STALE_DAYS = 90

/** Slugs a post can't take: they are blog routes of their own. */
export const RESERVED_SLUGS = ['kind', 'tag', 'designs', 'rss.xml', 'rss', 'page'] as const
