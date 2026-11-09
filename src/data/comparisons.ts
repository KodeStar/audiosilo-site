/**
 * The "at a glance" comparison grids (ComparisonGrid.astro). One grid per
 * comparison, keyed by id; a blog post shows one with `glance: <id>` in its
 * frontmatter, and any page can render one with <ComparisonGrid id="..." />.
 *
 * Every cell must be backed by the post's own text or a source it links.
 * Where nothing documents a feature, the cell is `unknown` ("Not documented"),
 * never `no`: unknown support is not a claim of absence. Keep the rows where
 * AudioSilo loses. Re-check every cell when the post is re-verified, and set
 * `checked` to that date.
 */

/** Yes, partly, no, or nothing in the cited sources says. */
export type Mark = 'yes' | 'partial' | 'no' | 'unknown'

export interface FeatureCell {
  mark: Mark
  /** A short qualifier (six words or so), shown under the mark. */
  note?: string
  /** The source behind the cell, when it isn't the post itself. */
  href?: string
}

export interface ValueCell {
  value: string
  note?: string
  /** The best figure in the row, emphasised (and announced as best). */
  best?: boolean
}

export type GridRow =
  | { kind: 'feature'; label: string; cells: FeatureCell[] }
  | { kind: 'value'; label: string; hint?: string; cells: ValueCell[] }

export interface GridColumn {
  name: string
  /** The version compared, under the name. */
  version?: string
  /** Our own product: its column gets the quiet tint. */
  ours?: boolean
}

export interface ComparisonGridData {
  /** The caption's title. */
  title: string
  /** Which versions are compared, in a sentence. */
  versions: string
  /** ISO date every cell was last checked against its sources. */
  checked: string
  /** Where the details and sources are (a heading anchor on the post). */
  details: { href: string; label: string }
  columns: GridColumn[]
  groups: { title: string; rows: GridRow[] }[]
  /** Small print under the table: how the numbers were measured. */
  notes: string[]
}

const ABSORB = 'https://github.com/pounat/absorb'
const AUDIOBOOTH = 'https://github.com/AudioBooth/AudioBooth'

/** Sources: audiosilo-vs-the-competition.md and the READMEs it links. */
const competition: ComparisonGridData = {
  title: 'AudioSilo, Audiobookshelf, BookOrbit and Grimmory at a glance',
  versions: 'AudioSilo 2.6.0, Audiobookshelf 2.37.2, BookOrbit 3.6.0 and Grimmory 3.5.0',
  checked: '2026-11-09',
  details: { href: '#features-that-may-decide-it-before-any-benchmark', label: 'Details and sources below' },
  columns: [
    { name: 'AudioSilo', version: '2.6.0', ours: true },
    { name: 'Audiobookshelf', version: '2.37.2' },
    { name: 'BookOrbit', version: '3.6.0' },
    { name: 'Grimmory', version: '3.5.0' },
  ],
  groups: [
    {
      title: 'Measured',
      rows: [
        {
          kind: 'value',
          label: 'First scan, 1,000 books',
          hint: 'Lower is better',
          cells: [
            { value: '4.4 s', note: 'Covers done by 38 s', best: true },
            { value: '3 min 41 s', note: '999 books indexed' },
            { value: '15.1 min' },
            { value: '54.8 s', note: '64 without a duration' },
          ],
        },
        {
          kind: 'value',
          label: 'CPU for that scan',
          hint: 'CPU seconds, lower is better',
          cells: [
            { value: '11.6 s', best: true },
            { value: '1,098 s' },
            { value: '1,395 s', note: 'With PostgreSQL' },
            { value: '111 s', note: 'With MariaDB' },
          ],
        },
        {
          kind: 'value',
          label: 'Memory at idle, library loaded',
          hint: 'Anonymous memory, lower is better',
          cells: [
            { value: '28 MiB', best: true },
            { value: '197 MiB' },
            { value: '176 MiB', note: 'With PostgreSQL' },
            { value: '606 MiB', note: 'With MariaDB' },
          ],
        },
        {
          kind: 'value',
          label: 'Matching: wrong book written',
          hint: 'Of 3,622 books, lower is better',
          cells: [
            { value: '1', best: true },
            { value: '890', note: 'Quick Match, 2.35.1' },
            { value: '501', note: 'Image of 20 October' },
            { value: '773' },
          ],
        },
      ],
    },
    {
      title: 'Features',
      rows: [
        {
          kind: 'feature',
          label: 'iPhone and Android apps in the stores',
          cells: [
            { mark: 'yes' },
            { mark: 'partial', note: 'Beta; iOS beta full' },
            { mark: 'partial', note: 'iPhone; Android coming' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'CarPlay',
          cells: [
            { mark: 'yes' },
            { mark: 'partial', note: 'Third-party app (Absorb)', href: ABSORB },
            { mark: 'unknown' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'Android Auto',
          cells: [
            { mark: 'yes' },
            { mark: 'yes', note: 'Official app' },
            { mark: 'no', note: 'No Android app yet' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'Apple Watch',
          cells: [
            { mark: 'yes', note: 'Needs server 2.6.0 with ffmpeg' },
            { mark: 'partial', note: 'Third-party app (AudioBooth)', href: AUDIOBOOTH },
            { mark: 'yes', note: 'watchOS 26 or later' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'Offline listening',
          cells: [
            { mark: 'yes', note: 'Apps and web player' },
            { mark: 'yes', note: 'In the apps', href: ABSORB },
            { mark: 'yes', note: 'iPhone and Watch' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'Never writes to your library',
          cells: [
            { mark: 'yes', note: 'Read-only by design' },
            { mark: 'no', note: 'Writes when you edit' },
            { mark: 'no', note: 'Moves, renames, writes files' },
            { mark: 'partial', note: 'Only in network mode' },
          ],
        },
        {
          kind: 'feature',
          label: 'Upload or change files from the browser',
          cells: [
            { mark: 'no', note: 'Read-only by design' },
            { mark: 'yes', note: 'Uploads, tags, merging' },
            { mark: 'yes', note: 'Uploads' },
            { mark: 'yes', note: 'Move, rename, delete' },
          ],
        },
        {
          kind: 'feature',
          label: 'Edit chapter timings',
          cells: [
            { mark: 'partial', note: 'Rename, choose a list' },
            { mark: 'yes' },
            { mark: 'yes' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'Podcasts',
          cells: [
            { mark: 'partial', note: 'Needs the Bridge' },
            { mark: 'yes' },
            { mark: 'yes' },
            { mark: 'unknown' },
          ],
        },
        {
          kind: 'feature',
          label: 'Ebook library (EPUB, PDF, comics)',
          cells: [
            { mark: 'partial', note: 'Companion EPUB, read-along' },
            { mark: 'yes', note: 'Basic reader' },
            { mark: 'yes' },
            { mark: 'yes' },
          ],
        },
        {
          kind: 'feature',
          label: 'E-readers (Kobo, KOReader, OPDS, Kindle)',
          cells: [
            { mark: 'no', note: 'Not yet' },
            { mark: 'partial', note: 'Send to Kindle' },
            { mark: 'yes' },
            { mark: 'yes' },
          ],
        },
        {
          kind: 'feature',
          label: 'Single sign-on (OIDC)',
          cells: [{ mark: 'no', note: 'Not yet' }, { mark: 'yes' }, { mark: 'yes' }, { mark: 'yes' }],
        },
        {
          kind: 'feature',
          label: 'No separate database to run',
          cells: [
            { mark: 'yes', note: 'SQLite built in' },
            { mark: 'yes', note: 'SQLite built in' },
            { mark: 'no', note: 'Needs PostgreSQL' },
            { mark: 'no', note: 'Needs MariaDB' },
          ],
        },
      ],
    },
  ],
  notes: [
    'Scan, CPU and memory: the same 1,000 LibriVox books on one Intel Core i3-N305 server, medians of three runs. CPU runs to 120 seconds after indexing. Memory is anonymous memory, not a full RAM footprint.',
    "Matching: LibraForge's published benchmark, 8 November 2026, scored on 3,622 books.",
  ],
}

/** Sources: audiosilo-vs-audiobookshelf.md (as of its 30 October check). */
const audiobookshelf: ComparisonGridData = {
  title: 'AudioSilo and Audiobookshelf at a glance',
  versions: 'AudioSilo server 2.5.1 and apps 2.5.0 against Audiobookshelf 2.37.2',
  checked: '2026-10-30',
  details: { href: '#what-audiobookshelf-does-that-audiosilo-doesnt', label: 'Details below' },
  columns: [
    { name: 'AudioSilo', version: '2.5.1', ours: true },
    { name: 'Audiobookshelf', version: '2.37.2' },
  ],
  groups: [
    {
      title: 'Measured',
      rows: [
        {
          kind: 'value',
          label: 'First scan, 1,000 books',
          hint: 'Lower is better',
          cells: [{ value: '6.8 s', best: true }, { value: '240 s' }],
        },
        {
          kind: 'value',
          label: 'CPU for that scan',
          hint: 'CPU seconds, lower is better',
          cells: [{ value: '11.4 s', best: true }, { value: '1,145 s' }],
        },
        {
          kind: 'value',
          label: 'Memory a minute after the scan',
          hint: 'Anonymous memory, lower is better',
          cells: [{ value: '29 MiB', best: true }, { value: '197 MiB' }],
        },
        {
          kind: 'value',
          label: 'A cover it has already resized',
          hint: 'Milliseconds, lower is better',
          cells: [{ value: '2.73 ms' }, { value: '2.06 ms', best: true }],
        },
      ],
    },
    {
      title: 'Features',
      rows: [
        {
          kind: 'feature',
          label: 'Phone apps in the App Store and Google Play',
          cells: [{ mark: 'yes' }, { mark: 'partial', note: 'Beta; iOS beta full' }],
        },
        {
          kind: 'feature',
          label: 'CarPlay',
          cells: [{ mark: 'yes' }, { mark: 'partial', note: 'Third-party app (Absorb)', href: ABSORB }],
        },
        { kind: 'feature', label: 'Android Auto', cells: [{ mark: 'yes' }, { mark: 'yes' }] },
        {
          kind: 'feature',
          label: 'Offline listening',
          cells: [
            { mark: 'yes', note: 'Apps and web player' },
            { mark: 'yes', note: 'In the apps', href: ABSORB },
          ],
        },
        {
          kind: 'feature',
          label: 'Chromecast',
          cells: [
            { mark: 'yes', note: 'iOS, Android, web' },
            { mark: 'partial', note: 'Web and Android' },
          ],
        },
        {
          kind: 'feature',
          label: 'Never writes to your library',
          cells: [
            { mark: 'yes', note: 'Read-only by design' },
            { mark: 'no', note: 'Writes when you edit' },
          ],
        },
        {
          kind: 'feature',
          label: 'Upload or change files from the browser',
          cells: [
            { mark: 'no', note: 'Read-only by design' },
            { mark: 'yes', note: 'Uploads, tags, merging' },
          ],
        },
        {
          kind: 'feature',
          label: 'Ebook library (EPUB, PDF, comics)',
          cells: [{ mark: 'partial', note: 'Companion EPUB only' }, { mark: 'yes' }],
        },
        {
          kind: 'feature',
          label: 'Podcasts',
          cells: [{ mark: 'partial', note: 'Needs the Bridge' }, { mark: 'yes' }],
        },
        {
          kind: 'feature',
          label: 'Single sign-on (OIDC)',
          cells: [{ mark: 'no', note: 'Not yet' }, { mark: 'yes' }],
        },
        {
          kind: 'feature',
          label: 'Third-party apps and tools',
          cells: [
            { mark: 'no', note: 'None yet; API documented', href: 'https://docs.audiosilo.app/developers/server/api' },
            { mark: 'yes', note: 'A big ecosystem', href: 'https://audiobookshelf.org/' },
          ],
        },
        {
          kind: 'feature',
          label: 'Spoiler-safe recaps and characters',
          cells: [{ mark: 'yes' }, { mark: 'no' }],
        },
        {
          kind: 'feature',
          label: 'Household profiles and kids mode',
          cells: [{ mark: 'yes' }, { mark: 'no' }],
        },
      ],
    },
    {
      title: 'About',
      rows: [
        {
          kind: 'value',
          label: 'Licence',
          cells: [{ value: 'AGPLv3' }, { value: 'GPL-3.0' }],
        },
        {
          kind: 'value',
          label: 'Built with',
          cells: [{ value: 'Go and SQLite' }, { value: 'Node.js and SQLite' }],
        },
        {
          kind: 'value',
          label: 'Metadata',
          cells: [
            { value: 'Community database' },
            { value: 'Audible, Google Books, Open Library and more' },
          ],
        },
      ],
    },
  ],
  notes: [
    'Measured on the 1,000-book mixed library, one Intel Core i3-N305 server, medians of three runs. Memory is anonymous memory, not a full RAM footprint.',
  ],
}

export const COMPARISON_GRIDS = { competition, audiobookshelf } satisfies Record<string, ComparisonGridData>

export type ComparisonGridId = keyof typeof COMPARISON_GRIDS
export const COMPARISON_GRID_IDS = Object.keys(COMPARISON_GRIDS) as [ComparisonGridId, ...ComparisonGridId[]]

/** What each mark says, visibly in the legend and to screen readers in a cell. */
export const MARK_LABELS: Record<Mark, string> = {
  yes: 'Yes',
  partial: 'Partly',
  no: 'No',
  unknown: 'Not documented',
}
