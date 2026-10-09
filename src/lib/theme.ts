/**
 * Theme runtime shared by the React islands and vanilla scripts.
 *
 * Dark is the default (owner decision 2026-10-08): a visitor with no stored
 * choice, or with storage blocked, sees dark whatever their OS says. A stored
 * 'light' or 'dark' wins; a stored 'system' follows prefers-color-scheme.
 *
 * The no-flash inline script in Base.astro does the first resolve before
 * paint (and keeps following the OS while the preference is 'system'). It
 * leaves three markers on <html>:
 *   - class `dark`               when the resolved theme is dark (Tailwind's `dark:` variant)
 *   - data-theme="light|dark"    the resolved theme
 *   - data-theme-preference="light|dark|system"  what the viewer chose (or the default)
 * and points <meta name="theme-color"> at the resolved background. This
 * module reads and changes those markers; `DEFAULT_PREFERENCE`, `resolve`
 * and `applyTheme` mirror the inline script (keep the two in step).
 */

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'
/** What a visitor who has never chosen sees. */
export const DEFAULT_PREFERENCE: ThemePreference = 'dark'
/** <meta name="theme-color"> per resolved theme (the page background). */
export const THEME_COLOR: Record<ResolvedTheme, string> = { light: '#f5f7fa', dark: '#0a0f1e' }

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isPreference(v: unknown): v is ThemePreference {
  return v === 'light' || v === 'dark' || v === 'system'
}

/** The viewer's choice; DEFAULT_PREFERENCE ('dark') when unset or storage is unavailable. */
export function getPreference(): ThemePreference {
  if (typeof document === 'undefined') return DEFAULT_PREFERENCE
  const fromDom = document.documentElement.dataset.themePreference
  if (isPreference(fromDom)) return fromDom
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (isPreference(stored)) return stored
  } catch {
    // Storage blocked (private mode, sandboxed preview): fall through.
  }
  return DEFAULT_PREFERENCE
}

/** The theme currently painted ('dark', the default, on the server where there is no DOM). */
export function getResolvedTheme(): ResolvedTheme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref !== 'system') return pref
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** Paint a preference onto <html> without persisting it. */
export function applyTheme(pref: ThemePreference): void {
  const root = document.documentElement
  const resolved = resolve(pref)
  root.classList.toggle('dark', resolved === 'dark')
  root.dataset.theme = resolved
  root.dataset.themePreference = pref
  root.style.colorScheme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved])
}

/**
 * Persist and paint a preference. 'system' is stored explicitly (an empty
 * key means the dark default). Storage failures are ignored: the choice
 * lasts for this page view.
 */
export function setPreference(pref: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref)
  } catch {
    // Storage blocked: still apply for this page view.
  }
  applyTheme(pref)
}

/**
 * Call `cb` whenever the resolved theme changes, whoever changed it (the
 * toggle, the OS while on 'system', another script). Returns an unsubscribe.
 */
export function onThemeChange(cb: (theme: ResolvedTheme) => void): () => void {
  let last = getResolvedTheme()
  const mo = new MutationObserver(() => {
    const next = getResolvedTheme()
    if (next !== last) {
      last = next
      cb(next)
    }
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

/**
 * Call `cb` whenever the preference changes (so a header toggle and an
 * in-page "see it in light" control stay in step). Returns an unsubscribe.
 */
export function onPreferenceChange(cb: (pref: ThemePreference) => void): () => void {
  let last = getPreference()
  const mo = new MutationObserver(() => {
    const next = getPreference()
    if (next !== last) {
      last = next
      cb(next)
    }
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-preference'] })
  return () => mo.disconnect()
}
