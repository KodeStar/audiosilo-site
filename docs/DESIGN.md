# audiosilo.app design - Direction B, "After Hours"

Audiobooks are what you play at night, on the commute, in the dark. The site is
cinematic and immersive: deep ink by default, big edge-to-edge media, and colour
pulled from book covers - the player's cover-colour wash and cover `--glow`
turned into the site's atmosphere. Dark is the default (owner decision
2026-10-08) whatever the OS says; light (porcelain with pastel washes) is a
first-class equal one click away, and "Match system" is there for those who
want it.
This supersedes the 2026-07 dark-only/Roboto/waveform brief.

## Tokens

Stacks tokens verbatim (`audiosilo-frontend/STYLEGUIDE.md` section 3) in
`src/styles/global.css`: porcelain `#f5f7fa` / ink-navy `#121c36`; deep ink
`#0a0f1e` / `#e7ebf4`; primary is ink (light) / near-white (dark); `--brand`
`#db2777` / `#ec4f95`; `--brand-ink` for pink text; `--community` violet for
CC BY-SA marks. Site additions: `--glass*`, `--bezel` (device hardware, dark in
both themes), `--wash-o`/`--wash-mix`/`--grain-o` (wash strength per theme),
`--shadow-device`, `--header-h`. `.stage` gives a section the dark tokens in
both themes without `.dark` (the cinema), so media inside still follow the
page theme.

## Theme

The no-flash script in `Base.astro` and `src/lib/theme.ts` agree: no stored
choice (or blocked storage) resolves to **dark** whatever the OS says; a stored
`light` or `dark` wins; a stored `system` follows `prefers-color-scheme` live.
`<html>` ships with `class="dark"` so even a no-JS visit is dark, and the single
`<meta name="theme-color">` is repointed at the resolved background. Stills
(`ThemedImage`) and loops (`ThemedVideo`, `VideoDialog`) follow the resolved
theme, never the OS, so a light-OS visitor who hasn't chosen sees dark media.

Choosing: the header `ThemeMenu` (light / dark / match system) and the sheet's
`ThemeToggle`, plus `MediaThemeSwitch`: a small `glass` pill, "Dark | Light"
with moon/sun, the pressed half a faint foreground fill, never pink. It sits
under the hero stage on Home (right, below the window), under the device trio
on /player and under the console cinema on /server. All of them share
`useThemePreference` / `onPreferenceChange` and stay in step.

**One pink thing per view.** Pink is the demo play button (or the Sponsor
button on /pricing). Links are ink with an underline, never pink. The header
"Try the demo" pill hands the pink back and forth: ink while a `[data-pink]`
element is on screen, pink otherwise (`src/lib/site.ts`). The phone mini bar
hides under the same rule.

## Type

Bricolage Grotesque (display, `opsz` axis), Figtree (text), JetBrains Mono
(code), via `@fontsource-variable/*`. Utilities in global.css:

| Role | Utility | Size |
|---|---|---|
| Mega ("Free.") | `t-mega` | clamp(64px, 15vw, 216px) / .84, 800, -0.055em |
| Hero | `t-hero` | clamp(44px, 7.2vw, 108px) / .92, 780, -0.045em |
| Display (section) | `t-display` | clamp(34px, 4.4vw, 64px) / .98, 750 |
| Title (feature) | `t-title` | clamp(22px, 2.1vw, 30px), 700 |
| Heading | `t-heading` | 19px, 680 |
| Lede | `t-lede` | 17-21px, muted |
| Eyebrow | `t-eyebrow` | 12px caps +0.12em |
| Stat | `t-stat` | display, tabular numbers |

## Motifs

1. **The now-playing wash** (`Wash.astro`, `.wash`): three radial blobs in a
   cover palette (`pal-oz`, `pal-sherlock`, `pal-dracula`, `pal-treasure`,
   `pal-carol` from the showcase/demo covers; `pal-console`, `pal-community`,
   `pal-ember` for the pillars) drift on 38-44 s transform loops, with static
   grain and a fade into the page at the section edges. Animates only while on
   screen; frozen under reduced motion.
2. **The seek bar** (header): one segment per `[data-chapter]` section, sized
   by the section's height (as the player sizes chapters by duration); past
   ink, current filling, upcoming faint. Hover names the chapter, click seeks.
   On pillar pages the same chapters appear as a sticky **chapter list**
   (`ChapterList.astro`) with the live equaliser on the current one.
3. **Press play**: the demo is a big round play button (`PlayLink.astro`)
   with two breathing rings. The home "Try it tonight" panel is the player's
   Now card (`NowCard.astro`) with the bar-style scrubber (`BarScrubber.astro`,
   a pattern, never called a waveform) and typographic covers of the six demo
   books (`DemoCover.astro`).
4. **Devices** (`Device.astro`): one component for every frame - `phone`,
   `tablet` (landscape iPad), `window` (desktop browser; the address bar reads
   `your-server/web` unless told otherwise), `cinema` (the dark mat around the
   server tour) and `card` (a frameless story card, used for the Year in
   listening card, which is a 9:16 crop of the phone capture). Pass the media
   (`still=` or `loop=`, or `aspect=` for slotted content) and the **screen
   opening takes the media's own pixel ratio**, so media always fills it
   exactly: no letterbox bars, no cropping, nothing poking out. The media is
   clipped to the screen radius three ways (overflow, a `clip-path` for
   WebKit's composited video inside 3D transforms, and `border-radius:
   inherit` on the media). `.device` is the size container; `.device-body`
   draws the hardware, so its `cqw` radii scale with the device. Hero stages
   tilt devices in 3D and float the phone; the bento tiles let a window run
   off the tile's edge on purpose (a peek, the frame is cut by the tile, the
   media never leaves the frame).

Performance budget and how it is kept: [PERFORMANCE.md](PERFORMANCE.md).

Motion is transform/opacity only: wash drift, device float, ring pulse, reveal
on scroll, counters (`Counter.astro`, count up once). `prefers-reduced-motion`
turns all of it off; counters render their final value in HTML.

## Components

shadcn (base-nova on Base UI): Button (+ `brand`, `glass`, `xl`, `pill`),
Dialog (`VideoDialog` tours, see Media hosting), Sheet (`MobileNav`), DropdownMenu (`ThemeMenu`),
ToggleGroup (`ThemeToggle` in the sheet), `MediaThemeSwitch` (static, vanilla
`src/lib/theme-switch.ts`), Tabs (`InstallTabs`), Accordion
(`Faq`). Static elsewhere. Media: every image/video is declared once in
`src/data/media.ts`; `ThemedImage` (light/dark stills), `Loop` (ThemedVideo at the
loop's recorded aspect, with its first-frame `/media/<name>-<theme>.webp` poster),
`TourButton`. Availability wording reads from `src/data/status.ts`.

## Pages

- `/` hero (headline, Press play, tilted desktop + floating phone) - bento of
  the three pillars + how they talk - one app, every screen - the admin console
  in the cinema - metadata counters - Try it tonight - Free - Run it tonight.
- `/player`, `/server`, `/metadata`: immersive hero with media, sticky chapter
  list + feature rows (large media, short captions), contextual demo end.
  /server ends with the quiet sponsor line; /player has no donation prompt.
- `/pricing`: "Free. All of it.", four promises, one Sponsor card, other ways
  to help, FAQ.
- `/download`, `/docs/*`, `/privacy`, `404` restyled on the same tokens.

## Media hosting

- **Hero loops** (`public/media/<name>-<theme>.mp4`, about 0.8-1.3 MB each)
  and their first-frame `.webp` posters are committed. `ThemedVideo` keeps
  them lazy: `preload="none"`, poster first, a typed `<source
  type="video/mp4">` is added only once the page has loaded, the visible
  poster has painted and the loop is on screen (IntersectionObserver); only
  the current theme's file is fetched; reduced motion shows the poster and a
  play button.
- **Full tours** are off-repo: `TOUR_BASE` in `src/data/media.ts` (the
  `media-2026-10` release of audiosilo-site, assets `<name>-<theme>.mp4`;
  `PUBLIC_TOUR_BASE=/media/tours` points a local preview at copies). Their
  `.vtt` captions stay on the site (`public/media/tours/`), because a `<track>`
  on a video without `crossorigin` must be same-origin. `VideoDialog` creates
  the `<video>` only while the dialog is open (signed redirect URLs expire
  after an hour), uses a typed `<source>` (Safari won't play
  `application/octet-stream` otherwise) and never sets `crossorigin` (the
  redirects send no CORS headers). If tours move to YouTube, only `media.ts`
  (`TOUR_BASE`/`tourFiles`) and `VideoDialog.tsx` (an embed instead of the
  `<video>`) need to change.
- If a CSP is ever added, `media-src` must allow `https://github.com` and
  `https://release-assets.githubusercontent.com`.
