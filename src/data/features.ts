import type Icon from '../components/Icon.astro'

type IconName = Parameters<typeof Icon>[0]['name']

export interface Feature {
  title: string
  icon: IconName
  body: string
}

/**
 * The strongest player-side benefits, shown as cards on the home page. Every
 * sentence traces to the verified copy research (drawn from the frontend and
 * server repos + store metadata) - keep it accurate, plain, benefit-first.
 */
export const features: Feature[] = [
  {
    title: 'Offline downloads',
    icon: 'download',
    body: 'Download books to your device and keep listening with no connection at all, on a flight, on the subway, anywhere.',
  },
  {
    title: 'Sync across every device',
    icon: 'devices',
    body: 'Stop on your phone and pick up in the browser or on a tablet. Your position, bookmarks and notes are already there.',
  },
  {
    title: 'Bookmarks and notes',
    icon: 'book',
    body: 'Drop a bookmark or write a real markdown note at any point in a book, and it travels with the book across your devices.',
  },
  {
    title: 'Sleep timer, shake to cancel',
    icon: 'settings',
    body: 'Fall asleep to your book, then shake your phone to cancel the timer without fumbling for a button in the dark.',
  },
  {
    title: 'Your pace, your place',
    icon: 'bolt',
    body: 'Listen at variable speed, skip by the interval you like, and never lose your place. Resuming rewinds a few seconds to pick up context.',
  },
  {
    title: 'Chapter-aware lock screen',
    icon: 'phone',
    body: 'On Android the lock screen gives you a chapter-relative scrubber, prev and next chapter buttons and 30-second skips, without unlocking your phone.',
  },
  {
    title: 'Fast search at any size',
    icon: 'search',
    body: 'Find any book, author or series instantly, even in a library of thousands of books.',
  },
  {
    title: 'Installable web PWA',
    icon: 'globe',
    body: 'Add the web player to your home screen for an app-like experience, with no app-store install at all.',
  },
]
