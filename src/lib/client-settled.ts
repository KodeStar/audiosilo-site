/**
 * `client:settled` - an Astro client directive for islands that are on screen
 * from the start but not needed for the first paint (the header's theme menu
 * and mobile menu, the version badge).
 *
 * `client:idle` hydrates as soon as the browser is first idle, which on a
 * fast load is still before the hero has painted, so the React runtime
 * competes with the LCP image for bandwidth on a slow phone. This waits until
 * the page has loaded and then a further moment of idle time, or hydrates at
 * once when the visitor reaches for the island (pointer, touch, focus, key).
 * A click that lands before hydration has finished is held and replayed on
 * the same element afterwards, so the first tap on a menu is never lost.
 */
import type { ClientDirective } from 'astro'

const DELAY_AFTER_LOAD_MS = 1200
const INTENT = ['pointerover', 'pointerdown', 'touchstart', 'focusin', 'keydown'] as const

const settled: ClientDirective = (load, _options, el) => {
  let started = false
  let hydrated = false
  let heldClick: HTMLElement | null = null

  const onIntent = () => void start()
  const onClick = (e: Event) => {
    if (hydrated) return
    // Hold the click until React is listening, then replay it.
    e.preventDefault()
    e.stopPropagation()
    // The target is often an <svg> inside the button: hold the clickable element itself.
    const target = e.target instanceof Element ? e.target.closest<HTMLElement>('button, a, [role="button"], [tabindex]') : null
    heldClick = target ?? (e.target instanceof HTMLElement ? e.target : null)
    void start()
  }

  const cleanup = () => {
    INTENT.forEach((type) => el.removeEventListener(type, onIntent))
    el.removeEventListener('click', onClick, true)
  }

  async function start() {
    if (started) return
    started = true
    const hydrate = await load()
    await hydrate()
    hydrated = true
    cleanup()
    if (heldClick?.isConnected) {
      const target = heldClick
      heldClick = null
      requestAnimationFrame(() => target.click())
    }
  }

  INTENT.forEach((type) => el.addEventListener(type, onIntent, { passive: true }))
  el.addEventListener('click', onClick, true)

  const later = () =>
    setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => void start(), { timeout: 2000 })
      else void start()
    }, DELAY_AFTER_LOAD_MS)
  if (document.readyState === 'complete') later()
  else window.addEventListener('load', later, { once: true })
}

export default settled
