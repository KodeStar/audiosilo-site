/**
 * Availability switches. Every sentence on the site that depends on what is
 * in which store reads from here, so the owner can flip wording in one place
 * when a release lands. Verified 2026-10-09 (FACTS.md sections 0 and 4, plus
 * the owner: the 2.0 apps for iPhone, iPad and Android are in a beta that
 * people join by asking on Discord).
 */
import { DISCORD_URL } from './links'

/** The redesigned 2.0 iOS/iPadOS app is live in the App Store (today: 1.2.0, the older design). */
export const IOS_2_IN_STORE = false

/** The Android app is live on Google Play (today: not listed; no Play badge until it is). */
export const ANDROID_LIVE = false

/** The 2.0 apps are in a beta testers join through Discord. Turn off once both stores carry 2.0. */
export const APPS_BETA = !(IOS_2_IN_STORE && ANDROID_LIVE)

/** Latest server release, the fallback when the live GitHub lookup fails. */
export const SERVER_VERSION = 'v2.0.1'

/** Where to ask for the app beta (the project Discord). */
export const BETA_URL = DISCORD_URL
export const BETA_LABEL = 'Ask for beta access on Discord'

/** Where the redesigned player can be used today, in one sentence. */
export const REDESIGN_WHERE = IOS_2_IN_STORE && ANDROID_LIVE
  ? 'The same app on the web, iPhone, iPad and Android.'
  : IOS_2_IN_STORE
    ? 'The same app on the web, iPhone and iPad. The Android app gets it in its 2.0 release, in beta now.'
    : 'Live today in the web player of every AudioSilo server (v2.0 and later) and in the demo. The iPhone, iPad and Android apps get the same redesign in their 2.0 update, in beta now.'

/** Short label for the iPhone/iPad app, used next to the App Store link. */
export const IOS_APP_NOTE = IOS_2_IN_STORE
  ? 'Free on the App Store for iPhone and iPad.'
  : 'Free on the App Store for iPhone and iPad. The redesign shown on this site reaches the App Store in the 2.0 update; the 2.0 beta is open to testers now.'

/** Heading for the Android card. */
export const ANDROID_HEADING = ANDROID_LIVE ? 'On Google Play' : 'In beta'

export const ANDROID_NOTE = ANDROID_LIVE
  ? 'Free on Google Play.'
  : 'The Android app is in beta and not on Google Play yet. Ask on Discord to try it. Until then, the web player installs to your home screen like an app.'

/** One line for the platforms list (home "how it fits", docs). */
export const PLATFORMS_LINE = ANDROID_LIVE
  ? 'The web, iPhone, iPad and Android.'
  : 'The web, iPhone and iPad, with Android in beta.'

/** The "Get the app" link's subtitle. */
export const GET_APP_LINE = IOS_2_IN_STORE && ANDROID_LIVE
  ? 'Web player now; iPhone, iPad and Android in the stores'
  : ANDROID_LIVE
    ? 'Web player now; iPhone, iPad and Android in the stores; the 2.0 apps in beta'
    : 'Web player now; iPhone and iPad on the App Store; the 2.0 apps in beta'

/** Sentence opener for app-only features (home/away addresses). */
export const APPS_WITH_2 = IOS_2_IN_STORE && ANDROID_LIVE
  ? 'The iPhone, iPad and Android apps'
  : 'The 2.0 apps for iPhone, iPad and Android (in beta now)'

/** Android in a parenthesis, for "a player for the web, iPhone and iPad (...)". */
export const ANDROID_ASIDE = ANDROID_LIVE ? 'and Android too' : 'Android is in beta'

/** Footer and FAQ: how to join the beta. */
export const BETA_NOTE = 'The redesigned 2.0 apps for iPhone, iPad and Android are in beta. Ask on Discord and you can try them before they reach the stores.'

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
