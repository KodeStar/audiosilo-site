/**
 * Blog queries and helpers, shared by the three design options, the routes,
 * the RSS feed and the JSON-LD. Posts are the `blog` content collection
 * (src/content.config.ts); settings are in src/data/blog.ts.
 *
 * Every page builds links through `blogLinks()`, so the same components
 * render both the live routes (/blog/...) and the design previews
 * (/blog/designs/<id>/...).
 */
import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content'
import type { MarkdownHeading } from 'astro'
import {
  BLOG_DESIGNS,
  BLOG_KINDS,
  READING_WPM,
  RESERVED_SLUGS,
  type BlogDesign,
  type BlogKind,
} from '@/data/blog'
import { stills, tourFiles, tours, type Still, type Tour, type TourFiles } from '@/data/media'

export type Post = CollectionEntry<'blog'>

/* -------------------------------------------------------------------------
   Queries
   ------------------------------------------------------------------------- */

/**
 * A post a production build leaves out: a draft, or one whose `published`
 * date is still to come (a scheduled post; a daily rebuild publishes it).
 */
export function isHidden(p: Post, now = new Date()): boolean {
  return p.data.draft || p.data.published.valueOf() > now.valueOf()
}

/**
 * Every published post, newest first. Drafts and scheduled posts (published
 * in the future) show in `astro dev` only, so they stay out of every page,
 * the RSS feed and the sitemap in a build. An empty or missing
 * src/content/blog is fine: the blog renders its empty state.
 */
export async function getPosts(): Promise<Post[]> {
  const now = new Date()
  const posts = await getCollection('blog', (p) => import.meta.env.DEV || !isHidden(p, now))
  for (const p of posts) {
    if ((RESERVED_SLUGS as readonly string[]).includes(p.id)) {
      throw new Error(`Blog post "${p.id}" uses a reserved slug (${RESERVED_SLUGS.join(', ')})`)
    }
    if (p.data.video?.tour && !(p.data.video.tour in tours)) {
      throw new Error(`Blog post "${p.id}": video.tour "${p.data.video.tour}" is not in src/data/media.ts tours (${Object.keys(tours).join(', ')})`)
    }
    if (p.data.supersededBy?.id === p.id) throw new Error(`Blog post "${p.id}" supersedes itself`)
  }
  // A forward link to a post that isn't out yet (scheduled or a draft) waits
  // until it is: until then the older post reads as current.
  const ids = new Set(posts.map((p) => p.id))
  return posts
    .map((p) => (p.data.supersededBy && !ids.has(p.data.supersededBy.id) ? { ...p, data: { ...p.data, supersededBy: undefined, supersededNote: undefined } } : p))
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf() || a.id.localeCompare(b.id))
}

/** Kinds that have at least one post, in display order, with counts. */
export function kindsIn(posts: Post[]): { kind: BlogKind; count: number }[] {
  return (Object.keys(BLOG_KINDS) as BlogKind[])
    .map((kind) => ({ kind, count: posts.filter((p) => p.data.kind === kind).length }))
    .filter((k) => k.count > 0)
}

/** Every tag with its posts, by slug. */
export function tagsIn(posts: Post[]): Map<string, { tag: string; posts: Post[] }> {
  const out = new Map<string, { tag: string; posts: Post[] }>()
  for (const p of posts) {
    for (const tag of p.data.tags) {
      const slug = tagSlug(tag)
      const entry = out.get(slug) ?? { tag, posts: [] }
      entry.posts.push(p)
      out.set(slug, entry)
    }
  }
  return out
}

/** The newest release post that nothing has replaced. */
export function latestRelease(posts: Post[]): Post | undefined {
  return posts.find((p) => p.data.kind === 'release' && !p.data.supersededBy)
}

/** Posts that point forward to `post` (it replaces them). */
export function supersededPosts(post: Post, posts: Post[]): Post[] {
  return posts.filter((p) => p.data.supersededBy?.id === post.id)
}

/** The post's own related list, topped up from the same kind and shared tags, `n` long. */
export function relatedPosts(post: Post, posts: Post[], n = 3): Post[] {
  const byId = new Map(posts.map((p) => [p.id, p]))
  const chosen: Post[] = []
  const add = (p: Post | undefined) => {
    if (p && p.id !== post.id && !chosen.includes(p) && chosen.length < n) chosen.push(p)
  }
  post.data.related.forEach((r) => add(byId.get(r.id)))
  const score = (p: Post) =>
    p.data.tags.filter((t) => post.data.tags.includes(t)).length * 2 + (p.data.kind === post.data.kind ? 1 : 0)
  posts
    .filter((p) => p.id !== post.id && !p.data.supersededBy)
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .forEach((x) => add(x.p))
  return chosen
}

/** The posts either side of `post` in date order (for "older / newer"). */
export function neighbours(post: Post, posts: Post[]): { newer?: Post; older?: Post } {
  const i = posts.findIndex((p) => p.id === post.id)
  return { newer: i > 0 ? posts[i - 1] : undefined, older: i >= 0 ? posts[i + 1] : undefined }
}

/* -------------------------------------------------------------------------
   Links
   ------------------------------------------------------------------------- */

export interface BlogLinks {
  /** The design being rendered. */
  design: BlogDesign
  /** True on /blog/designs/<id>/... (noindex, a preview bar on top). */
  preview: boolean
  index: string
  post(id: string): string
  kind(kind: BlogKind): string
  tag(tag: string): string
  rss: string
}

/** Links for the live blog (`preview` false) or one design's preview routes. */
export function blogLinks(design: BlogDesign, preview: boolean): BlogLinks {
  const base = preview ? `/blog/designs/${design}` : '/blog'
  return {
    design,
    preview,
    index: `${base}/`,
    post: (id) => `${base}/${id}/`,
    kind: (k) => `${base}/kind/${k}/`,
    tag: (t) => `${base}/tag/${tagSlug(t)}/`,
    rss: '/blog/rss.xml',
  }
}

export const designIds = Object.keys(BLOG_DESIGNS) as BlogDesign[]

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/* -------------------------------------------------------------------------
   Formatting
   ------------------------------------------------------------------------- */

const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** "18 October 2026" */
export const formatDate = (d: Date) => longDate.format(d)
/** "18 Oct" */
export const formatShortDate = (d: Date) => shortDate.format(d)
/** "October 2026" */
export const formatMonth = (d: Date) => monthYear.format(d)
/** "2026-10-18", for <time datetime>. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)

/** Last substantive change: `updated`, else `published`. */
export const modified = (p: Post) => p.data.updated ?? p.data.published

export const kindLabel = (k: BlogKind) => BLOG_KINDS[k].label
export const kindPlural = (k: BlogKind) => BLOG_KINDS[k].plural

/**
 * The version a post is about, from `appliesTo` ("Server 2.3.1, app 2.0.0"):
 * the first product and version it names.
 */
export function versionOf(p: Post): { product: string; version: string } | undefined {
  const m = p.data.appliesTo?.match(/\b(server|app|player|meta)\b\s*v?(\d+\.\d+(?:\.\d+)?)/i)
  if (!m) return undefined
  return { product: m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(), version: m[2] }
}

/* -------------------------------------------------------------------------
   Reading time and chapters
   ------------------------------------------------------------------------- */

const words = (s: string) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length

/**
 * Words per part of the Markdown body: the intro before the first `##`, then
 * one entry per `##` section. Fenced code counts half (it is skimmed).
 */
function sectionWords(body: string): number[] {
  const parts = [0]
  let fence: string | null = null
  for (const line of body.split('\n')) {
    const f = line.match(/^\s*(`{3,}|~{3,})/)
    if (f) {
      if (!fence) fence = f[1][0]
      else if (f[1][0] === fence) fence = null
      continue
    }
    if (!fence && /^##\s+/.test(line)) {
      parts.push(words(line.replace(/^##\s+/, '')))
      continue
    }
    parts[parts.length - 1] += fence ? words(line) / 2 : words(line)
  }
  return parts
}

/** Whole minutes to read the body, at least one. */
export function readingMinutes(body: string | undefined): number {
  const total = sectionWords(body ?? '').reduce((a, b) => a + b, 0)
  return Math.max(1, Math.round(total / READING_WPM))
}

/** "m:ss" for a number of seconds. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export interface PostChapter {
  /** Anchor: the heading's slug, or `top` for the intro. */
  id: string
  title: string
  /** Seconds into the read at READING_WPM: the chapter's "start time". */
  start: number
  /** h3s inside the chapter (design A nests them in its contents). */
  children: { id: string; title: string }[]
}

/**
 * The post's chapters: an intro (the post header, `top`) and one per `##`
 * heading, each with the reading time before it as its start. The header
 * seek bar and the chapter lists use these: the rehype plugin in
 * src/lib/rehype-blog-chapters.ts marks each h2 with data-chapter, and the
 * post header carries data-chapter for the intro, so DOM order matches.
 */
export function postChapters(headings: MarkdownHeading[], body: string | undefined, introTitle = 'Introduction'): PostChapter[] {
  const counts = sectionWords(body ?? '')
  const chapters: PostChapter[] = [{ id: 'top', title: introTitle, start: 0, children: [] }]
  let elapsed = counts[0] ?? 0
  let i = 1
  for (const h of headings) {
    if (h.depth === 2) {
      chapters.push({ id: h.slug, title: h.text, start: (elapsed / READING_WPM) * 60, children: [] })
      elapsed += counts[i++] ?? 0
    } else if (h.depth === 3 && chapters.length > 1) {
      chapters[chapters.length - 1].children.push({ id: h.slug, title: h.text })
    }
  }
  return chapters
}

/* -------------------------------------------------------------------------
   Hero, video, covers
   ------------------------------------------------------------------------- */

export type HeroFrame = { kind: 'phone' | 'tablet' | 'window'; address?: string; still: Still }

/**
 * The post's hero as a Device frame. A hero that is one of src/data/media.ts
 * `stills` (light or dark capture) becomes that themed still, so it follows
 * the page theme like every other screenshot on the site; any other image is
 * shown as itself in both themes.
 */
export function heroFrame(p: Post): HeroFrame | undefined {
  const img = p.data.hero
  // A stale content cache can hand back a hero with no built image: skip it.
  if (!img?.src) return undefined
  const alt = p.data.heroAlt ?? ''
  const known = Object.values(stills).find((s: Still) => s.src.dark.src === img.src || s.src.light.src === img.src)
  const still: Still = known ? { src: known.src, alt: alt || known.alt } : { src: { light: img, dark: img }, alt }
  const ratio = img.width / img.height
  const name = img.src.split('/').pop() ?? ''
  const kind = ratio < 0.8 ? 'phone' : ratio < 1.5 ? 'tablet' : 'window'
  const address = name.startsWith('server-') ? 'your-server/admin' : name.startsWith('meta-') ? 'meta.audiosilo.app' : undefined
  return { kind, address, still }
}

export interface VideoChapter {
  start: number
  label: string
  title: string
}

export type PostVideo =
  | { type: 'youtube'; id: string; title: string; duration?: string; chapters: VideoChapter[]; embedUrl: string; watchUrl: string; thumbnailUrl: string }
  | { type: 'tour'; key: keyof typeof tours; tour: Tour; files: TourFiles; title: string; duration?: string; chapters: VideoChapter[] }

/** Parses "1:05:30", "4:32" or "45" into seconds. */
export function parseClock(s: string): number {
  return s.split(':').reduce((acc, n) => acc * 60 + Number(n), 0)
}

/** "4:32" -> "PT4M32S" (schema.org duration). */
export function isoDuration(s: string): string {
  const t = parseClock(s)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = t % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${sec || (!h && !m) ? `${sec}S` : ''}`
}

/** The post's video, YouTube first (once there is one), else its tour. */
export function postVideo(p: Post): PostVideo | undefined {
  const v = p.data.video
  if (!v) return undefined
  const chapters = v.chapters.map((c) => {
    const m = c.match(/^\s*((?:\d+:)?\d+:\d{2})\s+(.+)$/)
    if (!m) throw new Error(`Blog post "${p.id}": video chapter "${c}" is not "m:ss Title"`)
    return { start: parseClock(m[1]), label: m[1], title: m[2] }
  })
  if (v.youtube) {
    const id = v.youtube
    if (!/^[\w-]{11}$/.test(id)) throw new Error(`Blog post "${p.id}": video.youtube "${id}" is not a YouTube video id`)
    return {
      type: 'youtube',
      id,
      title: p.data.title,
      duration: v.duration,
      chapters,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    }
  }
  if (v.tour) {
    const key = v.tour as keyof typeof tours
    const tour: Tour = tours[key]
    return { type: 'tour', key, tour, files: tourFiles(tour), title: tour.title, duration: v.duration, chapters }
  }
  return undefined
}

/** Cheap, stable string hash (FNV-1a). */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** The wash palettes (Wash.astro, global.css .pal-*). */
export type Palette = 'oz' | 'dracula' | 'treasure' | 'community' | 'console' | 'ember' | 'carol'

const COVER_PALETTES: Palette[] = ['oz', 'dracula', 'treasure', 'community', 'console', 'ember', 'carol']

/**
 * A post's cover colours, from a hash of its slug, within the site's wash
 * palettes (the way the player gives a book its spine colour): the same post
 * always gets the same palette, and every palette is one the site already uses.
 */
export function postPalette(id: string): Palette {
  return COVER_PALETTES[hash(id) % COVER_PALETTES.length]
}

/** A second stable choice from the slug (cover layout variants). */
export function postVariant(id: string, n: number): number {
  return (hash(`${id}:v`) >>> 3) % n
}

/* -------------------------------------------------------------------------
   Rendering one post
   ------------------------------------------------------------------------- */

export interface LoadedPost {
  post: Post
  Content: Awaited<ReturnType<typeof render>>['Content']
  chapters: PostChapter[]
  minutes: number
  supersededBy?: Post
  /** Older posts this one replaces. */
  supersedes: Post[]
  related: Post[]
  newer?: Post
  older?: Post
  hero?: HeroFrame
  video?: PostVideo
}

/** Everything a design's post page needs. */
export async function loadPost(post: Post, posts: Post[]): Promise<LoadedPost> {
  const { Content, headings } = await render(post)
  const ref = post.data.supersededBy
  if (ref && !(await getEntry(ref))) throw new Error(`Blog post "${post.id}": supersededBy "${ref.id}" does not exist`)
  const next = ref ? posts.find((p) => p.id === ref.id) : undefined
  return {
    post,
    Content,
    chapters: postChapters(headings, post.body),
    minutes: readingMinutes(post.body),
    supersededBy: next,
    supersedes: supersededPosts(post, posts),
    related: relatedPosts(post, posts),
    ...neighbours(post, posts),
    hero: heroFrame(post),
    video: postVideo(post),
  }
}

/* -------------------------------------------------------------------------
   Structured data
   ------------------------------------------------------------------------- */

const ORG = { '@type': 'Organization', name: 'AudioSilo', url: 'https://audiosilo.app/' }

/**
 * BlogPosting for every post (plus VideoObject when it has a video). `site`
 * is Astro.site; `heroUrl` the built hero image's URL, if any. The canonical
 * URL is always the live /blog/<slug>/ route, previews included.
 */
export function postJsonLd(p: Post, site: URL, heroUrl?: string): Record<string, unknown>[] {
  const url = new URL(`/blog/${p.id}/`, site).href
  const image = heroUrl ? new URL(heroUrl, site).href : new URL('/og.png', site).href
  const posting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.data.title,
    description: p.data.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: isoDate(p.data.published),
    dateModified: isoDate(modified(p)),
    author: ORG,
    publisher: { ...ORG, logo: { '@type': 'ImageObject', url: new URL('/apple-touch-icon.png', site).href } },
    image,
    articleSection: kindLabel(p.data.kind),
    inLanguage: 'en-GB',
    ...(p.data.tags.length ? { keywords: p.data.tags.join(', ') } : {}),
  }
  const out = [posting]
  const v = postVideo(p)
  if (v) {
    const video: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: v.title,
      description: v.type === 'tour' ? v.tour.description : p.data.description,
      uploadDate: isoDate(p.data.published),
      ...(v.duration ? { duration: isoDuration(v.duration) } : {}),
    }
    if (v.type === 'youtube') {
      video.thumbnailUrl = v.thumbnailUrl
      video.embedUrl = v.embedUrl
      if (v.chapters.length) {
        video.hasPart = v.chapters.map((c, i) => ({
          '@type': 'Clip',
          name: c.title,
          startOffset: c.start,
          ...(v.chapters[i + 1] ? { endOffset: v.chapters[i + 1].start } : {}),
          url: `${v.watchUrl}&t=${c.start}s`,
        }))
      }
    } else {
      video.thumbnailUrl = new URL(v.files.poster.dark, site).href
      video.contentUrl = v.files.video.dark
    }
    posting.video = { '@id': `${url}#video` }
    video['@id'] = `${url}#video`
    out.push(video)
  }
  return out
}
