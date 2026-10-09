/**
 * Behaviour for the in-page theme switch by the hero media (vanilla, tiny).
 *
 * Markup contract: any button with `data-set-theme="light" | "dark"` sets
 * that preference (persisted, so it survives reloads); `data-set-theme="toggle"`
 * flips the resolved theme. Buttons with a fixed value get `aria-pressed`
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
      const v = b.dataset.setTheme
      if (v === 'light' || v === 'dark') b.setAttribute('aria-pressed', String(v === theme))
    }
  }
  for (const b of buttons) {
    b.dataset.tsReady = 'true'
    b.addEventListener('click', () => {
      const v = b.dataset.setTheme
      const next: ResolvedTheme =
        v === 'light' || v === 'dark' ? v : getResolvedTheme() === 'dark' ? 'light' : 'dark'
      setPreference(next)
    })
  }
  sync(getResolvedTheme())
  onThemeChange(sync)
}
