# Performance budget

The site must be quick on a mid-range phone on a slow connection. The budget,
checked before a change that touches layout, media, fonts or scripts ships:

- **Lighthouse mobile performance >= 90** on `/`, `/player`, `/server`
  (also watch `/metadata` and `/pricing`).
- **LCP < 2.5 s** under Lighthouse's default mobile throttling (simulated
  slow 4G: 150 ms RTT, about 1.6 Mbps, 4x CPU).
- **CLS < 0.1**, **TBT < 200 ms**.

## How to measure

```sh
yarn build && yarn preview          # http://localhost:4321
npx lighthouse@12 http://localhost:4321/ --only-categories=performance \
  --chrome-flags="--headless=new"   # default = mobile; run 3x, take the median
```

`astro preview` serves gzip, like GitHub Pages. For the light theme, run
with a Chrome profile whose localStorage holds `theme=light` and
`--disable-storage-reset` (seed it from a plain file such as `/robots.txt`
so no page asset is cached).

## Results (2026-10-09, median of 3, dark, `yarn preview`)

| Page | Perf | LCP | CLS | TBT | Transfer |
|---|---|---|---|---|---|
| `/` | 98 | 2.33 s | 0 | 0 ms | 2.0 MB (1.6 MB of it the two hero loops, fetched after load) |
| `/player` | 99 | 2.18 s | 0.009 | 0 ms | 2.0 MB (loop after load) |
| `/server` | 99 | 2.03 s | 0 | 0 ms | 1.5 MB (loop after load) |
| `/metadata` | 99 | 2.18 s | 0 | 0 ms | 0.4 MB |
| `/pricing` | 100 | 1.50 s | 0 | 0 ms | 0.3 MB |

Light theme (one run each) lands within 0.1 s of these.

## What keeps it there

- **Hero text paints without JS.** Each page's first section rises in with
  a CSS animation from the first frame (`main > section:first-of-type
  .reveal`); below the fold, `.reveal` still waits for the observer in
  `src/lib/site.ts`, which itself starts after the first paint.
- **One inline stylesheet** (`build.inlineStylesheets: 'always'`): nothing
  render-blocking in front of the first paint.
- **Fonts**: woff2, latin only, `font-display: swap`, declared inline in
  `Base.astro`. Bricolage Grotesque and Figtree each have a small "basic"
  face (ASCII plus the punctuation the copy uses; 54 KB and 13 KB) in
  `src/assets/fonts/`, with fontsource's full latin face behind a
  `unicode-range` for any other character (no current page needs it). The
  Bricolage basic face is preloaded (headlines are often the LCP). JetBrains
  Mono is added two seconds after `load`: code is never above the fold.
  Rebuild a basic face with fonttools:

  ```sh
  pyftsubset node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2 \
    --unicodes="U+0020-007E,U+00A0,U+00A9,U+00B7,U+00BD,U+00D7,U+2013-2014,U+2018-201D,U+2022,U+2026" \
    --layout-features='*' --flavor=woff2 --output-file=src/assets/fonts/bricolage-grotesque-basic-opsz.woff2
  ```

  (the same for `figtree-latin-wght-normal.woff2` ->
  `figtree-basic-wght.woff2`; keep `BASIC` in `Base.astro` in step).
- **Images**: every still goes through `astro:assets` (webp, `srcset` +
  `sizes`, width/height set). Above the fold, only the capture for the theme
  being shown is promoted to `eager` + `fetchpriority=high` (a tiny inline
  script next to the pair); the other theme's file is never fetched.
- **Loops**: posters have a small variant in a `srcset`; the mp4 is
  requested only after `load` + 1.5 s + idle, once the visible poster has
  painted, only while on screen, and never by itself under reduced motion or
  data saver. See docs/DESIGN.md "Media hosting".
- **Islands**: the header's theme menu and mobile menu, the version badge and
  the tour buttons hydrate with `client:settled` (`src/lib/client-settled.ts`):
  after load and a moment of idle, or at once when the visitor reaches for
  them (a click that lands first is replayed). The install tabs and the FAQ
  use `client:visible`. React never competes with the LCP.
- **Device frames never shift**: every screen opening has the media's
  aspect ratio before anything loads.
