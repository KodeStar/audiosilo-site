/**
 * Every image and video the site shows, in one module.
 *
 * All media is the final 2.0 capture set (recorded 2026-10-08/09 against
 * server v2.0.1; the player is the redesigned 2.0 web build, signed in as
 * the listener maya, hero book Mark of the Fool 3).
 *
 * - `stills`: screenshots in src/assets/stills/, imported through
 *   astro:assets (responsive webp at build time). Each has a light and a
 *   dark capture; meta.audiosilo.app has no light theme, so its stills use
 *   the one dark capture in both (`one()`).
 * - `loops`: short silent videos in public/media/<name>-{light,dark}.mp4
 *   with first-frame posters /media/<name>-{light,dark}.webp.
 * - `tours`: full videos in public/media/tours/<name>-<theme>.mp4 with
 *   WebVTT captions, opened from a VideoDialog.
 */
import type { ImageMetadata } from 'astro'

import mobileHomeL from '@/assets/stills/player-mobile-home-light.webp'
import mobileHomeD from '@/assets/stills/player-mobile-home-dark.webp'
import mobileCharactersL from '@/assets/stills/player-mobile-book-characters-light.webp'
import mobileCharactersD from '@/assets/stills/player-mobile-book-characters-dark.webp'
import mobileWhosWhoL from '@/assets/stills/player-mobile-player-whoswho-light.webp'
import mobileWhosWhoD from '@/assets/stills/player-mobile-player-whoswho-dark.webp'
import mobileStatsL from '@/assets/stills/player-mobile-stats-light.webp'
import mobileStatsD from '@/assets/stills/player-mobile-stats-dark.webp'
import mobileYearL from '@/assets/stills/player-mobile-year-light.webp'
import mobileYearD from '@/assets/stills/player-mobile-year-dark.webp'
import mobileJournalL from '@/assets/stills/player-mobile-journal-light.webp'
import mobileJournalD from '@/assets/stills/player-mobile-journal-dark.webp'
import ipadSeriesL from '@/assets/stills/player-ipad-series-light.webp'
import ipadSeriesD from '@/assets/stills/player-ipad-series-dark.webp'
import ipadPlayerL from '@/assets/stills/player-ipad-player-light.webp'
import ipadPlayerD from '@/assets/stills/player-ipad-player-dark.webp'
import desktopUpnextL from '@/assets/stills/player-desktop-upnext-light.webp'
import desktopUpnextD from '@/assets/stills/player-desktop-upnext-dark.webp'

import serverOverviewL from '@/assets/stills/server-overview-light.webp'
import serverOverviewD from '@/assets/stills/server-overview-dark.webp'
import serverMatchL from '@/assets/stills/server-match-light.webp'
import serverMatchD from '@/assets/stills/server-match-dark.webp'
import serverCompareL from '@/assets/stills/server-compare-light.webp'
import serverCompareD from '@/assets/stills/server-compare-dark.webp'
import serverHealthL from '@/assets/stills/server-health-light.webp'
import serverHealthD from '@/assets/stills/server-health-dark.webp'
import serverSeriesL from '@/assets/stills/server-series-light.webp'
import serverSeriesD from '@/assets/stills/server-series-dark.webp'
import serverActivityL from '@/assets/stills/server-activity-light.webp'
import serverActivityD from '@/assets/stills/server-activity-dark.webp'
import serverYearL from '@/assets/stills/server-year-light.webp'
import serverYearD from '@/assets/stills/server-year-dark.webp'
import serverPeopleL from '@/assets/stills/server-people-light.webp'
import serverPeopleD from '@/assets/stills/server-people-dark.webp'
import serverInviteL from '@/assets/stills/server-invite-light.webp'
import serverInviteD from '@/assets/stills/server-invite-dark.webp'

import metaCharacters from '@/assets/stills/meta-work-characters-desktop-dark.webp'
import metaCharactersPhone from '@/assets/stills/meta-work-characters-phone-dark.webp'
import metaWork from '@/assets/stills/meta-work-way-of-kings-desktop-dark.webp'
import metaContribute from '@/assets/stills/meta-contribute-desktop-dark.webp'

export interface Themed<T> {
  light: T
  dark: T
}
export interface Still {
  src: Themed<ImageMetadata>
  alt: string
}

const pair = (light: ImageMetadata, dark: ImageMetadata): Themed<ImageMetadata> => ({ light, dark })
/** meta.audiosilo.app only: the site is dark in both themes. */
const one = (img: ImageMetadata): Themed<ImageMetadata> => ({ light: img, dark: img })

export const stills = {
  // Player 2.0: phone (1170x2532), iPad landscape (2000x1390), desktop browser (1920x1080).
  phoneHome: {
    src: pair(mobileHomeL, mobileHomeD),
    alt: 'Home on a phone: Mark of the Fool 3 with its chapter, a seek bar with bookmark pins, 45% through, time left at 1.3x and the day you will finish, and Resume',
  },
  phoneCharacters: {
    src: pair(mobileCharactersL, mobileCharactersD),
    alt: 'The Characters tab for Mark of the Fool 3 on a phone: only the people already met, each with the chapter they first appear in',
  },
  phoneWhosWho: {
    src: pair(mobileWhosWhoL, mobileWhosWhoD),
    alt: "Who's who over the player on a phone: two characters marked Just met at the top, then the 28 people met so far",
  },
  phoneStats: {
    src: pair(mobileStatsL, mobileStatsD),
    alt: 'Your listening on a phone: 8h 49m this week, a 42-day streak, a daily average and a listening calendar',
  },
  phoneYear: {
    src: pair(mobileYearL, mobileYearD),
    alt: "The first Year in listening card on a phone: maya's 2026 in listening, 116 hours, with a Share this card button",
  },
  phoneJournal: {
    src: pair(mobileJournalL, mobileJournalD),
    alt: "The Journal on a phone: a diary of each day's listening, with Bookmarks and Notes tabs and Export",
  },
  tabletSeries: {
    src: pair(ipadSeriesL, ipadSeriesD),
    alt: 'The Stormlight Archive on an iPad: the books you own as spines in reading order, the five you are missing as dashed ghost spines with their real titles',
  },
  tabletPlayer: {
    src: pair(ipadPlayerL, ipadPlayerD),
    alt: "The full player on an iPad: the cover, the chapter seek bar with the whole-book timeline and bookmark pins under it, and Who's who alongside with two people Just met",
  },
  desktopUpnext: {
    src: pair(desktopUpnextL, desktopUpnextD),
    alt: 'The web player in a desktop browser: the library grid with the Up next drawer open, four books queued and the series to continue',
  },

  // Admin console (server v2.0.1), 1440x900 at 2x, resized.
  serverOverview: {
    src: pair(serverOverviewL, serverOverviewD),
    alt: 'The admin console overview: three people listening now with their book and chapter, totals, recent listening and what needs attention',
  },
  serverMatch: {
    src: pair(serverMatchL, serverMatchD),
    alt: "Match with community metadata for a book whose tags have title and author swapped: the right book, Sharpe's Eagle, comes first with a 100% match and its cover",
  },
  serverCompare: {
    src: pair(serverCompareL, serverCompareD),
    alt: 'Compare with community metadata, field by field: what is on your server, marked File tag or Path, next to the community value, with the fields to take ticked',
  },
  serverHealth: {
    src: pair(serverHealthL, serverHealthD),
    alt: 'Health, Not matched: the Match automatically card with 4 confident and 33 to review, above the books still to match',
  },
  serverSeries: {
    src: pair(serverSeriesL, serverSeriesD),
    alt: 'Series in the admin console: a complete shelf of seven spines, and A Boy Called Christmas with books 2 to 4 missing',
  },
  serverActivity: {
    src: pair(serverActivityL, serverActivityD),
    alt: 'Activity over 90 days: listening hours per day by person, the year day by day, and when the household listens by hour and weekday',
  },
  serverYear: {
    src: pair(serverYearL, serverYearD),
    alt: "The server's Year in listening: 10 people listened for 4,810 hours, the book of the year, and a day-by-day calendar",
  },
  serverPeople: {
    src: pair(serverPeopleL, serverPeopleD),
    alt: 'People: every household account with what they are listening to and how many devices they use',
  },
  serverInvite: {
    src: pair(serverInviteL, serverInviteD),
    alt: 'An invite ready for Grandad: a QR code to scan with a phone camera, the invite link and a one-time code',
  },

  // meta.audiosilo.app (the site is dark only).
  metaCharacters: {
    src: one(metaCharacters),
    alt: 'A work on meta.audiosilo.app with its community characters, each scoped to the chapter they first appear in',
  },
  metaCharactersPhone: {
    src: one(metaCharactersPhone),
    alt: 'Community characters on meta.audiosilo.app on a phone',
  },
  metaWork: {
    src: one(metaWork),
    alt: 'A work on meta.audiosilo.app with its recordings, narrators, runtimes and regional ASINs',
  },
  metaContribute: {
    src: one(metaContribute),
    alt: 'The contribute page on meta.audiosilo.app: which books still need characters and recaps',
  },
} satisfies Record<string, Still>

export interface LoopMedia {
  /** File stem: /media/<name>-{light,dark}.{mp4,webp} */
  name: string
  label: string
  /** CSS aspect-ratio of the recorded video (pixel size of the file). */
  aspect: string
}

export const loops = {
  playerDesktop: {
    name: 'player-desktop',
    label: 'The AudioSilo web player in a desktop browser: home, a series with ghost spines, a book page and the full player',
    aspect: '16/9',
  },
  playerIpad: {
    name: 'player-ipad',
    label: 'The AudioSilo player on an iPad in landscape',
    aspect: '1180/820',
  },
  playerMobile: {
    name: 'player-mobile',
    label: 'The AudioSilo player on a phone',
    aspect: '590/1278',
  },
  server: {
    name: 'server',
    label: 'The AudioSilo admin console: live listeners, library shelves, series with gaps and the match dialog',
    aspect: '16/9',
  },
} satisfies Record<string, LoopMedia>

export interface Tour {
  /** File stem in /media/tours (and the loop whose poster it borrows). */
  name: string
  title: string
  description: string
  /** Shown in the default button label, e.g. "Watch the 3-minute tour". */
  length: string
  /** CSS aspect-ratio of the tour video. */
  aspect: string
}

export const tours = {
  server: {
    name: 'server',
    title: 'A tour of the admin console',
    description: 'Library, matching, health, people, activity and settings, on a real household server. About 4 and a half minutes, captioned.',
    length: '4½-minute',
    aspect: '16/9',
  },
  playerDesktop: {
    name: 'player-desktop',
    title: 'The web player on a desktop',
    description: 'Home, a series with ghost spines, a book page with characters and recaps, the full player, Up next, stats and the Journal. About 3 minutes, captioned.',
    length: '3-minute',
    aspect: '16/9',
  },
  playerIpad: {
    name: 'player-ipad',
    title: 'The player on an iPad',
    description: "The full player with Who's who beside it, the speed and sleep sheets, Up next, the library, a series and your year. 90 seconds, captioned.",
    length: '90-second',
    aspect: '1770/1230',
  },
  playerMobile: {
    name: 'player-mobile',
    title: 'The player on a phone',
    description: "Home, the full player, speed and sleep, Who's who, Up next, a series and the Year in listening story. 90 seconds, captioned.",
    length: '90-second',
    aspect: '1080/2338',
  },
} satisfies Record<string, Tour>
