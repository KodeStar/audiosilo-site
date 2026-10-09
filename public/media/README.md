# Site media contract

Video files for the marketing site live here and are served as-is from
`/media/...` (everything in `public/` is copied verbatim into `dist/`, this
README included). They are NOT processed by Astro, so encode them small
before dropping them in. Stills (screenshots) do not live here: they go in
`src/assets/stills/` and are imported through `astro:assets` so the build
emits responsive webp variants.

Every video exists twice, once per colour theme. `ThemedVideo`
(`src/components/media/ThemedVideo.astro`) and `VideoDialog`
(`src/components/media/VideoDialog.tsx`) pick the variant matching the
resolved theme and swap live when it changes. A missing file is not an
error: the component falls back to the poster, or to a neutral placeholder
box of the same aspect ratio, so nothing shifts.

## Loops (`public/media/`)

Short, silent, seamless loops shown inline (muted, looped, play only while on
screen, never autoplayed under `prefers-reduced-motion`). Recorded 2026-10-08/09
against server v2.0.1; each poster is the loop's first frame, same pixel size.

| Name (`name` prop) | Files | Pixels | Aspect | Length | Shows |
|---|---|---|---|---|---|
| `server` | `server-{light,dark}.{mp4,webp}` | 1600x900 | 16/9 | 24.1 s | Admin console: overview with live listeners, library shelves, a complete series then one with gaps, the match dialog |
| `player-desktop` | `player-desktop-{light,dark}.{mp4,webp}` | 1280x720 | 16/9 | 18.6 s | Web player in a browser: home, Stormlight ghost spines, book page, full player, speed sheet, "Just met" reveal |
| `player-ipad` | `player-ipad-{light,dark}.{mp4,webp}` | 1180x820 (landscape) | 1180/820 | 16.8 s | iPad: home, full player, speed sheet, reveal, ghost spines, a Year in listening card |
| `player-mobile` | `player-mobile-{light,dark}.{mp4,webp}` | 590x1278 | 590/1278 | 16.8 s | Phone: the same beats as the iPad |

The loops and their posters are committed (about 1 MB per loop). Each poster
also has a small variant, `<name>-<theme>-sm.webp` (720 px wide, 300 px for
the phone), offered in a `srcset` so phones fetch the small one; widths are
in `loops` in `src/data/media.ts`. A loop's mp4 is requested only after the
page has loaded and its poster has painted, and only while it is on screen.

## Full tours (off-repo; captions in `public/media/tours/`)

The full tours are too big for the repo. They are assets of the
`media-2026-10` release of audiosilo-site (`TOUR_BASE` in
`src/data/media.ts`), named `<name>-<theme>.mp4`. Only their WebVTT captions
live here, because a `<track>` on a video without `crossorigin` must be
same-origin. Clean takes (no burned-in captions, no title cards):

| Name | Release assets | Captions here | Pixels | Length |
|---|---|---|---|---|
| `server` | `server-{light,dark}.mp4` (the clean encode) | `tours/server-{light,dark}.vtt` | 1920x1080 | 4:35 / 4:36 |
| `player-desktop` | `player-desktop-{light,dark}.mp4` | `tours/player-desktop-{light,dark}.vtt` | 1920x1080 | 3:18 / 3:24 |
| `player-ipad` | `player-ipad-{light,dark}.mp4` | `tours/player-ipad-{light,dark}.vtt` | 1770x1230 | 1:29 |
| `player-mobile` | `player-mobile-{light,dark}.mp4` | `tours/player-mobile-{light,dark}.vtt` | 1080x2338 | 1:24 |

To preview against local copies, put them in `public/media/tours/` (ignored
by git) and build with `PUBLIC_TOUR_BASE=/media/tours`. The dialog shows the
matching loop poster until the tour starts and sizes its box to the tour's
aspect ratio (`tours` in `src/data/media.ts`).

## Stills (`src/assets/stills/`)

Not here: stills are imported through `astro:assets` from
`src/assets/stills/` and declared in `src/data/media.ts`. Each is a light and
dark pair (`<name>-{light,dark}.webp`, web sources resized to at most 2000 px
wide) except `meta-*`, which is dark only because meta.audiosilo.app has no
light theme.
