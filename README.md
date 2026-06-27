# audiosilo-site

Marketing site for [AudioSilo](https://audiosilo.app) — the self-hosted,
multi-platform audiobook player.

Built with [Astro](https://astro.build) (static output) + a couple of React
islands, styled with [Tailwind CSS v4](https://tailwindcss.com). Deployed to
GitHub Pages on the `audiosilo.app` domain (see `public/CNAME`).

## Develop

```sh
yarn install
yarn dev          # http://localhost:4321
```

## Build

```sh
yarn build        # static site → dist/
yarn preview      # serve the built site locally
yarn check        # astro check (TypeScript)
```

## Structure

```
public/                 static assets (images, favicons, CNAME)
src/
  components/           Logo, Header, Footer, Icon, CodeBlock (.astro)
                        VersionBadge, TypedHero (React islands, .tsx)
  data/features.ts      home-page feature content
  layouts/              Base.astro, DocsLayout.astro
  pages/
    index.astro         home (hero + features)
    download.astro      download options (Docker recommended)
    docs/               installation, configuration, reverse-proxy, first-run
    privacy.astro       privacy policy
  styles/global.css     Tailwind v4 entry + custom styles
```

## Deploy

Pushing to `master` runs `.github/workflows/ci.yml`, which builds the site with
Node 20 and publishes `dist/` to GitHub Pages.

## Content sources

Product copy is drawn from the AudioSilo repositories
([audiosilo-server](https://github.com/KodeStar/audiosilo-server),
[audiosilo-frontend](https://github.com/KodeStar/audiosilo-frontend)). The header
version badge fetches the latest server release tag from the GitHub API at
runtime, falling back to a hard-coded value in `src/components/VersionBadge.tsx`.
