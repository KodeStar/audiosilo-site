/**
 * Blog settings. Posts live in src/content/blog/<slug>.md (the collection is
 * defined in src/content.config.ts); the queries and helpers are in
 * src/lib/blog.ts. See BLOG-SPIKE.md at the workspace root.
 */

export const BLOG_TITLE = 'The AudioSilo blog'
/** The feed; Base.astro links it from every page's head. */
export const BLOG_RSS = '/blog/rss.xml'
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
 * `yarn blog:audit` (scripts/blog-audit.mjs imports it).
 */
export const VERIFY_STALE_DAYS = 90

/** Slugs a post can't take: they are blog routes of their own. */
export const RESERVED_SLUGS = ['kind', 'tag', 'rss.xml', 'rss', 'page'] as const
