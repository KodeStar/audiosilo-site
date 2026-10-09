/**
 * The public demo's library, as served by demo.audiosilo.app on 2026-10-08
 * (FACTS.md section 5): six public-domain LibriVox recordings, about 38.2 h,
 * all MP3, no community metadata matched.
 */
export const demoBooks = [
  { key: 'carol', title: 'A Christmas Carol', author: 'Charles Dickens', hours: '3.5 h' },
  { key: 'wild', title: 'The Call of the Wild', author: 'Jack London', hours: '3.6 h' },
  { key: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen', hours: '13.4 h' },
  { key: 'alice', title: 'Alice in Wonderland', author: 'Lewis Carroll', hours: '3.0 h' },
  { key: 'sherlock', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', hours: '13.5 h' },
  { key: 'war', title: 'The Art of War', author: 'Sun Tzu', hours: '1.2 h' },
] as const

export type DemoBookKey = (typeof demoBooks)[number]['key']

/**
 * What the demo library is and what it can't show, in ONE place. Every page
 * that describes the demo reads these, so when the demo gets new books (or
 * community metadata), update demoBooks and this block and the whole site
 * follows. Today: six books, no community metadata matched.
 */
const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n)

/** The demo's books are matched to community metadata (series, characters, recaps show there). */
export const DEMO_HAS_COMMUNITY_METADATA = false

export const demoLibrary = {
  count: demoBooks.length,
  /** "six public-domain classics" */
  shelf: `${countWord(demoBooks.length)} public-domain classics`,
  /** "six public-domain LibriVox classics" */
  shelfLong: `${countWord(demoBooks.length)} public-domain LibriVox classics`,
  /**
   * One sentence on what the demo's library can't show, for the notes under
   * demo invitations; null once the demo has community metadata.
   */
  metadataNote: DEMO_HAS_COMMUNITY_METADATA
    ? null
    : 'The demo library has no community metadata, so series bookcases with ghost spines, characters and recaps don\'t appear there; the videos on this site show them.',
} as const

/** A minute in the demo: things that work there today. */
export const demoChecklist = [
  'Press play, then drag the seek bar and watch the whole-book timeline follow.',
  'Set a speed and a sleep timer, then check the time left at your speed.',
  'Drop a bookmark with a label and a note.',
  'Queue another book in Up next.',
  'Press Cmd+K (Ctrl+K) for quick search and actions.',
  'Scan the QR code to carry on in the iPhone app with the same account.',
] as const
