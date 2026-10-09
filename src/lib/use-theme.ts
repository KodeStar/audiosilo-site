import { useSyncExternalStore } from 'react'
import {
  getPreference,
  getResolvedTheme,
  onPreferenceChange,
  onThemeChange,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

/**
 * The resolved theme ('light' | 'dark'), re-rendering when it changes. On the
 * server (and during hydration) it reports 'dark', the site default; islands
 * that render theme-specific markup should treat the first client render as
 * provisional.
 */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(onThemeChange, getResolvedTheme, () => 'dark')
}

/**
 * The viewer's preference, kept in step with every other control on the page.
 * null on the server and during hydration (the server cannot know a stored
 * choice), so controls render nothing pressed until mounted.
 */
export function useThemePreference(): ThemePreference | null {
  return useSyncExternalStore<ThemePreference | null>(onPreferenceChange, getPreference, () => null)
}
