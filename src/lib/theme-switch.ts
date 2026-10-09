/**
 * Behaviour for the in-page theme switch by the hero media (vanilla, tiny).
 *
 * Markup contract: any button with `data-set-theme="light" | "dark"` sets
 * that preference (persisted, so it survives reloads) and gets `aria-pressed`
 * kept in step with the painted theme, whoever changed it (this switch, the
 * header toggle, the OS while on 'system'). Visual state should come from the
 * `dark:` variant so it is right before this runs; the header toggle follows
 * along through `onPreferenceChange`.
 */
import { getResolvedTheme, onThemeChange, setPreference, type ResolvedTheme } from '@/lib/theme'

export function initThemeSwitches(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-set-theme]:not([data-ts-ready])'))
  if (!buttons.length) return
  const sync = (theme: ResolvedTheme) => {
    for (const b of buttons) {
      b.setAttribute('aria-pressed', String(b.dataset.setTheme === theme))
    }
  }
  for (const b of buttons) {
    b.dataset.tsReady = 'true'
    b.addEventListener('click', () => setPreference(b.dataset.setTheme as ResolvedTheme))
  }
  sync(getResolvedTheme())
  onThemeChange(sync)
}
