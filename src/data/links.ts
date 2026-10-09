/**
 * Every outbound URL the site links to, in one place. Import these instead of
 * hard-coding a copy in a component. Verified live 2026-10-08.
 */

/** One-click demo entry: provisions a throwaway demo account, signs this
    browser into the web player and shows a QR to continue on a phone. */
export const DEMO_URL = 'https://demo.audiosilo.app/web/demo'

export const DOCS_URL = 'https://docs.audiosilo.app'
/** The community metadata database (audiosilo-meta). */
export const META_URL = 'https://meta.audiosilo.app'

/** iOS app (live, the store has 1.2.0). Android is not on Google Play yet; the 2.0 apps are in beta (see status.ts). */
export const APP_STORE_URL = 'https://apps.apple.com/us/app/audiosilo/id6783431375'

export const SPONSORS_URL = 'https://github.com/sponsors/KodeStar'
export const DISCORD_URL = 'https://discord.gg/nFFqRbkRn6'

export const GITHUB_SERVER_URL = 'https://github.com/KodeStar/audiosilo-server'
export const GITHUB_SERVER_RELEASES_URL = `${GITHUB_SERVER_URL}/releases`
/** GitHub API: the server's latest release (VersionBadge reads its tag). */
export const GITHUB_SERVER_LATEST_API = 'https://api.github.com/repos/KodeStar/audiosilo-server/releases/latest'
export const GITHUB_META_URL = 'https://github.com/KodeStar/audiosilo-meta'
export const GITHUB_SIDECARS_URL = 'https://github.com/KodeStar/audiosilo-sidecars'
