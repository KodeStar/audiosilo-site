/**
 * Availability switches. Every sentence on the site that depends on what is
 * in which store reads from here, so the owner can flip wording in one place
 * when a release lands. Verified 2026-10-08 (FACTS.md section 0 and 4).
 */

/** The redesigned 2.0 iOS/iPadOS app is live in the App Store (today: 1.2.0, the older design). */
export const IOS_2_IN_STORE = false

/** The Android app is live on Google Play (today: not listed; say "coming soon", no badge). */
export const ANDROID_LIVE = false

/** Latest server release, the fallback when the live GitHub lookup fails. */
export const SERVER_VERSION = 'v2.0.1'

/** Where the redesigned player can be used today, in one sentence. */
export const REDESIGN_WHERE = IOS_2_IN_STORE
  ? 'The same app on the web, iPhone and iPad.'
  : 'Live today in the web player of every AudioSilo server (v2.0 and later) and in the demo. The iPhone and iPad app gets the same redesign in its 2.0 update.'

/** Short label for the iPhone/iPad app, used next to the App Store link. */
export const IOS_APP_NOTE = IOS_2_IN_STORE
  ? 'Free on the App Store for iPhone and iPad.'
  : 'Free on the App Store for iPhone and iPad. The redesign shown on this site arrives there in its 2.0 update.'

export const ANDROID_NOTE = ANDROID_LIVE
  ? 'Free on Google Play.'
  : 'Not on Google Play yet. Until then, the web player installs to your home screen like an app.'

/**
 * Community metadata numbers, from https://meta.audiosilo.app/api/v1/stats and
 * /api/v1/coverage on 2026-10-08. Always shown with STATS_AS_OF.
 */
export const META_STATS = {
  works: 282_383,
  recordings: 297_244,
  people: 124_083,
  series: 45_586,
  chapters: 9_094_856,
  hours: 2_591_823,
  languages: 19,
  withCharacters: 3_148,
} as const
export const STATS_AS_OF = 'October 2026'
