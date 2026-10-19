#!/usr/bin/env node
/**
 * Blog freshness audit: which posts need re-checking against the shipped
 * software. Reads the frontmatter of src/content/blog/*.md and prints a table.
 * Always exits 0 (it reports; it never fails a build).
 *
 *   yarn blog:audit                       every post, stale ones flagged
 *   yarn blog:audit --days 60             stale after 60 days (default: VERIFY_STALE_DAYS in src/data/blog.ts)
 *   yarn blog:audit --since v2.3.0        flag posts verified before that git ref's date (a tag in the
 *   yarn blog:audit --since 2026-10-01    server repo, else this repo) or before that date
 *   yarn blog:audit --covers server:transcode,app:downloads
 *                                         also list the posts that depend on those feature keys
 *                                         (a key ending in ":" or "*" matches a prefix: --covers app:)
 *   yarn blog:audit --stale-only          only the posts with a flag or a covers match
 *   yarn blog:audit --json                machine-readable rows instead of the table
 *   yarn blog:audit --server-repo <path>  where to read the newest server tag (default ../audiosilo-server)
 *
 * Flags: "age" (verified more than --days ago), "tag" (verified before the
 * newest server release tag was cut), "since" (verified before --since),
 * "draft", "scheduled" (published in the future), "superseded" (has a
 * newer post: it is kept for reference, so it gets no age or tag flags).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// Node 24 strips the types; neither file imports anything.
import { VERIFY_STALE_DAYS } from '../src/data/blog.ts'
import { GITHUB_SERVER_URL } from '../src/data/links.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const blogDir = join(root, 'src/content/blog')

// ---- arguments -------------------------------------------------------------
const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const flag = (name) => args.includes(`--${name}`)
if (flag('help') || flag('h')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''))
  process.exit(0)
}

const days = Number(opt('days') ?? VERIFY_STALE_DAYS)
const coverKeys = (opt('covers') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const serverRepo = resolve(root, opt('server-repo') ?? '../audiosilo-server')
const today = new Date()

const git = (cwd, ...a) => {
  try {
    return execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim()
  } catch {
    return ''
  }
}

/** The newest server release tag (vX.Y.Z) and when it was cut. */
function newestServerTag() {
  if (existsSync(serverRepo)) {
    const tag = git(serverRepo, 'tag', '--list', 'v*', '--sort=-v:refname').split('\n').find((t) => /^v\d+\.\d+\.\d+$/.test(t))
    if (tag) {
      const date = git(serverRepo, 'log', '-1', '--format=%cI', tag)
      if (date) return { tag, date: new Date(date), from: 'local' }
    }
  }
  // No local checkout: the tag name from GitHub (no date without a clone).
  const remote = git(root, 'ls-remote', '--tags', '--refs', `${GITHUB_SERVER_URL}.git`)
  const tags = remote
    .split('\n')
    .map((l) => l.split('refs/tags/')[1])
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t ?? ''))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  return tags[0] ? { tag: tags[0], date: undefined, from: 'github' } : undefined
}

/** --since: a date, or a git ref (server repo first, then this repo). */
function resolveSince(value) {
  if (!value) return undefined
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return { label: value, date: new Date(value) }
  for (const cwd of [serverRepo, root]) {
    const d = git(cwd, 'log', '-1', '--format=%cI', value)
    if (d) return { label: value, date: new Date(d) }
  }
  console.error(`blog:audit: --since "${value}" is neither a date nor a git ref; ignored`)
  return undefined
}

// ---- frontmatter (the subset the schema uses: scalars, [inline] and - block lists) ----
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const data = {}
  let listKey = null
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    const item = raw.match(/^\s+-\s+(.*)$/)
    if (item && listKey) {
      // Only lists of scalars matter here (covers, tags, related); object lists (revisions) are counted.
      const v = item[1]
      if (/^\w+:\s/.test(v)) data[listKey].push({})
      else data[listKey].push(unquote(v))
      continue
    }
    if (/^\s/.test(raw)) continue // nested keys (video.*, revision fields)
    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const [, key, value] = kv
    listKey = null
    if (value === '') {
      data[key] = []
      listKey = key
    } else if (value.startsWith('[')) {
      data[key] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean)
    } else data[key] = unquote(value)
  }
  return data
}
const unquote = (s) => s.replace(/^(['"])(.*)\1$/, '$2').replace(/''/g, "'")

// ---- posts -------------------------------------------------------------------
const files = existsSync(blogDir) ? readdirSync(blogDir, { recursive: true }).filter((f) => String(f).endsWith('.md')) : []
const tag = newestServerTag()
const since = resolveSince(opt('since'))
const dayMs = 86_400_000

/** The post's covers keys that --covers asks about (exact, or by prefix for "app:" / "server:*"). */
const matches = (covers) =>
  covers.filter((c) => coverKeys.some((k) => (k.endsWith('*') || k.endsWith(':') ? c.startsWith(k.replace(/\*$/, '')) : c === k)))

const rows = files
  .map((f) => {
    const d = frontmatter(readFileSync(join(blogDir, String(f)), 'utf8'))
    const slug = String(f).replace(/\.md$/, '')
    const verified = d.verified ? new Date(d.verified) : undefined
    const age = verified ? Math.floor((today - verified) / dayMs) : undefined
    const covers = Array.isArray(d.covers) ? d.covers : []
    const flags = []
    // A superseded post is kept for reference; its freshness is the newer post's job.
    const live = !d.supersededBy
    if (!verified) flags.push('no-verified')
    if (live && age !== undefined && age > days) flags.push(`age>${days}d`)
    if (live && verified && tag?.date && verified < tag.date) flags.push(`before ${tag.tag}`)
    if (live && verified && since && verified < since.date) flags.push(`before ${since.label}`)
    if (d.draft === 'true') flags.push('draft')
    if (d.published && new Date(d.published) > today) flags.push('scheduled')
    if (d.supersededBy) flags.push(`superseded by ${d.supersededBy}`)
    return {
      slug,
      kind: d.kind ?? '?',
      verified: d.verified ?? '',
      age,
      appliesTo: d.appliesTo ?? '',
      covers,
      matched: matches(covers),
      flags,
    }
  })
  .sort((a, b) => (a.verified || '').localeCompare(b.verified || '') || a.slug.localeCompare(b.slug))

const needsLook = (r) => r.matched.length > 0 || r.flags.some((f) => !f.startsWith('superseded'))
const shown = flag('stale-only') ? rows.filter(needsLook) : rows

if (flag('json')) {
  console.log(JSON.stringify({ days, serverTag: tag?.tag ?? null, since: since?.label ?? null, covers: coverKeys, posts: shown }, null, 2))
  process.exit(0)
}

// ---- table -------------------------------------------------------------------
const head = ['post', 'kind', 'verified', 'age', 'applies to', coverKeys.length ? 'covers match' : 'covers', 'flags']
const body = shown.map((r) => [
  r.slug,
  r.kind,
  r.verified,
  r.age === undefined ? '' : `${r.age}d`,
  r.appliesTo,
  (coverKeys.length ? r.matched : r.covers).join(' '),
  r.flags.join(', '),
])
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const maxW = [34, 9, 10, 5, 28, 36, 44]
const widths = head.map((h, i) => Math.min(maxW[i], Math.max(h.length, ...body.map((r) => r[i].length))))
const line = (cells) => cells.map((c, i) => clip(c, widths[i]).padEnd(widths[i])).join('  ').trimEnd()

console.log(
  `Blog audit, ${today.toISOString().slice(0, 10)}: ${rows.length} posts; stale after ${days} days` +
    (tag ? `; newest server tag ${tag.tag}${tag.date ? ` (${tag.date.toISOString().slice(0, 10)})` : ' (date unknown: no local checkout)'}` : '; no server tag found') +
    (since ? `; since ${since.label} (${since.date.toISOString().slice(0, 10)})` : '') +
    (coverKeys.length ? `; covers ${coverKeys.join(', ')}` : ''),
)
if (!rows.length) {
  console.log('No posts in src/content/blog.')
  process.exit(0)
}
console.log('')
console.log(line(head))
console.log(widths.map((w) => '-'.repeat(w)).join('  '))
for (const r of body) console.log(line(r))
const attention = rows.filter(needsLook)
console.log('')
console.log(
  attention.length
    ? `${attention.length} to look at: ${attention.map((r) => r.slug).join(', ')}`
    : 'Nothing to look at: every post is within its freshness window.',
)
