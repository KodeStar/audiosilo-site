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
- **Roboto** via `@fontsource/roboto` (the product's brand font).
- Package manager is **yarn** (`yarn.lock`); Node **24** (workspace
  convention: `export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"`).
- Do not upgrade to Astro 6/7 as a side effect of other work - that's a
  deliberate, separate change.

## Build / gate

```sh
yarn dev          # http://localhost:4321
yarn build        # static site → dist/  (the gate, with check below)
yarn check        # astro check (TypeScript)
yarn preview      # serve the built site locally
```

**Before a change is done, run `yarn build && yarn check`.** CI
(`.github/workflows/ci.yml`) builds with Node 20 and publishes `dist/` to
GitHub Pages on push to **`master`** (not `main`) - pushing to master deploys
the live site, so keep work on branches until it's reviewed.

## Layout

```
public/                 static assets: logo.svg, favicons, CNAME, shot-*.png (generated)
src/
  components/           .astro components + React islands (.tsx)
  data/features.ts      home-page feature/benefit content
  layouts/              Base.astro (+ per-section layouts)
  pages/                index, download, docs/*, privacy
  styles/global.css     Tailwind v4 entry, @theme design tokens, custom CSS
docs/DESIGN.md          the design brief - the visual direction all UI work follows
```

## Conventions

- **Copy must be true.** Only claim shipped, live things; the verified
  fact base and phrasing guidance live in [CROSS-REPO.md §16](../CROSS-REPO.md).
  Current status (2026-07-06): iOS app **live**
  (https://apps.apple.com/us/app/audiosilo/id6783431375), Android **coming
  soon**, web PWA live, manager private (no download CTA), server open source
  under **AGPLv3** (scope license claims to the server). Re-verify before
  upgrading any availability claim.
- **Screenshots are generated, never hand-made.** `shot-*.png` in `public/`
  come from the workspace pipeline (`../store/tools/`, see
  [../SCREENSHOTS.md](../SCREENSHOTS.md)). To change one, fix the capture and
  re-run the pipeline.
- **Design tokens match the product**: pink `#db2777` accent, the player's
  dark navy grays (`#161f2c` / `#1a2331` / `#2c3340`), Roboto, dark-first.
  The full direction is in [docs/DESIGN.md](docs/DESIGN.md) - follow it, don't
  improvise a different look per page.
- **Performance and reach are features**: static HTML first, React islands
  only when needed, every image sized (`width`/`height`), animations behind
  `prefers-reduced-motion`, semantic HTML with visible focus states. The site
  must be excellent on a phone.
- **House style: hyphens, never em dashes** (matches the workspace-wide rule).
- `VersionBadge.tsx` fetches the latest server release tag at runtime; bump
  its `FALLBACK` constant when a server release is cut.
