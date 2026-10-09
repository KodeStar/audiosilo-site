/**
 * Behaviour for ThemedVideo.astro (vanilla, no framework, ~2 KB).
 *
 * One <video> per component; a <source type="video/mp4"> is added lazily for
 * the variant matching the resolved theme, so only that variant ever
 * downloads. (A typed <source>, not a bare src: Safari refuses mp4 served as
 * application/octet-stream, e.g. from GitHub release assets, without it.) On a theme change
 * the src swaps and the playback position carries over. Posters are separate
 * per-theme <img loading="lazy"> layers shown by CSS (`dark:` variant), so the
 * right poster paints before any JS runs and the other one is never fetched.
 *
 * Loop mode: muted + looped, plays only while on screen, never autoplays under
 * prefers-reduced-motion (a play button is offered instead). Nothing is
 * fetched before the page has loaded and the poster has painted, so a loop
 * never competes with the first paint (or with LCP). A missing or
 * broken file leaves the poster (or the neutral placeholder) in place.
 */
import { getResolvedTheme, onThemeChange, type ResolvedTheme } from '@/lib/theme'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

/** Loops wait this long after the load event, so their bytes never compete with the first paint. */
const START_AFTER_LOAD_MS = 1500

/** Resolves once the page has loaded, a moment has passed and the browser is idle. */
const pageSettled = new Promise<void>((resolve) => {
  const idle = () =>
    setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 1500 })
      else resolve()
    }, START_AFTER_LOAD_MS)
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
})

/** Resolves once the visible poster (if any) has loaded, so it paints before any video bytes are asked for. */
function posterReady(root: HTMLElement): Promise<void> {
  const img = [...root.querySelectorAll<HTMLImageElement>('img[data-slot^="poster"]')].find(
    (i) => getComputedStyle(i).display !== 'none',
  )
  if (!img || img.complete) return Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

function init(root: HTMLElement) {
  if (root.dataset.tvReady) return
  root.dataset.tvReady = 'true'

  const video = root.querySelector<HTMLVideoElement>('video')
  if (!video) return
  const button = root.querySelector<HTMLButtonElement>('[data-tv-toggle]')
  const track = video.querySelector<HTMLTrackElement>('track')
  const loop = root.dataset.mode !== 'controls'

  const srcFor = (t: ResolvedTheme) => (t === 'dark' ? root.dataset.srcDark : root.dataset.srcLight) ?? ''
  const posterFor = (t: ResolvedTheme) => (t === 'dark' ? root.dataset.posterDark : root.dataset.posterLight) ?? ''
  const captionsFor = (t: ResolvedTheme) =>
    (t === 'dark' ? root.dataset.captionsDark : root.dataset.captionsLight) ?? ''

  let theme = getResolvedTheme()
  let inView = false
  let userPaused = false // the viewer pressed pause; don't resume on scroll
  let userWantsPlay = false // the viewer pressed play (needed under reduced motion)

  const setState = (state: 'idle' | 'playing' | 'paused' | 'error') => {
    root.dataset.state = state
    if (button) {
      const playing = state === 'playing'
      button.setAttribute('aria-label', playing ? 'Pause video' : 'Play video')
      button.setAttribute('aria-pressed', String(playing))
    }
  }

  let current = '' // the file the <source> points at ('' = nothing loaded yet)
  const source = document.createElement('source')
  source.type = 'video/mp4'
  // A failed <source> reports on itself, not on the <video>.
  source.addEventListener('error', () => setState('error'))

  /** Point the element at the current theme's file (no-op when already there). */
  const ensureSource = () => {
    const src = srcFor(theme)
    if (!src || current === src) return
    const resumeAt = current ? video.currentTime : 0
    const resume = !video.paused
    root.removeAttribute('data-loaded')
    if (track) track.src = captionsFor(theme)
    if (!loop) video.poster = posterFor(theme)
    current = src
    source.src = src
    if (!source.parentNode) video.prepend(source)
    video.load()
    if (resumeAt > 0) {
      video.addEventListener(
        'loadedmetadata',
        () => {
          const d = video.duration
          video.currentTime = Number.isFinite(d) && d > 0 ? resumeAt % d : resumeAt
        },
        { once: true },
      )
    }
    if (resume) play()
  }

  let settled = false
  const play = () => {
    if (root.dataset.state === 'error') return
    if (!settled) return // started again once the page has settled
    ensureSource()
    video.play().catch(() => {
      // Autoplay refused (low-power mode, data saver) or the file is missing:
      // stay on the poster and let the viewer press play.
      if (root.dataset.state !== 'error') setState('paused')
    })
  }

  // Data saver on: never start a loop by itself (the poster stays; the button still plays).
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
  const mayAutoplay = () =>
    loop && inView && !userPaused && ((!reduceMotion.matches && !saveData) || userWantsPlay)

  video.addEventListener('loadeddata', () => root.setAttribute('data-loaded', ''))
  video.addEventListener('playing', () => setState('playing'))
  // Chrome fires 'pause' after 'error' when a play() fails; keep the error.
  video.addEventListener('pause', () => {
    if (root.dataset.state !== 'error') setState('paused')
  })
  video.addEventListener('error', () => setState('error'))

  button?.addEventListener('click', () => {
    if (video.paused) {
      userPaused = false
      userWantsPlay = true
      settled = true // the viewer asked: no need to wait
      play()
    } else {
      userPaused = true
      video.pause()
    }
  })

  onThemeChange((next) => {
    theme = next
    if (track && !current) track.src = captionsFor(theme)
    if (!loop) video.poster = posterFor(theme)
    // Swap only once a file is in use; an idle element stays unloaded.
    if (current) {
      if (root.dataset.state === 'error') setState('idle') // the other variant may exist
      const wasPlaying = !video.paused
      ensureSource()
      if (!wasPlaying && mayAutoplay()) play()
    }
  })

  if (!loop) {
    // Controls mode: ready to play on demand (preload="none": nothing downloads until then).
    settled = true
    ensureSource()
    setState('idle')
    return
  }

  void Promise.all([pageSettled, posterReady(root)]).then(() => {
    settled = true
    if (mayAutoplay()) play()
  })

  setState('idle')
  if (!('IntersectionObserver' in window)) {
    inView = true
    if (mayAutoplay()) play()
    return
  }
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      if (mayAutoplay()) play()
      else if (!inView && !video.paused) video.pause()
    },
    { threshold: 0.25 },
  ).observe(root)

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches && !userWantsPlay && !video.paused) video.pause()
    else if (mayAutoplay()) play()
  })
}

export function initThemedVideos(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-themed-video]').forEach(init)
}
