# AudioSilo marketing site - design brief (2026-07 redesign)

Owner: the orchestrator session (design taste is not delegated). Implementers
follow this brief; deviations need a reason recorded here.

## The one-line concept

**The site looks like the product.** AudioSilo's player is a deep-navy,
pink-accented, dark-first app - the current light-grey template site looks
nothing like it. The redesign makes the marketing site feel like you already
opened the app: dark, cinematic, confident, with the real UI as the hero.

Tagline direction (from the verified copy research): lead with ownership.
Primary headline: **"Your audiobooks. Your server. Every device."**
Supporting voice: plain, benefit-first, technically specific, zero hype
adjectives. British-neutral English. Hyphens, never em dashes.

## Palette (mirror the product tokens - do not invent new brand colors)

| Token | Value | Use |
|---|---|---|
| `bg-deep` | `#0b111b` | page background (one step darker than the app for depth) |
| `bg-surface` | `#161f2c` | cards, panels (app gray-860) |
| `bg-raised` | `#1a2331` | raised cards, code blocks (app gray-840) |
| `border-subtle` | `#2c3340` | hairline borders (app gray-750) |
| `primary` | `#db2777` | THE accent: CTAs, links, highlights (pink-600) |
| `primary-bright` | `#ec4899` | hover, gradient stops, glow (pink-500) |
| `text-hi` | `#f3f4f6` | headings (gray-100) |
| `text-body` | `#d1d5db` | body (gray-300) |
| `text-dim` | `#9ca3af` | captions, meta (gray-400) |
| `success` | `#22c55e` | "Available now" badges only |

Rules:
- Dark-only. No light mode, no theme toggle - commit to the cinematic look.
- Pink is an accent, not a paint bucket: roughly one pink moment per viewport.
  Large pink areas only in the final CTA band.
- Depth comes from layered navy + soft radial glows (pink/indigo at 8-15%
  opacity behind heroes and screenshots), never from heavy borders.
- Contrast: body text >= AA on its background; `text-dim` only for
  non-essential text at 16px+.

## Typography

- **Roboto everywhere** (brand font, already vendored via @fontsource).
  Weights: 300 (display accents), 400 (body), 500 (UI/nav), 700 (headings),
  900 (hero display).
- Hero display: huge and tight - `clamp(2.75rem, 7vw, 5.5rem)`, weight 900,
  tracking -0.02em, line-height 0.95-1.05. Section headings ~2-2.5rem/700.
- Body 1.0625rem, line-height 1.7, max width ~65ch.
- One gradient-text moment on the page maximum (the hero keyword), via a
  pink-500 -> pink-600 gradient clip.

## Signature motif: the waveform

An audio product should feel audible. One motif, used consistently:
- Thin vertical-bar waveform strips as section punctuation (inline SVG,
  generated bars of varying height, `border-subtle` colored with a few pink
  bars near the center).
- The hero gets the animated version: a row of bars gently oscillating
  (CSS `transform: scaleY` keyframes, staggered delays, GPU-cheap). Static
  under `prefers-reduced-motion`.
- A small animated 3-bar "equalizer" glyph can mark "now playing" touches
  (e.g. in the fake player card). Same reduced-motion rule.

## Page architecture (index)

1. **Nav** - slim, transparent over the hero, backdrop-blur + border on
   scroll. Logo + wordmark left (logo NOT rotated 180 - display it as
   designed); links: Features, How it works, Download, Docs (external,
   docs.audiosilo.app), Demo (pink-tinted pill), GitHub icon.
2. **Hero** - dark with a soft radial pink/indigo glow. Overline chip
   ("Open source (AGPLv3 server) - self-hosted - no subscription"), the big
   headline, one-sentence sub, two CTAs: primary "Get started" (-> /download),
   secondary "Try the live demo" (demo.audiosilo.app). Below: the real
   desktop screenshot (`/shot-desktop.png`) large, slight perspective lift,
   pink-tinted drop shadow glow; the phone screenshot (`/shot-phone.png`)
   overlapping its right edge. Animated waveform strip under the fold.
3. **Platform strip** - compact badge row: App Store (LIVE - real badge link
   to https://apps.apple.com/us/app/audiosilo/id6783431375), Web PWA
   "available now", Android "coming soon" (visibly muted), Docker + native
   binaries for the server. Honest availability, at a glance.
4. **"How it works" - 3 steps.** 1) Run the server (docker compose snippet,
   copy button, "or download a single binary"); 2) Invite your devices (QR /
   invite-link pairing - show the connect-page screenshot or a stylized QR
   card); 3) Listen everywhere (sync/offline). Steps joined by a thin
   waveform/progress line.
5. **Feature groups** - the strongest 6-8 benefits as cards on `bg-surface`
   with icon chips: offline downloads, sleep timer + shake-to-cancel,
   bookmarks/notes, speed control, chapter-aware lock screen, sync,
   search-at-any-size, PWA. Source copy from the verified research doc only.
6. **Self-hosting section** ("Built to face the internet") - split layout:
   left, terminal-style card (first-run banner aesthetic) listing secure
   defaults (no default passwords, rate limiting + lockout, argon2id, TLS
   modes); right, benefit copy: filesystem is the source of truth, zero-wait
   first connect, messy-library auto-detection, progress survives renames.
7. **Sharing / family** - shares scoped to a folder/author/series, per-user
   progress, invite links. Can reuse the admin "shares" screenshot from the
   docs pipeline if it composites cleanly; otherwise typographic.
8. **Manager teaser** ("Bring your Audible library home - coming soon") -
   one restrained band: back up the audiobooks you own to your own server
   (DRM removed with your own account keys, personal use). No download CTA
   (private repo). Clearly badged "in development".
9. **Final CTA band** - the one big pink moment (gradient band or pink-tinted
   panel): "Ready to own your audiobook library?" + Get started / Read the
   docs. Footer: link columns (Product / Resources / Community), logo,
   AGPLv3 note for the server, privacy link, kode@audiosilo.app.

## Secondary pages

- **/download** - same dark system. Tabs or stacked sections: Docker
  (recommended, compose snippet + copy button), native binaries (links to
  GitHub releases; VersionBadge shows latest), then the apps: iOS (LIVE -
  App Store badge), Web player (point at your server's /web + demo), Android
  (coming soon). Keep the existing accurate env-var guidance.
- **/docs/*** (installation, configuration, reverse-proxy, first-run) -
  restyled dark: readable long-form column (~70ch), sticky side nav on
  desktop, `.docs-content` typography converted to the dark palette, code
  blocks on `bg-raised` with copy buttons. Content stays accurate; light
  copy-editing only.
- **/privacy** - dark restyle of the existing policy, content unchanged.
- **404** - small, on-brand ("This chapter doesn't exist"), link home.

## Motion rules

- Scroll-reveal: sections fade/rise 12-16px once, via IntersectionObserver
  adding a class; CSS transitions 400-600ms ease-out. Never re-animate on
  re-scroll. Fully disabled under `prefers-reduced-motion`.
- Hero waveform + equalizer glyphs are the only perpetual animations.
- Hover: subtle (translateY(-2px), border brightening, glow intensify).
- No parallax libraries, no scroll-jacking, no JS animation frameworks.

## Engineering constraints

- Astro static output; React islands ONLY where state is needed (VersionBadge
  stays; copy-to-clipboard can be vanilla JS in an inline module).
- Ship zero new runtime dependencies without a strong reason. typed.js may be
  dropped if the hero no longer types (prefer a static headline with a
  gradient keyword - more confident than a typing gimmick).
- Every `<img>` has width/height and lazy loading below the fold; hero image
  eager + `fetchpriority="high"`.
- Semantic landmarks (header/main/section/footer), one h1, focus-visible
  styles, skip link. Keyboard-checkable nav.
- OG/meta: proper title/description per page + a generated OG image
  (1200x630, dark, logo + tagline) in `public/og.png`.
- `yarn build && yarn check` green; no console errors on any page.

## What NOT to do

- No store badge for Google Play (not live). No manager download CTA.
- No blanket "fully open source" claim - scope AGPLv3 to the server.
- No em dashes anywhere. No lorem ipsum. No stock photos - the only imagery
  is the real product UI and generated graphic elements.
- Do not hand-edit `public/shot-*.png` (pipeline-generated).
