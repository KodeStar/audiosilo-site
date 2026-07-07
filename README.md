# audiosilo-site

Marketing site for [AudioSilo](https://audiosilo.app), the self-hosted,
multi-platform audiobook player.

Built with [Astro](https://astro.build) (static output) + a couple of React
islands, styled with [Tailwind CSS v4](https://tailwindcss.com). Dark-only, built
to look like the product. Deployed to GitHub Pages on the `audiosilo.app` domain
(see `public/CNAME`).

## Workspace

This is the fifth repo in the `~/dev/audiosilo` multi-repo workspace. Read the
workspace [`../CLAUDE.md`](../CLAUDE.md) and this repo's [`CLAUDE.md`](CLAUDE.md)
before working here. `CLAUDE.md` also documents the session **model-routing**
convention (an orchestrator plus Opus implementers) and the design tokens. The
visual direction lives in [`docs/DESIGN.md`](docs/DESIGN.md).

## Develop

```sh
yarn install
yarn dev          # http://localhost:4321
```

Node 24 (`export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"`), yarn.

## Build / gate

```sh
yarn build && yarn run check   # the gate: build dist/ + astro check (TypeScript)
yarn preview                   # serve the built site locally
```

Use `yarn run check`, not bare `yarn check` (which runs yarn's own lockfile check).

## Structure

```
public/                 static assets: logo.svg, favicons, CNAME, og.png,
                        robots.txt, shot-*.png (pipeline-generated screenshots)
src/
  components/           .astro components + React islands (.tsx)
    home/               home-page sections (Hero, PlatformStrip, HowItWorks,
                        FeatureCards, SelfHosting, Sharing, ManagerTeaser, FinalCta)
    VersionBadge.tsx    React island: latest server release tag (runtime fetch)
  data/features.ts      home-page feature content
  layouts/              Base.astro, DocsLayout.astro
  pages/                index, download, docs/*, privacy, 404
  styles/global.css     Tailwind v4 entry, @theme design tokens, custom CSS
docs/DESIGN.md          the design brief the UI follows
CLAUDE.md               repo guide + model routing + conventions
```

## Deploy

Pushing to `master` runs `.github/workflows/ci.yml`, which builds the site with
Node 20 and publishes `dist/` to GitHub Pages. Keep work on branches until it is
reviewed, since a push to `master` deploys the live site.

## Content sources

Product copy must be true: only claim shipped, live things. The verified fact base
and phrasing guidance for this site live in the workspace
[`../CROSS-REPO.md` section 16](../CROSS-REPO.md). Copy is drawn from the AudioSilo
repositories ([audiosilo-server](https://github.com/KodeStar/audiosilo-server),
[audiosilo-frontend](https://github.com/KodeStar/audiosilo-frontend), and the
private manager). The header version badge fetches the latest server release tag
from the GitHub API at runtime, falling back to a hard-coded value in
`src/components/VersionBadge.tsx`.
