/**
 * Every outbound URL the site links to, in one place. Import these instead of
 * hard-coding a copy in a component. Verified live 2026-10-12.
 */

/** One-click demo entry: provisions a throwaway demo account, signs this
    browser into the web player and shows a QR to continue on a phone. */
export const DEMO_URL = 'https://demo.audiosilo.app/web/demo'

export const DOCS_URL = 'https://docs.audiosilo.app'
/** The Unraid install guide (Community Applications, the LinuxServer.io image). */
export const UNRAID_DOCS_URL = `${DOCS_URL}/users/getting-started/install-unraid`
/** LinuxServer.io's image repo: lscr.io/linuxserver/audiosilo, the app Unraid's Community Applications lists. */
export const LSIO_REPO_URL = 'https://github.com/linuxserver/docker-audiosilo'
/** The community metadata database (audiosilo-meta). */
export const META_URL = 'https://meta.audiosilo.app'

/** iOS app (live, the store has 2.0.0 since 2026-10-10). */
export const APP_STORE_URL = 'https://apps.apple.com/us/app/audiosilo/id6783431375'
/** Android app (live on Google Play since 2026-10-12, 2.0.0). */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.audiosilo'

export const SPONSORS_URL = 'https://github.com/sponsors/KodeStar'
export const DISCORD_URL = 'https://discord.gg/nFFqRbkRn6'

export const GITHUB_SERVER_URL = 'https://github.com/KodeStar/audiosilo-server'
export const GITHUB_SERVER_RELEASES_URL = `${GITHUB_SERVER_URL}/releases`
/** GitHub API: the server's latest release (VersionBadge reads its tag). */
export const GITHUB_SERVER_LATEST_API = 'https://api.github.com/repos/KodeStar/audiosilo-server/releases/latest'
export const GITHUB_META_URL = 'https://github.com/KodeStar/audiosilo-meta'
export const GITHUB_SIDECARS_URL = 'https://github.com/KodeStar/audiosilo-sidecars'
