/**
 * Behaviour for ThemedVideo.astro (vanilla, no framework, ~2 KB).
 *
 * One <video> per component; its src is set lazily to the variant matching
 * the resolved theme, so only that variant ever downloads. On a theme change
 * the src swaps and the playback position carries over. Posters are separate
 * per-theme <img loading="lazy"> layers shown by CSS (`dark:` variant), so the
 * right poster paints before any JS runs and the other one is never fetched.
 *
 * Loop mode: muted + looped, plays only while on screen, never autoplays under
 * prefers-reduced-motion (a play button is offered instead). A missing or
 * broken file leaves the poster (or the neutral placeholder) in place.
 */
import { getResolvedTheme, onThemeChange, type ResolvedTheme } from '@/lib/theme'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

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

  /** Point the element at the current theme's file (no-op when already there). */
  const ensureSource = () => {
    const src = srcFor(theme)
    if (!src || video.getAttribute('src') === src) return
    const resumeAt = video.currentSrc ? video.currentTime : 0
    const resume = !video.paused
    root.removeAttribute('data-loaded')
    if (track) track.src = captionsFor(theme)
    if (!loop) video.poster = posterFor(theme)
    video.src = src
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

  const play = () => {
    if (root.dataset.state === 'error') return
    ensureSource()
    video.play().catch(() => {
      // Autoplay refused (low-power mode, data saver) or the file is missing:
      // stay on the poster and let the viewer press play.
      if (root.dataset.state !== 'error') setState('paused')
    })
  }

  const mayAutoplay = () => loop && inView && !userPaused && (!reduceMotion.matches || userWantsPlay)

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
      play()
    } else {
      userPaused = true
      video.pause()
    }
  })

  onThemeChange((next) => {
    theme = next
    if (track && !video.getAttribute('src')) track.src = captionsFor(theme)
    if (!loop) video.poster = posterFor(theme)
    // Swap only once a file is in use; an idle element stays unloaded.
    if (video.getAttribute('src')) {
      if (root.dataset.state === 'error') setState('idle') // the other variant may exist
      const wasPlaying = !video.paused
      ensureSource()
      if (!wasPlaying && mayAutoplay()) play()
    }
  })

  if (!loop) {
    // Controls mode: ready to play on demand, nothing downloads until then.
    ensureSource()
    setState('idle')
    return
  }

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
