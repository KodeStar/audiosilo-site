/**
 * Blog queries and helpers, shared by the blog's components, the routes,
 * the RSS feed and the JSON-LD. Posts are the `blog` content collection
 * (src/content.config.ts); settings are in src/data/blog.ts. The design is
 * "Listening room" (docs/DESIGN.md, Pages): posts presented the way the
 * player presents books.
 */
import { getCollection, render, type CollectionEntry } from 'astro:content'
import type { MarkdownHeading } from 'astro'
import { BLOG_KINDS, BLOG_RSS, READING_WPM, RESERVED_SLUGS, type BlogKind } from '@/data/blog'
import { loops, stills, tourFiles, tours, type Still, type Themed, type Tour, type TourFiles } from '@/data/media'
import type { Palette } from '@/components/site/Wash.astro'

export type Post = CollectionEntry<'blog'>

/* -------------------------------------------------------------------------
   Queries
   ------------------------------------------------------------------------- */

/**
 * A post a production build leaves out: a draft, or one whose `published`
 * date is still to come (a scheduled post). The site rebuilds every morning
 * (.github/workflows/ci.yml `schedule`) as well as on every push to master,
 * so a scheduled post goes live with the first build on or after its date.
 */
export function isHidden(p: Post, now = new Date()): boolean {
  return p.data.draft || p.data.published.valueOf() > now.valueOf()
}

/** A post nothing newer replaces (no live `supersededBy`). */
export const isCurrent = (p: Post) => !p.data.supersededBy

/**
 * Every published post, newest first. Drafts and scheduled posts (published
 * in the future) are included only with `includeHidden`, which defaults to
 * `astro dev`, so a build leaves them out of every page, the RSS feed and the
 * sitemap. An empty or missing src/content/blog is fine: the blog renders its
 * empty state.
 *
 * Fails the build on a bad post: a reserved slug, an unknown video.tour, or a
 * `supersededBy` / `related` slug that is not a post at all (Astro's
 * `reference()` does not check that the entry exists).
 */
export async function getPosts({ includeHidden = import.meta.env.DEV }: { includeHidden?: boolean } = {}): Promise<Post[]> {
  const now = new Date()
  const every = await getCollection('blog')
  const known = new Set(every.map((p) => p.id))
  for (const p of every) {
    if ((RESERVED_SLUGS as readonly string[]).includes(p.id)) {
      throw new Error(`Blog post "${p.id}" uses a reserved slug (${RESERVED_SLUGS.join(', ')})`)
    }
    if (p.data.video?.tour && !(p.data.video.tour in tours)) {
      throw new Error(`Blog post "${p.id}": video.tour "${p.data.video.tour}" is not in src/data/media.ts tours (${Object.keys(tours).join(', ')})`)
    }
    if (p.data.supersededBy?.id === p.id) throw new Error(`Blog post "${p.id}" supersedes itself`)
    for (const ref of [p.data.supersededBy, ...p.data.related]) {
      if (ref && !known.has(ref.id)) throw new Error(`Blog post "${p.id}" points at "${ref.id}", which is not a post in src/content/blog`)
    }
  }
  const posts = includeHidden ? every : every.filter((p) => !isHidden(p, now))
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

/** Posts that point forward to `post` (it replaces them). */
function supersededPosts(post: Post, posts: Post[]): Post[] {
  return posts.filter((p) => p.data.supersededBy?.id === post.id)
}

/** The post's own related list, topped up from the same kind and shared tags, `n` long. */
function relatedPosts(post: Post, posts: Post[], n = 3): Post[] {
  const byId = new Map(posts.map((p) => [p.id, p]))
  const chosen: Post[] = []
  const add = (p: Post | undefined) => {
    if (p && p.id !== post.id && !chosen.includes(p) && chosen.length < n) chosen.push(p)
  }
  post.data.related.forEach((r) => add(byId.get(r.id)))
  const score = (p: Post) =>
    p.data.tags.filter((t) => post.data.tags.includes(t)).length * 2 + (p.data.kind === post.data.kind ? 1 : 0)
  posts
    .filter((p) => p.id !== post.id && isCurrent(p))
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .forEach((x) => add(x.p))
  return chosen
}

/* -------------------------------------------------------------------------
   Links
   ------------------------------------------------------------------------- */

/** The blog's routes. */
export const blogLinks = {
  index: '/blog/',
  post: (id: string) => `/blog/${id}/`,
  kind: (k: BlogKind) => `/blog/kind/${k}/`,
  tag: (t: string) => `/blog/tag/${tagSlug(t)}/`,
  rss: BLOG_RSS,
}

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

/** "18 October 2026" */
export const formatDate = (d: Date) => longDate.format(d)
/** "2026-10-18", for <time datetime>. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)

/** Last substantive change: `updated`, else `published`. */
export const modified = (p: Post) => p.data.updated ?? p.data.published

export const kindLabel = (k: BlogKind) => BLOG_KINDS[k].label
export const kindPlural = (k: BlogKind) => BLOG_KINDS[k].plural

/**
 * The version a post is about, from `appliesTo` ("Server 2.3.1, app 2.0.0"):
 * the first product it names, at the newest version listed for it, so
 * "Server 2.3.0 and 2.3.1" is 2.3.1 (up to the next product or a `;`,
 * ignoring asides in parentheses).
 */
export function versionOf(p: Post): { product: string; version: string } | undefined {
  const text = p.data.appliesTo ?? ''
  const m = text.match(/\b(server|app|player|meta)\b\s*v?(\d+\.\d+(?:\.\d+)?)/i)
  if (!m || m.index === undefined) return undefined
  const rest = text
    .slice(m.index + m[0].length)
    .replace(/\([^)]*\)/g, '')
    .split(/;|\b(?:server|app|player|meta)\b/i)[0]
  const parts = (v: string) => v.split('.').map(Number)
  const newer = (a: string, b: string) => {
    const [x, y] = [parts(a), parts(b)]
    for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0)
    return false
  }
  const version = (rest.match(/\d+\.\d+(?:\.\d+)?/g) ?? []).reduce((best, v) => (newer(v, best) ? v : best), m[2])
  return { product: m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(), version }
}

/* -------------------------------------------------------------------------
   Reading time and chapters
   ------------------------------------------------------------------------- */

const words = (s: string) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length

/**
 * Words per part of the Markdown body: the intro before the first `##`, then
 * one entry per `##` section. Fenced code counts half (it is skimmed).
 */
const sectionCache = new Map<string, number[]>()
function sectionWords(body: string): number[] {
  const cached = sectionCache.get(body)
  if (cached) return cached
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
  sectionCache.set(body, parts)
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
}

/**
 * The post's chapters: an intro (the post header, `top`) and one per `##`
 * heading, each with the reading time before it as its start. The header
 * seek bar and the chapter lists use these: the rehype plugin in
 * src/lib/rehype-blog-chapters.ts marks each h2 with data-chapter, and the
 * post header carries data-chapter for the intro, so DOM order matches.
 */
export function postChapters(headings: MarkdownHeading[], body: string | undefined): PostChapter[] {
  const counts = sectionWords(body ?? '')
  const chapters: PostChapter[] = [{ id: 'top', title: 'Introduction', start: 0 }]
  let elapsed = counts[0] ?? 0
  let i = 1
  for (const h of headings) {
    if (h.depth === 2) {
      chapters.push({ id: h.slug, title: h.text, start: (elapsed / READING_WPM) * 60 })
      elapsed += counts[i++] ?? 0
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

interface VideoChapter {
  start: number
  title: string
}

/** A tour's first-frame poster (its loop's files in src/data/media.ts `loops`): size and per-theme srcset. */
export interface TourPoster {
  width: number
  height: number
  srcset: Themed<string>
}

export type PostVideo =
  | { type: 'youtube'; title: string; duration?: string; chapters: VideoChapter[]; embedUrl: string; watchUrl: string; thumbnailUrl: string }
  | { type: 'tour'; key: keyof typeof tours; tour: Tour; files: TourFiles; poster?: TourPoster; title: string; duration?: string; chapters: VideoChapter[] }

/** Parses "1:05:30", "4:32" or "45" into seconds. */
function parseClock(s: string): number {
  return s.split(':').reduce((acc, n) => acc * 60 + Number(n), 0)
}

/** "4:32" -> "PT4M32S" (schema.org duration). */
function isoDuration(s: string): string {
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
  if (v.duration && !/^(?:(?:\d+:)?\d+:\d{2}|\d+)$/.test(v.duration)) {
    throw new Error(`Blog post "${p.id}": video.duration "${v.duration}" is not "m:ss", "h:mm:ss" or seconds`)
  }
  const chapters = v.chapters.map((c) => {
    const m = c.match(/^\s*((?:\d+:)?\d+:\d{2})\s+(.+)$/)
    if (!m) throw new Error(`Blog post "${p.id}": video chapter "${c}" is not "m:ss Title"`)
    return { start: parseClock(m[1]), title: m[2] }
  })
  if (v.youtube) {
    const id = v.youtube
    if (!/^[\w-]{11}$/.test(id)) throw new Error(`Blog post "${p.id}": video.youtube "${id}" is not a YouTube video id`)
    return {
      type: 'youtube',
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
    const files = tourFiles(tour)
    const loop = Object.values(loops).find((l) => l.name === tour.name)
    const [aw, ah] = loop ? loop.aspect.split('/').map(Number) : []
    const poster = loop && {
      width: loop.posterWidths[1],
      height: Math.round((loop.posterWidths[1] * ah) / aw),
      srcset: {
        light: `/media/${loop.name}-light-sm.webp ${loop.posterWidths[0]}w, ${files.poster.light} ${loop.posterWidths[1]}w`,
        dark: `/media/${loop.name}-dark-sm.webp ${loop.posterWidths[0]}w, ${files.poster.dark} ${loop.posterWidths[1]}w`,
      },
    }
    return { type: 'tour', key, tour, files, poster, title: tour.title, duration: v.duration, chapters }
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
const COVER_PALETTES: Palette[] = ['oz', 'dracula', 'treasure', 'community', 'console', 'ember', 'carol']

/**
 * The lead colours each palette may open a cover with: a rotation of its
 * --w1..3 (0 leads with --w1, 1 with --w2, 2 with --w3), picked against the
 * colours in global.css so the shelf spreads across green, gold, crimson,
 * teal, sand, blue, amber and orange instead of piling up on the violet that
 * several palettes share. Order is preference.
 */
const COVER_LEADS: Record<Palette, number[]> = {
  oz: [0, 1],
  dracula: [1],
  treasure: [0, 1, 2],
  community: [1],
  console: [1, 0],
  ember: [1, 0],
  carol: [0, 1, 2],
}

/** Motif variants each kind's cover draws from (PostCover.astro). */
export const COVER_MOTIFS = 4

/** Glow position and gradient angle pairs for a cover's light. */
const COVER_LIGHTS = [
  { at: '80% 18%', angle: 155 },
  { at: '18% 22%', angle: 200 },
  { at: '85% 75%', angle: 125 },
  { at: '50% 0%', angle: 175 },
] as const

/**
 * A post's generated cover: its palette (one of the site's wash palettes),
 * which of the palette's three colours leads (COVER_LEADS, so two posts on
 * one palette still differ in hue), the kind's motif variant, where
 * the light falls, and a seed for drawn patterns.
 */
export interface CoverStyle {
  palette: Palette
  lead: number
  motif: number
  light: (typeof COVER_LIGHTS)[number]
  seed: number
}

/**
 * The first of `n` options with the lowest count, scanning from `start` and
 * skipping `avoid` when another option ties with it.
 */
function leastUsed(n: number, count: (i: number) => number, start: number, avoid?: number): number {
  let best = -1
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n
    if (i === avoid && n > 1) continue
    if (best < 0 || count(i) < count(best)) best = i
  }
  return avoid !== undefined && count(avoid) < count(best) ? avoid : best
}

/**
 * Covers for every post, so the shelf never looks samey: posts are taken
 * oldest first and each gets the least-used palette (never the one the post
 * before it has), the least-used lead colour on that palette, and the
 * least-used motif of its kind (never the previous post of that kind's),
 * ties broken by a hash of the slug. Taking them oldest first means a new
 * post never changes an older post's cover. Drafts and scheduled posts count
 * too, so dev and production agree.
 */
function assignCovers(posts: { id: string; kind: BlogKind; published: Date }[]): Map<string, CoverStyle> {
  const ordered = [...posts].sort((a, b) => a.published.valueOf() - b.published.valueOf() || a.id.localeCompare(b.id))
  const paletteUse = new Array(COVER_PALETTES.length).fill(0)
  const leadUse = COVER_PALETTES.map(() => [0, 0, 0])
  const motifUse = new Map<BlogKind, number[]>()
  const lastMotif = new Map<BlogKind, number>()
  const out = new Map<string, CoverStyle>()
  let lastPalette: number | undefined
  for (const p of ordered) {
    const h = hash(p.id)
    const pi = leastUsed(COVER_PALETTES.length, (i) => paletteUse[i], h % COVER_PALETTES.length, lastPalette)
    const leads = COVER_LEADS[COVER_PALETTES[pi]]
    const lead = leads[leastUsed(leads.length, (i) => leadUse[pi][leads[i]], 0)]
    const uses = motifUse.get(p.kind) ?? new Array(COVER_MOTIFS).fill(0)
    const motif = leastUsed(COVER_MOTIFS, (i) => uses[i], (h >>> 9) % COVER_MOTIFS, lastMotif.get(p.kind))
    paletteUse[pi]++
    leadUse[pi][lead]++
    uses[motif]++
    motifUse.set(p.kind, uses)
    lastMotif.set(p.kind, motif)
    lastPalette = pi
    out.set(p.id, { palette: COVER_PALETTES[pi], lead, motif, light: COVER_LIGHTS[(h >>> 13) % COVER_LIGHTS.length], seed: (h % 2147483646) + 1 })
  }
  return out
}

let coverCache: { key: string; covers: Map<string, CoverStyle> } | undefined

/** Every post's cover (assignCovers), recomputed only when the posts change. */
export async function coverStyles(): Promise<Map<string, CoverStyle>> {
  const posts = (await getCollection('blog')).map((p) => ({ id: p.id, kind: p.data.kind, published: p.data.published }))
  const key = posts.map((p) => `${p.id}@${p.published.valueOf()}:${p.kind}`).join('|')
  if (coverCache?.key !== key) coverCache = { key, covers: assignCovers(posts) }
  return coverCache.covers
}

/** One post's cover. */
export async function coverStyle(id: string): Promise<CoverStyle> {
  const style = (await coverStyles()).get(id)
  if (!style) throw new Error(`Blog post "${id}" has no cover (not in src/content/blog)`)
  return style
}

/** The inline custom properties that rotate a cover's palette and place its light (blog.css .post-cover). */
export function coverVars(style: CoverStyle): string {
  const w = [1, 2, 3].map((n) => `var(--w${((n - 1 + style.lead) % 3) + 1})`)
  return `--c1:${w[0]};--c2:${w[1]};--c3:${w[2]};--glow-at:${style.light.at};--cover-angle:${style.light.angle}deg`
}

/** A small seeded generator (Park-Miller) for a cover's drawn patterns, stable per post. */
export function seeded(seed: number): () => number {
  let s = seed % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
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
  hero?: HeroFrame
  video?: PostVideo
}

/** Everything a post page needs. */
export async function loadPost(post: Post, posts: Post[]): Promise<LoadedPost> {
  const { Content, headings } = await render(post)
  const ref = post.data.supersededBy
  const next = ref ? posts.find((p) => p.id === ref.id) : undefined
  return {
    post,
    Content,
    chapters: postChapters(headings, post.body),
    minutes: readingMinutes(post.body),
    supersededBy: next,
    supersedes: supersededPosts(post, posts),
    related: relatedPosts(post, posts),
    hero: heroFrame(post),
    video: postVideo(post),
  }
}

/* -------------------------------------------------------------------------
   Structured data
   ------------------------------------------------------------------------- */

/**
 * BlogPosting for every post (plus VideoObject when it has a video, `v` from
 * loadPost). `site` is Astro.site; `heroUrl` the built hero image's URL, if
 * any. The canonical URL is the post's /blog/<slug>/ route.
 */
export function postJsonLd(p: Post, site: URL, v: PostVideo | undefined, heroUrl?: string): Record<string, unknown>[] {
  const ORG = { '@type': 'Organization', name: 'AudioSilo', url: new URL('/', site).href }
  const url = new URL(blogLinks.post(p.id), site).href
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
