/**
 * The public demo's library, as served by demo.audiosilo.app on 2026-10-09
 * (server v2.2.0, FACTS.md section 5): 29 public-domain LibriVox recordings,
 * about 185 h, laid out as Author/Series/NN, every book matched to the
 * community metadata database. `spine` is the book's cover colour as the
 * server reports it (`cover_color.bg`), the colour the player gives its spine.
 */
interface DemoBook {
  title: string
  author: string
  narrator: string
  hours: number
  spine: string
  series?: string
  /** Place in the series. */
  n?: number
  /** Which typographic cover DemoCover.astro draws for it (the standalones only). */
  cover?: DemoCoverKey
  /** Matched, with About text, but no community characters or recaps yet. */
  noCharacters?: true
}

export type DemoCoverKey = 'carol' | 'wild' | 'alice' | 'war'

export const demoBooks: readonly DemoBook[] = [
  { title: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', narrator: 'Phil Chenevert', hours: 4.1, spine: '#fefdca', series: 'Oz', n: 1 },
  { title: 'The Marvelous Land of Oz', author: 'L. Frank Baum', narrator: 'Phil Chenevert', hours: 5.0, spine: '#e8856c', series: 'Oz', n: 2 },
  { title: 'Ozma of Oz', author: 'L. Frank Baum', narrator: 'Phil Chenevert', hours: 4.2, spine: '#fcead6', series: 'Oz', n: 3 },
  { title: 'Dorothy and the Wizard in Oz', author: 'L. Frank Baum', narrator: 'Phil Chenevert', hours: 4.4, spine: '#010102', series: 'Oz', n: 4 },
  { title: 'The Emerald City of Oz', author: 'L. Frank Baum', narrator: 'Phil Chenevert', hours: 5.9, spine: '#c3c2b5', series: 'Oz', n: 6 },
  { title: 'Glinda of Oz', author: 'L. Frank Baum', narrator: 'Phil Chenevert', hours: 4.7, spine: '#571922', series: 'Oz', n: 14 },
  { title: 'A Study in Scarlet', author: 'Arthur Conan Doyle', narrator: 'Laurie Anne Walden', hours: 4.2, spine: '#e8daba', series: 'Sherlock Holmes', n: 1 },
  { title: 'The Sign of the Four', author: 'Arthur Conan Doyle', narrator: 'Robin Cotter', hours: 4.3, spine: '#e8daba', series: 'Sherlock Holmes', n: 2 },
  { title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', narrator: 'Ruth Golding', hours: 13.5, spine: '#b9b6a3', series: 'Sherlock Holmes', n: 3 },
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', narrator: 'Laurie Anne Walden', hours: 5.9, spine: '#961716', series: 'Sherlock Holmes', n: 5 },
  { title: 'The Valley of Fear', author: 'Arthur Conan Doyle', narrator: 'Katie Riley', hours: 6.4, spine: '#271301', series: 'Sherlock Holmes', n: 7 },
  { title: 'Anne of Green Gables', author: 'L. M. Montgomery', narrator: 'Annie Coleman Rothenberg', hours: 10.9, spine: '#0d2438', series: 'Anne of Green Gables', n: 1 },
  { title: 'Anne of Avonlea', author: 'L. M. Montgomery', narrator: 'LibriVox volunteers', hours: 8.8, spine: '#585757', series: 'Anne of Green Gables', n: 2 },
  { title: 'Anne of the Island', author: 'L. M. Montgomery', narrator: 'Karen Savage', hours: 6.7, spine: '#f3ecd7', series: 'Anne of Green Gables', n: 3 },
  { title: "Anne's House of Dreams", author: 'L. M. Montgomery', narrator: 'LibriVox volunteers', hours: 8.2, spine: '#375817', series: 'Anne of Green Gables', n: 5 },
  { title: 'A Princess of Mars', author: 'Edgar Rice Burroughs', narrator: 'Mark Nelson', hours: 7.4, spine: '#637156', series: 'Barsoom', n: 1 },
  { title: 'The Gods of Mars', author: 'Edgar Rice Burroughs', narrator: 'Mark Nelson', hours: 8.7, spine: '#040303', series: 'Barsoom', n: 2 },
  { title: 'Warlord of Mars', author: 'Edgar Rice Burroughs', narrator: 'Mark Nelson', hours: 5.7, spine: '#fefefd', series: 'Barsoom', n: 3 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', narrator: 'Annie Coleman Rothenberg', hours: 13.4, spine: '#fcf9f9', series: "Jane Austen's Novels", n: 2 },
  { title: 'Northanger Abbey', author: 'Jane Austen', narrator: 'Elizabeth Klett', hours: 7.2, spine: '#191816', series: "Jane Austen's Novels", n: 5 },
  { title: 'Persuasion', author: 'Jane Austen', narrator: 'Elizabeth Klett', hours: 7.9, spine: '#999479', series: "Jane Austen's Novels", n: 6 },
  { title: 'From the Earth to the Moon', author: 'Jules Verne', narrator: 'Mark F. Smith', hours: 5.1, spine: '#010101', series: 'Voyages Extraordinaires', n: 4 },
  { title: 'Around the World in Eighty Days', author: 'Jules Verne', narrator: 'Ralph Snelson', hours: 7.0, spine: '#6b6844', series: 'Voyages Extraordinaires', n: 11 },
  { title: 'The Prisoner of Zenda', author: 'Anthony Hope', narrator: 'Andy Minter', hours: 5.7, spine: '#9a4325', series: 'Zenda', n: 1 },
  { title: 'Rupert of Hentzau', author: 'Anthony Hope', narrator: 'Andy Minter', hours: 8.8, spine: '#9b3734', series: 'Zenda', n: 2, noCharacters: true },
  { title: 'A Christmas Carol', author: 'Charles Dickens', narrator: 'Bob Neufeld', hours: 3.5, spine: '#e4cbb5', cover: 'carol' },
  { title: 'The Call of the Wild', author: 'Jack London', narrator: 'Tom Crawford', hours: 3.6, spine: '#f9f8fa', cover: 'wild', noCharacters: true },
  { title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', narrator: 'LibriVox volunteers', hours: 3.0, spine: '#3afe56', cover: 'alice', noCharacters: true },
  { title: 'The Art of War', author: 'Sun Tzu', narrator: 'Moira Fogarty', hours: 1.2, spine: '#ddd9c1', cover: 'war', noCharacters: true },
]

/** The book the home page's Now card is "playing". */
export const demoFeatured = demoBooks.find((b) => b.cover === 'carol')!

/**
 * The shelf as the player's Series tab lays it out: each series with a slot
 * for every place up to the last one held, so the gaps show as ghost spines.
 */
export const demoSeries = [...new Set(demoBooks.flatMap((b) => (b.series ? [b.series] : [])))].map((name) => {
  const books = demoBooks.filter((b) => b.series === name)
  const last = Math.max(...books.map((b) => b.n ?? 0))
  return {
    name,
    author: books[0].author,
    count: books.length,
    slots: Array.from({ length: last }, (_, i) => books.find((b) => b.n === i + 1) ?? null),
  }
})

/** The books outside any series, each with its own typographic cover. */
export const demoStandalones = demoBooks.filter((b) => !b.series)

/** The demo's books are matched to community metadata (series, characters, recaps show there). */
export const DEMO_HAS_COMMUNITY_METADATA = true

const totalHours = demoBooks.reduce((sum, b) => sum + b.hours, 0)
const waiting = demoBooks.filter((b) => b.noCharacters).map((b) => b.title)
const andList = (items: string[]) => items.join(', ').replace(/, ([^,]*)$/, ' and $1')

/**
 * What the demo library is, in ONE place. Every page that describes the demo
 * reads these, so when the demo's books change, update demoBooks (and this
 * block's wording) and the whole site follows.
 */
export const demoLibrary = {
  count: demoBooks.length,
  /** "about 185 hours" */
  hours: `about ${Math.round(totalHours / 5) * 5} hours`,
  /** "29 public-domain classics" */
  shelf: `${demoBooks.length} public-domain classics`,
  /** "29 public-domain LibriVox classics" */
  shelfLong: `${demoBooks.length} public-domain LibriVox classics`,
  /** "Oz, Sherlock Holmes and Anne of Green Gables": the first three series above. */
  highlights: andList(demoSeries.slice(0, 3).map((s) => s.name)),
  /**
   * One sentence on what the community metadata adds in the demo, for the
   * notes under demo invitations; null if the demo loses its matches.
   */
  metadataNote: DEMO_HAS_COMMUNITY_METADATA
    ? 'Every book is matched to the community database: open a series to see the books you don\'t have as ghost spines, and most books have characters and recaps that only show what you\'ve heard.'
    : null,
  /** Which books still lack characters and recaps, for the metadata page. */
  metadataGaps: `Characters and recaps cover ${demoBooks.length - waiting.length} of the ${demoBooks.length}. ${andList(waiting)} are still waiting for someone to write theirs on meta.audiosilo.app.`,
} as const

/** A minute in the demo: things that work there today (each checked in the live demo, 2026-10-09). */
export const demoChecklist = [
  'Open the Oz series and see the books you don\'t have as ghost spines.',
  'Open A Christmas Carol\'s Characters tab: only the people you\'ve met so far. The rest stay hidden.',
  'Press play, then drag the seek bar and watch the whole-book timeline follow.',
  'Set a speed and a sleep timer, then check the time left at your speed.',
  'Drop a bookmark with a label and a note.',
  'Press Cmd+K (Ctrl+K) for quick search and actions.',
  'Scan the QR code to carry on in the iPhone app with the same account.',
] as const
