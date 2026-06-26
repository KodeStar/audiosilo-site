import type Icon from '../components/Icon.astro'

type IconName = Parameters<typeof Icon>[0]['name']

export interface FeatureGroup {
  title: string
  icon: IconName
  intro: string
  points: string[]
}

/**
 * The headline feature groups shown on the home page. Content is drawn from the
 * audiosilo-server README and the audiosilo-frontend project — keep it accurate.
 */
export const featureGroups: FeatureGroup[] = [
  {
    title: 'Your own secure Go server',
    icon: 'server',
    intro:
      'AudioSilo Server is a small, open-source server written in Go, designed to be safe to leave exposed to the internet.',
    points: [
      'No default passwords — admin credentials are generated on first run and printed once',
      'Per-IP rate limiting and brute-force lockout, with argon2id password hashing',
      'Configurable TLS: self-signed, automatic Let’s Encrypt, or off behind a reverse proxy',
      'Fast SQLite FTS5 search that stays quick across thousands of books',
      'HTTP range streaming for instant seek and scrub, plus direct downloads',
      'Light on resources, with no separate database to run',
    ],
  },
  {
    title: 'Built for audiobooks',
    icon: 'book',
    intro:
      'Both the server and the player are built specifically for audiobooks — not a music player wearing a costume.',
    points: [
      'Auto-detected folder shapes — single-file m4b, folder-per-book or multi-file mp3 parts, with nothing to configure',
      'Normalized chapters across single-file and multi-file books',
      'Resume-anywhere progress, bookmarks and markdown notes',
      'The filesystem is the source of truth — move or re-tag files and your progress follows them',
      'Embedded cover art and durations extracted automatically (via ffmpeg)',
    ],
  },
  {
    title: 'Apps on every device',
    icon: 'devices',
    intro:
      'One codebase ships native iOS and Android apps plus an installable web PWA — your library on whatever you’re holding.',
    points: [
      'Native iOS & Android apps and an installable web PWA, all from one codebase',
      'Offline downloads for listening without a connection',
      'Variable playback speed, configurable skip, and auto-rewind on resume',
      'Sleep timer with shake-to-cancel',
      'Light and dark themes, listening history and favourites',
      'Progress, bookmarks and notes synced across every device',
      'Localised into six languages: English, Spanish, French, German, Portuguese and Italian',
    ],
  },
  {
    title: 'Multi-user & sharing',
    icon: 'users',
    intro:
      'Share your library on your terms with filesystem-based shares and a built-in admin console.',
    points: [
      'Filesystem-based shares — grant a whole library, one author, a series or a single book',
      'Each user browses a filtered view scoped to exactly what they’re allowed to see',
      'Per-user progress, bookmarks, notes and history',
      'Built-in admin console to manage users, libraries, shares and auth codes',
      'Pair devices with a copy-invite link or QR code; usernames and passwords also supported',
      'Optional public demo mode with throwaway, auto-reaped accounts',
    ],
  },
]

export interface Highlight {
  icon: IconName
  label: string
}

/** Compact highlights row under the hero. */
export const highlights: Highlight[] = [
  { icon: 'shield', label: 'Safe to self-host' },
  { icon: 'bolt', label: 'Fast at any size' },
  { icon: 'devices', label: 'iOS, Android & web' },
  { icon: 'download', label: 'Offline downloads' },
  { icon: 'search', label: 'Full-text search' },
  { icon: 'users', label: 'Multi-user sharing' },
]
