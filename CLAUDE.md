# CLAUDE.md - AudioSilo marketing site

The public marketing site for AudioSilo at [audiosilo.app](https://audiosilo.app).
Fifth repo in the `~/dev/audiosilo` workspace - read the workspace
[CLAUDE.md](../CLAUDE.md) and [CROSS-REPO.md §16](../CROSS-REPO.md) (the site's
seams with the product repos) before working here.

## Model routing (every session follows this)

Sessions in this repo run a fixed division of labour between models:

- **Fable (the main session) is the orchestrator only.** It owns task
  decomposition, orchestration, design taste/direction, and final QA of every
  delegated piece. It **never writes feature code directly** - it reviews
  diffs, runs the gate, screenshots the result, and sends work back when it
  falls short. Runs at **high** effort (do not escalate to xhigh/max). It may
  write orchestration artifacts itself: this file, docs/DESIGN.md, briefs,
  commit messages.
- **Opus subagents do the implementation.** One subagent per task
  (`model: "opus"`); parallel when tasks touch disjoint files, sequential when
  one depends on another's output. Each subagent gets a self-contained brief
  (files, constraints, acceptance criteria) and must leave `yarn build &&
  yarn check` green for what it touched.
- **Token-hungry chores go to cheaper models** (Sonnet/Haiku): bulk
  copy/feature research across the workspace, screenshot sweeps, link
  checking, log triage. They report findings back; they don't make design
  decisions.

## Stack

- **Astro 5** (static output), **React 19** islands only where interactivity
  needs client JS, **Tailwind CSS v4** (via `@tailwindcss/vite`; tokens live
  in `src/styles/global.css` `@theme`, there is no tailwind.config.js).
- **shadcn** (base-nova on Base UI) for interactive parts. Fonts are the
  product's: **Bricolage Grotesque** (display), **Figtree** (text),
  **JetBrains Mono** (code), latin-only woff2 declared inline in
  `src/layouts/Base.astro` (see docs/PERFORMANCE.md).
- Package manager is **yarn** (`yarn.lock`); Node **24** (workspace
  convention: `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"`).
- Do not upgrade to Astro 6/7 as a side effect of other work - that's a
  deliberate, separate change.
- The full `pink-*` scale is pinned to the product brand in `global.css`
  `@theme` (`pink-600 = #db2777`), so `pink-*` utilities are brand-correct;
  the theme tokens (Stacks/Shelf) are listed in docs/DESIGN.md.

## Build / gate

```sh
yarn dev          # http://localhost:4321
yarn build        # static site → dist/  (the gate, with check below)
yarn run check    # astro check (TypeScript) - note: `yarn run`, since bare
                  # `yarn check` invokes yarn's own lockfile check instead
yarn preview      # serve the built site locally
```

**Before a change is done, run `yarn build && yarn run check`.** CI
(`.github/workflows/ci.yml`) builds with Node 20 and publishes `dist/` to
GitHub Pages on push to **`master`** (not `main`) - pushing to master deploys
the live site, so keep work on branches until it's reviewed.

## Layout

```
public/                 static assets: logo.svg, favicons, CNAME, og.png,
                        media/ (hero loops + posters; tour captions in media/tours,
                        the tours themselves are off-repo, see public/media/README.md)
src/
  assets/stills/        screenshots (webp), via astro:assets
  assets/fonts/         the basic font subsets
  components/           .astro components + React islands (.tsx); media/Device.astro
                        is every device frame
  data/                 links.ts, status.ts (availability), demo.ts (demo library),
                        media.ts (every image/video, TOUR_BASE), install.ts, nav.ts
  layouts/              Base.astro (+ DocsLayout)
  pages/                index, player, server, metadata, pricing, download, docs/*, privacy, 404
  styles/global.css     Tailwind v4 entry, @theme design tokens, custom CSS
docs/DESIGN.md          the design brief - the visual direction all UI work follows
docs/PERFORMANCE.md     the performance budget and how it is kept
```

## Conventions

- **Copy must be true.** Only claim shipped, live things; the verified
  fact base and phrasing guidance live in [CROSS-REPO.md §16](../CROSS-REPO.md).
  Current status (2026-10-09): iOS app **live** on the App Store at **1.2.0**
  (https://apps.apple.com/us/app/audiosilo/id6783431375; never claim 2.0 is
  in the store); the redesigned 2.0 apps for iPhone, iPad and **Android** are
  in **beta** (people ask on Discord); not on Google Play (no Play badge); the
  2.0 web player is live on every v2.0 server and the demo; manager private
  (no download CTA); the server, player, meta tooling and sidecars are open
  source under **AGPLv3** (scope licence claims to those four; the manager is
  private). All of this reads from
  `src/data/status.ts` flags: flip them there, re-verify first.
- **Screenshots are generated, never hand-made.** Stills live in
  `src/assets/stills/` (declared in `src/data/media.ts`, imported via
  `astro:assets` so the build emits responsive `webp` variants - never ship an
  oversized raw PNG from `public/`). They come from the recording tools in
  `../.demo/v2/` (see `../.site-redesign/media/masters/*NOTES.md`). Show them
  through `Device.astro`, which sizes each screen to the still's own ratio.
- **Design tokens match the product** (Stacks/Shelf): porcelain / ink-navy
  light, deep ink dark (the default), brand pink `#db2777` used once per view.
  The full direction is in [docs/DESIGN.md](docs/DESIGN.md) - follow it, don't
  improvise a different look per page.
- **Performance and reach are features**: static HTML first, React islands
  only when needed, every image sized (`width`/`height`), animations behind
  `prefers-reduced-motion`, semantic HTML with visible focus states. The site
  must be excellent on a phone. Budget: Lighthouse mobile >= 90 and LCP
  < 2.5 s on `/`, `/player`, `/server` ([docs/PERFORMANCE.md](docs/PERFORMANCE.md)).
- **House style: hyphens, never em dashes** (matches the workspace-wide rule).
- `VersionBadge.tsx` fetches the latest server release tag at runtime; bump
  `SERVER_VERSION` in `src/data/status.ts` (its fallback) when a server
  release is cut.
