/**
 * Page behaviour for the whole site (vanilla, loaded once from Base.astro).
 * Everything here is progressive: without JS the page is complete and static.
 *
 * - header: glass background once scrolled
 * - reveal: sections rise in once (`.reveal`)
 * - washes: the cover-colour washes only animate while on screen
 * - pink handoff: `html[data-pink-in-view]` while a pink demo moment
 *   (`[data-pink]`) is visible, so the header pill and the phone mini bar
 *   step back and the view keeps one pink thing
 * - seek bar: the header's reading progress, one segment per `[data-chapter]`
 *   section sized by its height, plus the pillar pages' chapter list
 * - counters: `[data-count]` numbers count up once (static under reduced motion)
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const root = document.documentElement

function header() {
  const el = document.getElementById('site-header')
  if (!el) return
  const update = () => (el.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false')
  update()
  window.addEventListener('scroll', update, { passive: true })
}

function reveals() {
  const items = document.querySelectorAll<HTMLElement>('.reveal')
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
  )
  items.forEach((el) => io.observe(el))
}

function washes() {
  const items = document.querySelectorAll<HTMLElement>('.wash')
  if (!('IntersectionObserver' in window)) return
  const live = new Set<Element>()
  const sync = () =>
    items.forEach((el) => {
      if (live.has(el) && !reduceMotion.matches) el.setAttribute('data-wash-live', '')
      else el.removeAttribute('data-wash-live')
    })
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) live.add(e.target)
      else live.delete(e.target)
    }
    sync()
  })
  items.forEach((el) => io.observe(el))
  reduceMotion.addEventListener('change', sync)
}

function pinkHandoff() {
  const items = document.querySelectorAll<HTMLElement>('[data-pink]')
  const visible = new Set<Element>()
  const bar = document.getElementById('mini-bar')
  let pastHero = false
  const sync = () => {
    root.dataset.pinkInView = visible.size > 0 ? 'true' : 'false'
    if (bar) bar.dataset.show = pastHero && visible.size === 0 ? 'true' : 'false'
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target)
          else visible.delete(e.target)
        }
        sync()
      },
      { threshold: 0.15 },
    )
    items.forEach((el) => io.observe(el))
  }
  const onScroll = () => {
    const next = window.scrollY > window.innerHeight * 0.6
    if (next !== pastHero) {
      pastHero = next
      sync()
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  sync()
}

function seekBar() {
  const bar = document.querySelector<HTMLElement>('[data-seekbar]')
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
  const list = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]'))
  if (!sections.length) return

  let tops: number[] = []
  let heights: number[] = []
  const segs: HTMLElement[] = []
  let tip: HTMLElement | null = null

  if (bar) {
    bar.textContent = ''
    sections.forEach((s, i) => {
      const seg = document.createElement('div')
      seg.className = 'seekbar-seg'
      seg.dataset.index = String(i)
      seg.appendChild(document.createElement('span'))
      seg.addEventListener('click', () =>
        s.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' }),
      )
      bar.appendChild(seg)
      segs.push(seg)
    })
    tip = document.createElement('div')
    tip.className =
      'seekbar-tip rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground shadow-lg'
    bar.appendChild(tip)
    bar.addEventListener('mousemove', (e) => {
      const seg = (e.target as HTMLElement).closest<HTMLElement>('.seekbar-seg')
      if (!seg || !tip) return
      const i = Number(seg.dataset.index)
      tip.textContent = `${i + 1}. ${sections[i].dataset.chapter}`
      const r = bar.getBoundingClientRect()
      const x = Math.min(Math.max(e.clientX - r.left, 70), r.width - 70)
      tip.style.left = `${x}px`
      tip.dataset.show = ''
    })
    bar.addEventListener('mouseleave', () => tip?.removeAttribute('data-show'))
  }

  const measure = () => {
    tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY)
    heights = sections.map((_, i) => {
      const next = i + 1 < sections.length ? tops[i + 1] : document.documentElement.scrollHeight
      return Math.max(1, next - tops[i])
    })
    segs.forEach((seg, i) => seg.style.setProperty('--w', String(heights[i])))
    paint()
  }

  let current = -1
  const paint = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    // The playhead: a third of the way down the viewport, reaching the very
    // end when the page bottoms out.
    const atEnd = window.scrollY >= max - 2
    const pos = atEnd ? Number.MAX_SAFE_INTEGER : window.scrollY + window.innerHeight * 0.33
    let active = 0
    sections.forEach((_, i) => {
      const p = Math.min(1, Math.max(0, (pos - tops[i]) / heights[i]))
      segs[i]?.style.setProperty('--p', p.toFixed(4))
      if (pos >= tops[i]) active = i
    })
    if (active !== current) {
      current = active
      list.forEach((a) => {
        if (Number(a.dataset.chapterLink) === active) a.setAttribute('aria-current', 'true')
        else a.removeAttribute('aria-current')
      })
    }
  }

  let raf = 0
  const schedule = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      paint()
    })
  }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', measure)
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body)
  measure()
}

function counters() {
  const items = document.querySelectorAll<HTMLElement>('[data-count]')
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return
  const fmt = new Intl.NumberFormat('en-GB')
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count)
    const start = performance.now()
    const dur = 1600
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 4)
      el.textContent = fmt.format(Math.round(target * eased))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          io.unobserve(e.target)
          run(e.target as HTMLElement)
        }
      }
    },
    { threshold: 0.6 },
  )
  items.forEach((el) => {
    // Only count numbers that start off screen; anything already visible stays put.
    const r = el.getBoundingClientRect()
    if (r.top > window.innerHeight) {
      el.textContent = '0'
      io.observe(el)
    }
  })
}

header()
reveals()
washes()
pinkHandoff()
seekBar()
counters()
